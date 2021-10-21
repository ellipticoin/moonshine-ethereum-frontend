import { useState } from "react";
import { AMM } from "../contracts.js";
import NumberFormat from "react-number-format";
import { proportionOf } from "../helpers";
import Button from "../Button";
import { SIGNER } from "../constants";
import { getGasPrice } from "../polygon.js";
const Input = (props) => (
  <div className="form-floating">
    <input
      type="text"
      className="form-control"
      id="percentageToRemove"
      {...props}
    />
    <label htmlFor="floatingInputValue">Percentage to Remove</label>
  </div>
);
export default function RemoveLiquidity(props) {
  const { poolId, poolBalance } = props;
  const [loading, setLoading] = useState(false);
  const [percentageToRemove, setPercentageToRemove] = useState(1000000n);
  const removeLiquidity = async () => {
    setLoading(true);
    try {
      await AMM.connect(SIGNER).removeLiquidity(
        poolId,
        proportionOf(poolBalance, percentageToRemove, 1000000n),
        { gasPrice: await getGasPrice("fastest") }
      );
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) console.log(err);
    }
  };
  return (
    <div className="mt-4">
      <NumberFormat
        customInput={Input}
        thousandSeparator={true}
        allowNegative={false}
        suffix="%"
        isAllowed={({ floatValue }) => !floatValue || floatValue <= 100}
        defaultValue="100"
        decimalScale={2}
        placeholder="Amount"
        onValueChange={(values) => {
          if (isNaN(parseFloat(values.value))) return;
          setPercentageToRemove(
            BigInt(Math.floor((parseFloat(values.value) * 1000000) / 100))
          );
        }}
      />

      <div className="d-grid gap-2 mt-4">
        <Button
          onClick={(e) => {
            e.preventDefault();
            removeLiquidity();
          }}
          loading={loading}
          className="btn btn-primary btn-lg"
        >
          Remove Liquidity
        </Button>
      </div>
    </div>
  );
}
