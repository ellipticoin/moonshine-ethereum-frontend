const {
  DEFAULT_FEE,
  BASE_FACTOR,
  BASE_TOKEN_MANTISSA,
  EXCHANGE_RATE_MANTISSA,
} = require("./constants");
const { find } = require("lodash");

export default class ExchangeCalculator {
  constructor({
    fee = DEFAULT_FEE,
    liquidityTokens = [],
    usdAddress,
    usdExchangeRate,
  }) {
    this.fee = fee;
    this.liquidityTokens = liquidityTokens;
    this.usdAddress = usdAddress;
    this.usdExchangeRate = usdExchangeRate;
  }

  getOutputAmount(
    underlyingInputAmount,
    inputTokenAddress,
    outputTokenAddress
  ) {
    const inputAmount = this.underlyingToAmount(
      underlyingInputAmount,
      inputTokenAddress
    );
    const usdAmount = this.sell(inputAmount, inputTokenAddress);
    const underlyingOutputAmount = this.buy(usdAmount, outputTokenAddress);
    return this.amountToUnderlying(underlyingOutputAmount, outputTokenAddress);
  }

  getTotalFee(inputAmount, inputTokenAddress, outputTokenAddress) {
    let inputFee = this.getInputFee(inputAmount, inputTokenAddress);
    let usdAmount;
    usdAmount = this.sell(inputAmount, inputTokenAddress);
    let outputFee = this.getOutputFee(
      usdAmount,
      inputAmount,
      inputTokenAddress,
      outputTokenAddress
    );
    return inputFee + outputFee;
  }

  getInputFee(inputAmount, inputTokenAddress) {
    if (inputTokenAddress === this.usdAddress) {
      return 0n;
    } else {
      return this.getFee(inputAmount);
    }
  }

  getOutputFee(usdAmount, inputAmount, inputTokenAddress, outputTokenAddress) {
    if (outputTokenAddress === this.usdAddress) {
      return 0n;
    } else {
      const outputFeeInUsd = this.getFee(usdAmount);
      if (inputTokenAddress === this.usdAddress) {
        return outputFeeInUsd;
      } else {
        const { poolSupplyOfUsd, poolSupplyOfToken } =
          this.getLiquidityToken(inputTokenAddress);
        if (poolSupplyOfToken === 0n) return;
        return (poolSupplyOfToken * outputFeeInUsd) / poolSupplyOfUsd;
      }
    }
  }

  getExchangeRate(inputAmount, inputTokenAddress, outputTokenAddress) {
    if (inputTokenAddress === this.usdAddress) {
      return (
        ((inputAmount -
          this.getTotalFee(
            inputAmount,
            inputTokenAddress,
            outputTokenAddress
          )) *
          BASE_FACTOR) /
        this.getOutputAmount(inputAmount, inputTokenAddress, outputTokenAddress)
      );
    } else {
      const { poolSupplyOfUsd, poolSupplyOfToken } =
        this.getLiquidityToken(inputTokenAddress);
      const inputAmountMinusTotalFee =
        inputAmount -
        this.getTotalFee(inputAmount, inputTokenAddress, outputTokenAddress);
      return (
        ((poolSupplyOfUsd * inputAmountMinusTotalFee) /
          poolSupplyOfToken /
          this.getOutputAmount(
            inputAmount,
            inputTokenAddress,
            outputTokenAddress
          )) *
        BASE_FACTOR
      );
    }
  }

  sell(inputAmount, inputTokenAddress) {
    if (inputTokenAddress === this.usdAddress) return inputAmount;
    const { poolSupplyOfToken, poolSupplyOfUsd } =
      this.getLiquidityToken(inputTokenAddress);
    return this.calculateOutputAmount(
      poolSupplyOfToken,
      poolSupplyOfUsd,
      inputAmount - this.getFee(inputAmount)
    );
  }

