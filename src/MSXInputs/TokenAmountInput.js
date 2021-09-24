import { forwardRef } from "react";
import { ethers } from "ethers";
import { TOKENS } from "../constants";
import Cleave from "cleave.js/react";
import TokenAmount from "../TokenAmount";
import { useGetTokens } from "../queries";
const {
  utils: { parseUnits },
} = ethers;

export default forwardRef((props, ref) => {
  const { onChange, address, token, options, label } = props;
  const { data: { tokens } = { tokens: TOKENS }, loading } =
    useGetTokens(address);
  const balance =
    !loading && token
      ? tokens.find(({ address }) => address === token).balance
      : null;

  return (
    <div className="form-floating mb-3">
      {balance && (
        <small
          style={{ right: "10px", top: "7px", position: "absolute" }}
          className="balance"
        >
          {token ? (
            <strong>
              Balance: <TokenAmount>{balance}</TokenAmount>
            </strong>
          ) : null}
        </small>
      )}
      <Cleave
        className="form-control"
        ref={ref}
        placeholder="0.0"
        options={{
          ...options,
          numeral: true,
          numeralDecimalScale: 6,
          numeralThousandsGroupStyle: "thousand",
        }}
        onChange={(event) => {
          event.stopPropagation();

          onChange(
            event.target.rawValue === ""
              ? null
              : parseUnits(
                  event.target.rawValue.replace(/^\./g, "0."),
                  6
                ).toBigInt()
          );
        }}
      ></Cleave>
      <label htmlFor="inputAmount">{label}</label>
    </div>
  );
});
// };
