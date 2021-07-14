import {
  ChainId,
  Fetcher,
  Trade,
  Percent,
  Route,
  TokenAmount,
  TradeType,
} from "quickswap-sdk";
import { USDC, SIGNER } from "./contracts";
import { ethers } from "ethers";
const UniswapV2Router02JSON = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
const MAX_SLIPPAGE = new Percent("50", "10000"); // 50 bips, or 0.50%
export const QUICKSWAP_ROUTER = new ethers.Contract(
  "0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff",
  UniswapV2Router02JSON.abi,
  SIGNER
);
export async function executeQuickswapSwap(
  inputTokenAddress,
  outputTokenAddress,
  inputAmount,
  outputAmount
) {
  const inputToken = await fetchToken(inputTokenAddress);
  const outputToken = await fetchToken(outputTokenAddress);

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  console.log(
    inputAmount,
    outputAmount,
    (await getQuickswapRoute(inputToken, outputToken)).path.map(
      ({ address }) => address
    ),
    await SIGNER.getAddress(),
    deadline,
    {
      gasLimit: 300000,
    }
  );
  return await QUICKSWAP_ROUTER.swapExactTokensForTokens(
    scaleUpTokenAmount(inputToken, inputAmount),
    outputAmount,
    (
      await getQuickswapRoute(inputToken, outputToken)
    ).path.map(({ address }) => address),
    await SIGNER.getAddress(),
    deadline,
    {
      gasLimit: 300000,
    }
  );
}
export async function fetchOutputAmount(
  inputTokenAddress,
  outputTokenAddress,
  amount
) {
  if (!inputTokenAddress || !outputTokenAddress || !amount) return;
  const inputToken = await fetchToken(inputTokenAddress);
  const outputToken = await fetchToken(outputTokenAddress);

  const route = await getQuickswapRoute(inputToken, outputToken);
  const trade = new Trade(
    route,
    new TokenAmount(inputToken, scaleUpTokenAmount(inputToken, amount)),
    TradeType.EXACT_INPUT
  );

  return trade.minimumAmountOut(MAX_SLIPPAGE).raw.toString();
}

function scaleUpTokenAmount(token, amount) {
  if (token.decimals > 6) {
    return Number(amount) * 10 ** (token.decimals - 6);
  } else if (token.decimals < 6) {
    return Number(amount) / 10 ** (6 - token.decimals);
  } else {
    return Number(amount);
  }
}

async function fetchToken(tokenAddress) {
  return Fetcher.fetchTokenData(ChainId.MAINNET, tokenAddress, SIGNER);
  // return new Token(
  //   ChainId.MAINNET,
  //   token.address,
  //   await ERC20.attach(token.address).decimals(),
  // );
}

async function getQuickswapRoute(inputToken, outputToken) {
  if ([inputToken.address, outputToken.address].includes(USDC.address)) {
    let pair;
    if (inputToken.address === USDC.address) {
      pair = await Fetcher.fetchPairData(outputToken, inputToken, SIGNER);
    } else if (outputToken.address === USDC.address) {
      pair = await Fetcher.fetchPairData(inputToken, outputToken, SIGNER);
    }
    return new Route([pair], inputToken);
  } else {
    const usdcToken = await fetchToken(USDC.address);
    const pair1 = await Fetcher.fetchPairData(inputToken, usdcToken, SIGNER);
    const pair2 = await Fetcher.fetchPairData(usdcToken, outputToken, SIGNER);
    return new Route([pair1, pair2], inputToken);
  }
}
