import { ethers } from "ethers";
import AMMABI from "./abis/AMMABI.json";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";

const {
  constants: { AddressZero },
} = ethers;

export const SIGNER = new ethers.providers.Web3Provider(
  window.ethereum,
  "any"
).getSigner();
export const AMM = new ethers.Contract(
  process.env.REACT_APP_AMM_ADDRESS,
  AMMABI,
  SIGNER
);

export const PROVIDER = SIGNER.provider;
export const ERC20 = new ethers.Contract(AddressZero, ERC20JSON.abi, SIGNER);
export const MSX = new ethers.Contract(
  process.env.REACT_APP_MOONSHINE_TOKEN_ADDRESS,
  ERC20JSON.abi,
  SIGNER
);
export const USDC = new ethers.Contract(
  process.env.REACT_APP_USDC_ADDRESS,
  ERC20JSON.abi,
  SIGNER
);
export const DECIMALS = 6;
