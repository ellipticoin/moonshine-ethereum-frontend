import { useState } from "react";
import { AMM } from "../contracts.js";
import NumberFormat from "react-number-format";
import { proportionOf } from "../helpers";
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
  const [percentageToRemove, setPercentageToRemove] = useState(1000000n);
  const removeLiquidity = async () => {
    await AMM.removeLiquidity(
      poolId,
      proportionOf(poolBalance, percentageToRemove, 1000000n)
    );
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
        <button
          onClick={(e) => {
            e.preventDefault();
            removeLiquidity();
          }}
          className="btn btn-primary btn-lg"
        >
          Remove Liquidity
        </button>
      </div>
    </div>
  );
}