  buy(usdAmount, outputTokenAddress) {
    if (outputTokenAddress === this.usdAddress) return usdAmount;
    const { poolSupplyOfUsd, poolSupplyOfToken } =
      this.getLiquidityToken(outputTokenAddress);
    return this.calculateOutputAmount(
      poolSupplyOfUsd,
      poolSupplyOfToken,
      usdAmount - this.getFee(usdAmount)
    );
  }

  getArbitragePrice(tokenAddress, underlyingTargetPrice) {
    const targetPrice = this.underlyingToAmount(
      underlyingTargetPrice,
      this.usdAddress
    );
    const { poolSupplyOfUsd, poolSupplyOfToken } =
      this.getLiquidityToken(tokenAddress);

    const currentPrice = (poolSupplyOfUsd * BASE_FACTOR) / poolSupplyOfToken;
    let inputAmount = 0n;
    let priceAfterTrade = currentPrice;
    if (currentPrice < targetPrice) {
      for (
        inputAmount = 0n;
        priceAfterTrade < targetPrice;
        inputAmount += BASE_FACTOR
      ) {
        const supplyOfUsdAfterTrade =
          poolSupplyOfUsd + inputAmount - this.getFee(inputAmount);
        const supplyOfTokenAfterTrade =
          poolSupplyOfToken -
          this.calculateOutputAmount(
            poolSupplyOfUsd,
            poolSupplyOfToken,
            inputAmount - this.getFee(inputAmount)
          );
        priceAfterTrade =
          (supplyOfUsdAfterTrade * BASE_FACTOR) / supplyOfTokenAfterTrade;
      }
      return ["buy", this.amountToUnderlying(inputAmount, this.usdAddress)];
    } else {
      for (inputAmount = 0n; priceAfterTrade > targetPrice; inputAmount += 1n) {
        //         console.log([
        //                 this.amountToUnderlying(priceAfterTrade, this.usdAddress),
        //                 this.amountToUnderlying(targetPrice, this.usdAddress)
        // ])
        //         console.log(priceAfterTrade > targetPrice)
        const supplyOfTokenAfterTrade =
          poolSupplyOfToken + inputAmount - this.getFee(inputAmount);
        const supplyOfUsdAfterTrade =
          poolSupplyOfUsd -
          this.calculateOutputAmount(
            poolSupplyOfToken,
            poolSupplyOfUsd,
            inputAmount - this.getFee(inputAmount)
          );
        priceAfterTrade =
          (supplyOfUsdAfterTrade * BASE_FACTOR) / supplyOfTokenAfterTrade;
        //         console.log([
        //                 this.amountToUnderlying(priceAfterTrade, this.usdAddress),
        //                 this.amountToUnderlying(targetPrice, this.usdAddress)
        // ])
        //         console.log(priceAfterTrade > targetPrice)
      }
      return ["sell", inputAmount];
    }
  }

  calculateOutputAmount(inputSupply, outputSupply, inputAmount) {
    const invariant = inputSupply * outputSupply;
    const newOutputSupply = invariant / (inputSupply + inputAmount);
    return outputSupply - newOutputSupply;
  }

  underlyingToAmount(underlyingAmount, tokenAddress) {
    if (tokenAddress === this.usdAddress) {
      return (
        (underlyingAmount *
          BigInt(10 ** Number(BASE_TOKEN_MANTISSA + EXCHANGE_RATE_MANTISSA))) /
        this.usdExchangeRate
      );
    } else {
      return underlyingAmount;
    }
  }

  amountToUnderlying(amount, tokenAddress) {
    if (tokenAddress === this.usdAddress) {
      return (
        (this.usdExchangeRate * amount) /
        BigInt(10 ** Number(BASE_TOKEN_MANTISSA + EXCHANGE_RATE_MANTISSA))
      );
    } else {
      return amount;
    }
  }

  getLiquidityToken(address) {
    return find(this.liquidityTokens, ["tokenAddress", address]);
  }

  getFee(amount) {
    const fee = (amount * this.fee) / BASE_FACTOR;
    return fee === 0n ? 1n : fee;
  }
}
