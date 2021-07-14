import { ethers } from "ethers";

const {
  utils: { parseUnits },
} = ethers;
const DEFAULT_FEE = parseUnits("0.003").toBigInt();

export default class ExchangeRateCalculator {
  constructor({ fee = DEFAULT_FEE, inputPool, outputPool, inputAmount }) {
    this.fee = fee;
    this.inputPool = inputPool;
    this.outputPool = outputPool;
  }

  getOutputAmount(inputAmount) {
    if (!inputAmount) return;
    switch (this.getAction()) {
      case "buy":
        return this.getBuyOutputAmount(inputAmount);
      case "sell":
        return this.getSellOutputAmount(inputAmount);
      case "swap":
        return this.getSwapOutputAmount(inputAmount);
      default:
        throw new Error("Unexpected action");
    }
  }

  getSwapOutputAmount(inputAmount) {
    const baseTokenAmount = this.getSellOutputAmount(inputAmount);
    return this.getSellOutputAmount(baseTokenAmount);
  }

  getBuyOutputAmount(inputAmount) {
    const { baseTokenBalance, tokenBalance } = this.outputPool;
    return this.calculateOutputAmount(
      baseTokenBalance,
      tokenBalance,
      inputAmount
    );
  }

  getSellOutputAmount(inputAmount) {
    const { baseTokenBalance, tokenBalance } = this.inputPool;

    return this.calculateOutputAmount(
      tokenBalance,
      baseTokenBalance,
      inputAmount
    );
  }

  getAction() {
    if (!this.inputPool.address) {
      return "buy";
    } else if (!this.outputPool.address) {
      return "sell";
    } else {
      return "convert";
    }
  }

  calculateOutputAmount(inputSupply, outputSupply, inputAmount) {
    if (inputSupply === 0n) return 0n;
    const invariant = inputSupply * outputSupply;
    const newOutputSupply =
      invariant / (inputSupply + inputAmount - this.getFee(inputAmount));

    return outputSupply - newOutputSupply;
  }

  getFee(amount) {
    return (amount * this.fee) / parseUnits("1").toBigInt();
  }
}
