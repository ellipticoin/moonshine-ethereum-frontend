import { forwardRef } from "react";
import { ethers } from "ethers";
import { useQueryEth } from "../ethereum.js";
import { ERC20 } from "../contracts";
import { TOKENS } from "../constants";
import Cleave from "cleave.js/react";
import TokenAmount from "../TokenAmount";
const {
  utils: { parseUnits },
  constants: { AddressZero },
} = ethers;

export default forwardRef((props, ref) => {
  const { onChange, address, token, options, label } = props;
  const balance = useQueryEth(
    ERC20.attach(token || AddressZero),
    async (contract) =>
      token === TOKENS["MATIC"].address
        ? contract.provider.getBalance(address)
        : contract.balanceOf(address),
    [token, address]
  );

  return (
    <div className="form-floating mb-3">
      {balance && (
        <small
          style={{ right: "10px", top: "7px", position: "absolute" }}
          className="balance"
        >
          {token ? (
            <strong>
              Balance:{" "}
              <TokenAmount
                decimals={
                  Object.values(TOKENS).find(({ address }) => address === token)
                    .decimals
                }
              >
                {balance}
              </TokenAmount>
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
