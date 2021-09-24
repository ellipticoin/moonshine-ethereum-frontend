import logo from "./logo-blue.svg";
import { ethers } from "ethers";
const {
  utils: { hexlify },
} = ethers;
export const PROD = true//process.env.NODE_ENV === "production";
export const MOONSHINE_CHAIN_ID = hexlify(
  parseInt(process.env.REACT_APP_MOONSHINE_CHAIN_ID)
);
export const BRIDGE_ADDRESS = process.env.REACT_APP_BRIDGE_ADDRESS;
export const SAFE_ADDRESS = process.env.REACT_APP_SAFE_ADDRESS;
export const BOOTNODES = PROD ? ["jimbo.moonshine.exchange"] : ["localhost:80"];
export const BASE_TOKEN_DECIMALS = 6;
export const DECIMALS = 6;
export const MAX_SLIPPAGE = 1000n;
export const BASE_TOKEN_MANTISSA = 6n;
export const EXCHANGE_RATE_MANTISSA = 10n;
export const DEFAULT_FEE = 3000n;
export const BASE_FACTOR = 1000000n;
export const MOONSHINE_DECIMALS = 6;
export const POLYGON_CHAIN_ID = "0x89";
export const ETHEREUM_CHAIN_ID = "0x1";
export const POLYGON_PROVIDER = new ethers.providers.JsonRpcProvider(
  "https://polygon.moonshine.exchange/"
);
export const SIGNER = window.ethereum
  ? new ethers.providers.Web3Provider(window.ethereum, "any").getSigner()
  : POLYGON_PROVIDER;
export const CHAIN_INFO = {
  [POLYGON_CHAIN_ID]: {
    name: "Polygon",
    params: {
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
  },
  [MOONSHINE_CHAIN_ID]: {
    name: "Moonshine",
    params: {
      chainId: MOONSHINE_CHAIN_ID,
      chainName: "Moonshine",
      nativeCurrency: {
        name: "Compound USDC",
        symbol: "USD",
        decimals: 18,
      },
      rpcUrls: [`https://${BOOTNODES[0]}/`],
    },
  },
  [ETHEREUM_CHAIN_ID]: {
    name: "Ethereum",
  },
};
export const MSX = {
  ticker: "MSX",
  name: "Moonshine",
  logoURI: logo,
  address: process.env.REACT_APP_MOONSHINE_TOKEN_ADDRESS.toLowerCase(),
  decimals: 6,
};
export const WETH = {
  ticker: "ETH",
  ethName: "Ether",
  logoURI: "https://i.ibb.co/0jBv18b/download.png",
  name: "Ethereum",
  address: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
  decimals: 18,
};
export const BTC = {
  ticker: "WBTC",
  name: "Wrapped Bitcoin",
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  address: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6",
  decimals: 8,
};
export const USD = {
  ticker: "USD",
  name: "Compound USDc",
  ethName: "cUSDc",
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  address: "0xd871b40646e1a6dbded6290b6b696459a69c68a0",
  decimals: 8,
};

export const MATIC = {
  ticker: "MATIC",
  name: "Matic",
  logoURI:
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0/logo.png",
  address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  decimals: 18,
};

export const TOKENS = [USD, MSX, WETH, BTC, MATIC];
export const FARMABLE_TOKENS = [WETH, BTC];
export const LIQUIDITY_TOKENS = [BTC, WETH];
export const TOKEN_METADATA = {
  [BTC.address]: BTC,
  [BTC.address]: BTC,
  [MSX.address]: MSX,
  [USD.address]: USD,
  [WETH.address]: WETH,
  [MATIC.address]: MATIC,
};
