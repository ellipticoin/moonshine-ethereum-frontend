import { forwardRef } from "react";
import { ethers } from "ethers";
import { useQueryEth, useTokenBalance } from "./ethereum.js";
import { ERC20 } from "./contracts";
import Cleave from "cleave.js/react";
const {
  utils: { parseUnits },
} = ethers;

export default forwardRef((props, ref) => {
  const { onChange, address, token, options, label } = props;
  const decimals = useQueryEth(async () => {
    return token && ERC20.attach(token.address).decimals();
  }, [token]);
  const inputBalance = useTokenBalance(token, address);
  // const decimals = 6
  // const inputBalance = "0"

  return (
    <div className="form-floating mb-3">
      {inputBalance && (
        <small
          style={{ right: "10px", top: "7px", position: "absolute" }}
          className="balance"
        >
          <strong>Balance: {inputBalance}</strong>
        </small>
      )}
      <Cleave
        className="form-control"
        ref={ref}
        placeholder="0.0"
        options={{
          ...options,
          numeral: true,
          numeralDecimalScale: 18,
          numeralThousandsGroupStyle: "thousand",
        }}
        onChange={(event) => {
          onChange(
            event.target.rawValue === ""
              ? null
              : parseUnits(
                  event.target.rawValue.replace(/^\./g, "0."),
                  decimals
                )
          );
        }}
      ></Cleave>
      <label htmlFor="inputAmount">{label}</label>
    </div>
  );
});
// };
