import { ethers } from "ethers";

const {
  utils: { parseUnits },
} = ethers;
export async function getGasPrice(priority) {
  const response = await fetch("https://gasstation-mainnet.matic.network/");
  const json = await response.json();
  return parseUnits(json[priority].toString(), "gwei");
}
