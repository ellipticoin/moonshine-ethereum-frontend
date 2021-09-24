import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { ERC20 } from "./contracts";
import {
  CHAIN_INFO,
  POLYGON_CHAIN_ID,
  POLYGON_PROVIDER,
  SIGNER,
} from "./constants";
import { useInterval } from "./helpers";
import { AMM, PROVIDER } from "./contracts";

const {
  BigNumber,
  utils: { formatUnits, getAddress, id },
  constants: { AddressZero },
} = ethers;

window.subscriptions = [];

export function useTokenBalance(tokenAddress, address) {
  const inputBalance = useQueryEth(async () => {
    return tokenAddress && ERC20.attach(tokenAddress).balanceOf(address);
  }, [tokenAddress, address]);
  const decimals = useQueryEth(async () => {
    return tokenAddress && ERC20.attach(tokenAddress).decimals();
  }, [tokenAddress]);
  if (inputBalance) {
    return formatUnits(inputBalance, decimals);
  }
}

export function useBlockNumber() {
  const [blockNumber, setBlockNumber] = useState();
  useEffect(() => {
    let isCancelled = false;
    let subscriptionId;
    window.ethereum
      .request({ method: "eth_blockNumber", params: [] })
      .then((blockNumber) => {
        if (!isCancelled) {
          setBlockNumber(convertToNative(BigNumber.from(blockNumber)));
        }
      });
    window.ethereum
      .request({ method: "eth_subscribe", params: ["newHeads", {}] })
      .then((newSubscriptionId) => {
        subscriptionId = newSubscriptionId;
      });
    window.ethereum.on("message", ({ data }) => {
      console.log(data.result);
      setBlockNumber(convertToNative(BigNumber.from(data.result.number)));
    });
    return () => {
      window.ethereum.request({
        method: "eth_unsubscribe",
        params: [subscriptionId],
      });
      isCancelled = true;
    };
  }, []);
  return blockNumber;
}

export function useTimestamp() {
  let [secondsSinceLoad, setSecondsSinceLoad] = useState(0n);
  useInterval(() => {
    setSecondsSinceLoad(secondsSinceLoad + 1n);
  }, 1000);
  const currentBlockTimestamp = useQueryEth(
    AMM,
    async (contract) => contract.currentBlockTimestamp(),
    [],
    [id("Harvest(address,int64)")]
  );

  return currentBlockTimestamp
    ? secondsSinceLoad + currentBlockTimestamp
    : null;
}

export function useEthCallback(f) {
  const [loading, setLoading] = useState(true);
  setLoading(true);
  async function run() {
    await f();
    setLoading(false);
  }
  try {
    run();
  } catch (err) {
    if (err.message) alert(err.message);
    setLoading(false);
  }
  return loading;
}

function convertToNative(value) {
  if (BigNumber.isBigNumber(value)) {
    return BigInt(value.toString());
  } else {
    return value;
  }
}

export function useMetaMaskIsConnected() {
  const ethereumAcccounts = useEthereumAddress();
  const chainId = useChainId();
  return (
    ethereumAcccounts &&
    ethereumAcccounts.length > 0 &&
    chainId === POLYGON_CHAIN_ID
  );
}

export function useChainId() {
  const [chainId, setChainId] = useState(null);
  useEffect(() => {
    if (!window.ethereum) return;
    async function fetchChainId() {
      if (window.ethereum) {
        setChainId(await window.ethereum.request({ method: "eth_chainId" }));
      }
    }
    fetchChainId();
    window.ethereum.on("chainChanged", (chainId) => {
      setChainId(chainId);
    });
  }, []);

  return chainId;
}

export function useEthereumAddress() {
  const [ethereumAddress, setEthereumAddress] = useState();
  useEffect(() => {
    if (!window.ethereum) return;
    async function fetchEthereumAddress() {
      if (window.ethereum) {
        setEthereumAddress(
          (await window.ethereum.request({ method: "eth_accounts" })).map(
            getAddress
          )[0]
        );
      }
    }
    fetchEthereumAddress();
    window.ethereum.on("accountsChanged", (accounts) =>
      setEthereumAddress(accounts.map(getAddress)[0])
    );
  }, []);
  return ethereumAddress;
}
export async function switchChain(chainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        console.log("ya");
        console.log(CHAIN_INFO[chainId].params);
        console.log(
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [CHAIN_INFO[chainId].params],
          })
        );
        console.log("done");
      } catch (addError) {
        console.log("err");
        console.log(addError);
      }
    }
  }
  await ethRequestAccounts();
}

export async function ethRequestAccounts() {
  return window.ethereum.request({ method: "eth_requestAccounts" });
}

export function addListener(provider, filter, f) {
  if (
    window.ethereumListeners &&
    window.ethereumListeners[JSON.stringify(filter)]
  ) {
    return window.ethereumListeners[JSON.stringify(filter)].push(f);
  } else {
    window.ethereumListeners[JSON.stringify(filter)] = [f];
    provider.on(filter, (result) => {
      window.ethereumListeners[JSON.stringify(filter)].map((f) => f(result));
    });
  }
}
export function removeListener(filter, listenerId) {
  if (filter) {
    window.ethereumListeners[JSON.stringify(filter)].splice(listenerId, 1);
  }
  if (window.ethereumListeners[JSON.stringify(filter)].length === 0) {
    PROVIDER.off(filter);
  }
}

export function useQueryEth(contract, f, dependencies = [], topics) {
  const [returnValue, setReturnValue] = useState(null);
  const chainId = useChainId();
  const provider =
    chainId === POLYGON_CHAIN_ID ? SIGNER.provider : POLYGON_PROVIDER;

  useEffect(() => {
    if (contract.address === AddressZero) {
      setReturnValue(undefined);
      return null;
    }
    let filter,
      listener,
      listenerId,
      isCancelled = false;
    async function subscribeToEvents() {
      filter = {
        address: contract.address,
        topics,
      };
      listener = async (result) => {
        while ((await provider.getBlock()) < result.blockNumber + 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        try {
          f(contract.attach(contract.address)).then((newReturnValue) => {
            updateReturnValue(
              isCancelled,
              setReturnValue,
              returnValue,
              newReturnValue
            );
          });
        } catch (e) {
          console.log(e);
        }
      };
      listenerId = addListener(contract.provider, filter, listener);
    }
    if (topics) {
      subscribeToEvents();
    }
    f(contract.attach(contract.address)).then((newReturnValue) => {
      updateReturnValue(
        isCancelled,
        setReturnValue,
        returnValue,
        newReturnValue
      );
    });
    return () => {
      isCancelled = true;
      if (filter) {
        removeListener(filter, listenerId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, contract.address, ...dependencies]);
  return returnValue;
}

export function updateReturnValue(
  isCancelled,
  setReturnValue,
  returnValue,
  newReturnValue
) {
  if (!isCancelled) {
    if (newReturnValue.length) {
      const oldReturnValue = returnValue || {};
      const newObject = Object.fromEntries(
        Object.keys(newReturnValue)
          .filter((key) => isNaN(key))
          .map((key, index) => [key, convertToNative(newReturnValue[key])])
      );

      setReturnValue({ ...oldReturnValue, ...newObject });
    } else {
      setReturnValue(convertToNative(newReturnValue));
    }
  }
}
