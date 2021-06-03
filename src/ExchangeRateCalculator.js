import { ethers } from "ethers";

const {
  utils: { parseUnits },
} = ethers;
const DEFAULT_FEE = parseUnits("0.003");

export default class ExchangeRateCalculator {
  constructor({
    fee = DEFAULT_FEE,
    baseToken,
    pools,
    inputToken,
    outputToken,
    inputAmount,
  }) {
    this.fee = fee;
    this.baseToken = baseToken;
    this.pools = pools;
    this.inputToken = inputToken;
    this.outputToken = outputToken;
  }

  getOutputAmount(inputAmount) {
    if (!inputAmount) return;
    switch (this.getAction()) {
      case "buy":
        return this.getBuyOutputAmount(inputAmount);
      case "sell":
        return this.getSellOutputAmount(inputAmount);
      case "convert":
        return this.getConvertOutputAmount(inputAmount);
      default:
        throw new Error("Unexpected action");
    }
  }

  getConvertOutputAmount(inputAmount) {
    const baseTokenAmount = this.getSellOutputAmount(inputAmount);
    return this.getSellOutputAmount(baseTokenAmount);
  }

  getBuyOutputAmount(inputAmount) {
    const { baseTokenBalance, tokenBalance } = this.pools.find(
      ({ token }) => token === this.outputToken
    );
    return this.calculateOutputAmount(
      baseTokenBalance,
      tokenBalance,
      inputAmount
    );
  }

  getSellOutputAmount(inputAmount) {
    const { baseTokenBalance, tokenBalance } = this.pools.find(
      ({ token }) => token === this.inputToken
    );
    return this.calculateOutputAmount(
      tokenBalance,
      baseTokenBalance,
      inputAmount
    );
  }

  getAction() {
    if (this.inputToken === this.baseToken) {
      return "buy";
    } else if (this.outputToken === this.baseToken) {
      return "sell";
    } else {
      return "convert";
    }
  }

  calculateOutputAmount(inputSupply, outputSupply, inputAmount) {
    const invariant = inputSupply.mul(outputSupply);
    const newOutputSupply = invariant.div(
      inputSupply.add(inputAmount.sub(this.getFee(inputAmount)))
    );
    return outputSupply.sub(newOutputSupply);
  }

  getFee(amount) {
    return amount.mul(this.fee).div(parseUnits("1"));
  }
}
