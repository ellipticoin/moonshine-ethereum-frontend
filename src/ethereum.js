import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ERC20 } from "./contracts";
import { POLYGON_CHAIN_ID } from "./constants";
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
  const ethereumAcccounts = useEthereumAccounts();
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

export function useEthereumAccounts() {
  const [ethereumAccounts, setEthereumAccounts] = useState();
  useEffect(() => {
    if (!window.ethereum) return;
    async function fetchEthereumAccounts() {
      if (window.ethereum) {
        setEthereumAccounts(
          (await window.ethereum.request({ method: "eth_accounts" })).map(
            getAddress
          )
        );
      }
    }
    fetchEthereumAccounts();
    window.ethereum.on("accountsChanged", (accounts) =>
      setEthereumAccounts(accounts.map(getAddress))
    );
  }, []);
  return ethereumAccounts;
}
export async function switchChain(chainId) {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId }],
  });
}
export async function switchToPolygon(address) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x89" }],
    });
  } catch (switchError) {
    if (switchError.code === 4902 || switchError.code === -32603) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x89",
              chainName: "Matic(Polygon) Mainnet",
              nativeCurrency: {
                name: "Matic",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: ["https://polygon.moonshine.exchange/"],
              blockExplorerUrls: ["https://polygonscan.com"],
            },
            address,
          ],
        });
      } catch (addError) {}
    }
  }
  await ethRequestAccounts();
}

export async function ethRequestAccounts() {
  return window.ethereum.request({ method: "eth_requestAccounts" });
}

export function addListener(filter, f) {
  if (
    window.ethereumListeners &&
    window.ethereumListeners[JSON.stringify(filter)]
  ) {
    return window.ethereumListeners[JSON.stringify(filter)].push(f);
  } else {
    window.ethereumListeners[JSON.stringify(filter)] = [f];
    PROVIDER.on(filter, (result) => {
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

  useEffect(() => {
    if (chainId !== POLYGON_CHAIN_ID) {
      setReturnValue(undefined);
      return null;
    }
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
        while ((await contract.provider.getBlock()) < result.blockNumber + 1) {
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
      listenerId = addListener(filter, listener);
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
    // console.log(newReturnValue)
    // console.log(newReturnValue.length)
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

export async function ethSwitchChain(chainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x66eeb",
              chainName: "ArbRinkeby",
              rpcUrls: ["https://rinkeby.arbitrum.io/rpc"],
              blockExplorerUrls: ["https://rinkeby-explorer.arbitrum.io'"],
            },
          ],
        });
      } catch (addError) {
        // handle "add" error
      }
    }
    // handle other "switch" errors
  }
}
