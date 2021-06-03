import ExchangeRateCalculator from "./ExchangeRateCalculator";
import { ethers, BigNumber } from "ethers";

const {
  utils: { parseUnits },
} = ethers;

test("ExchangeRateCalculator#getOutputAmount", () => {
  const exchangeRateCalculator = new ExchangeRateCalculator({
    baseToken: "USD",
    pools: [
      {
        token: "APPLES",
        baseTokenBalance: parseUnits("100"),
        tokenBalance: parseUnits("100"),
      },
    ],
    inputToken: "USD",
    outputToken: "APPLES",
  });
  expect(
    exchangeRateCalculator.getOutputAmount(parseUnits("100")).toString()
  ).toBe("49924887330996494743");
  expect(true).toBe(true);
});
