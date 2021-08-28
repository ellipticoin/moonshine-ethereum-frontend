import { ethers } from "ethers";
import AMMABI from "./abis/AMMABI.json";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { POLYGON_BRIDGE_ADDRESS } from "./constants";
import { Token, ChainId } from "quickswap-sdk";

const {
  constants: { AddressZero },
} = ethers;

export const SIGNER = window.ethereum
  ? new ethers.providers.Web3Provider(window.ethereum, "any").getSigner()
  : new ethers.providers.JsonRpcProvider("https://rpc-mainnet.matic.network");

export const POLYGON_BRIDGE = new ethers.Contract(
  POLYGON_BRIDGE_ADDRESS,
  ["function depositEtherFor(address _to) payable"],
  SIGNER
);
export const AMM = new ethers.Contract(
  process.env.REACT_APP_AMM_ADDRESS,
  AMMABI,
  SIGNER
);

window.ethereumListeners = {};
export const PROVIDER = SIGNER.provider;
export const ERC20 = new ethers.Contract(AddressZero, ERC20JSON.abi, SIGNER);
export const MSX = new ethers.Contract(
  process.env.REACT_APP_MOONSHINE_TOKEN_ADDRESS,
  ERC20JSON.abi,
  SIGNER
);
export const ETH = new Token(ChainId.MAINNET, AddressZero, 18);
export const USDC = new ethers.Contract(
  process.env.REACT_APP_USDC_ADDRESS,
  ERC20JSON.abi,
  SIGNER
);
export const DECIMALS = 6;
