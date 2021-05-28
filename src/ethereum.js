import { useState, useEffect } from "react";
import { ethers } from "ethers";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";

const { hexlify, parseUnits } = ethers.utils;

export function useEthereumAccounts() {
  const [ethereumAccounts, setEthereumAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchEthereumAccounts() {
      if (window.ethereum) {
        setEthereumAccounts(
          await window.ethereum.request({ method: "eth_accounts" })
        );
        window.ethereum.on("accountsChanged", setEthereumAccounts);
      }

      setLoading(false);
    }
    fetchEthereumAccounts();
  }, []);
  return [loading, ethereumAccounts];
}

export async function sendETH({ to, value }) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const tx = await signer.sendTransaction({
    to: await signer.resolveName(to),
    value: parseUnits(value, 18),
  });
  return tx.wait();
}

export async function sendTokens({ token, to, value }) {
  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const tokenAddress = hexlify(Buffer.from(token, "base64"));
  const tokenContract = new ethers.Contract(
    tokenAddress,
    ERC20JSON.abi,
    signer
  );
  const decimals = await tokenContract.decimals();
  const tx = await tokenContract.transfer(to, parseUnits(value, decimals));
  return tx.wait();
}

export async function ethRequestAccounts() {
  await window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: "0x8376940B1DB0",
        chainName: "Arbitrum Testnet V5",
        rpcUrls: ["https://kovan5.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://explorer5.arbitrum.io/#/"],
      },
    ],
  });
  return window.ethereum.request({ method: "eth_requestAccounts" });
}
