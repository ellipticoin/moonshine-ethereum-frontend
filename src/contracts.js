import { ethers } from "ethers";
import AMMABI from "./abis/AMMABI.json";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { POLYGON_PROVIDER, SIGNER } from "./constants";

const {
  constants: { AddressZero },
} = ethers;

export const AMM = new ethers.Contract(
  process.env.REACT_APP_AMM_ADDRESS,
  AMMABI,
  POLYGON_PROVIDER
);

export const MOONSHINE_BRIDGE = new ethers.Contract(
  "0x0000000000000000000000000000000000000001",
  ["function createWithdrawlRequest(int64 underlyingAmount, address token)"],
  SIGNER
);

export const MOONSHINE_AMM = new ethers.Contract(
  "0x0000000000000000000000000000000000000000",
  [
    "function buy(int64 amount, address token, int64 minimumOutputAmount)",
    "function sell(int64 amount, address token, int64 minimumOutputAmount)",
    "function addLiquidity(int64 amount, address token)",
    "function removeLiquidity(int64 percentage, address token)",
    "function createPool(int64 amount, address token, int64 initialPrice)",
  ],
  SIGNER
);

window.ethereumListeners = {};
export const PROVIDER = SIGNER.provider;
export const ERC20 = new ethers.Contract(
  AddressZero,
  ERC20JSON.abi,
  POLYGON_PROVIDER
);
export const MSX = new ethers.Contract(
  process.env.REACT_APP_MOONSHINE_TOKEN_ADDRESS,
  ERC20JSON.abi,
  POLYGON_PROVIDER
);
export const USDC = new ethers.Contract(
  process.env.REACT_APP_USDC_ADDRESS,
  ERC20JSON.abi,
  POLYGON_PROVIDER
);
export const DECIMALS = 6;
