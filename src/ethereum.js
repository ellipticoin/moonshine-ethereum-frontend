import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ERC20 } from "./contracts";
import { useRouterAddress, ROUTER } from "./contracts";

const {
  BigNumber,
  utils: { formatUnits },
} = ethers;

export function useTokenBalance(token, address) {
  const inputBalance = useQueryEth(async () => {
    return token && ERC20.attach(token.address).balanceOf(address);
  }, [token, address]);
  const decimals = useQueryEth(async () => {
    return token && ERC20.attach(token.address).decimals();
  }, [token]);
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

export function useTimestamp(nonce) {
  const routerAddress = useRouterAddress();
  const currentBlockTimestamp = useQueryEth(
    async () =>
      routerAddress &&
      (await ROUTER.attach(routerAddress).currentBlockTimestamp()),
    [nonce, routerAddress]
  );
  const [secondsSinceLoad, setSecondsSinceLoad] = useState(0n);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceLoad(secondsSinceLoad + 1n);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsSinceLoad]);
  useEffect(() => {
    setSecondsSinceLoad(0n);
  }, [currentBlockTimestamp]);
  if (currentBlockTimestamp) {
    return currentBlockTimestamp + secondsSinceLoad;
  } else {
    return null;
  }
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

export function useQueryEth(f, dependencies = []) {
  const [returnValue, setReturnValue] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    f().then((returnValue, a) => {
      if (!isCancelled) {
        setReturnValue(convertToNative(returnValue));
      }
    });
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  return returnValue;
}

function convertToNative(value) {
  if (BigNumber.isBigNumber(value)) {
    return BigInt(value.toString());
  } else {
    return value;
  }
}

export function useMetaMaskIsConnected() {
  const [ethereumAccountsLoading, ethereumAcccounts] = useEthereumAccounts();
  const [chainIdLoading, chainId] = useChainId();
  return [
    ethereumAccountsLoading || chainIdLoading,
    ethereumAcccounts &&
      ethereumAcccounts.length > 0 &&
      ["0x4", "0x66eeb", "0x13881"].includes(chainId),
  ];
}

export function useChainId() {
  const [chainId, setChainId] = useState([true]);
  useEffect(() => {
    async function fetchChainId() {
      if (window.ethereum) {
        setChainId([
          false,
          await window.ethereum.request({ method: "eth_chainId" }),
        ]);
      }
    }
    fetchChainId();
    window.ethereum.on("chainChanged", fetchChainId);
  }, []);
  return chainId;
}

export function useEthereumAccounts() {
  const [ethereumAccounts, setEthereumAccounts] = useState([true]);
  useEffect(() => {
    async function fetchEthereumAccounts() {
      if (window.ethereum) {
        setEthereumAccounts([
          false,
          await window.ethereum.request({ method: "eth_accounts" }),
        ]);
      }
    }
    fetchEthereumAccounts();
    window.ethereum.on("accountsChanged", fetchEthereumAccounts);
  }, []);
  return ethereumAccounts;
}

export async function ethRequestAccounts() {
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
  return window.ethereum.request({ method: "eth_requestAccounts" });
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
