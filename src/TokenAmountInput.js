import { forwardRef, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useQueryEth } from "./ethereum.js";
import { ERC20 } from "./contracts";
import Cleave from "cleave.js/react";
import TokenAmount from "./TokenAmount";
const {
  utils: { parseUnits },
  constants: { AddressZero },
} = ethers;

export default forwardRef((props, ref) => {
  const { onChange, address, tokenAddress, options, label } = props;
  const [displayedInputBalance, setDisplayedInputBalance] = useState();
  const decimals = useQueryEth(
    ERC20.attach(tokenAddress),
    async (contract) => contract.decimals(),
    [tokenAddress]
  );
  const inputBalance = useQueryEth(
    ERC20.attach(tokenAddress),
    async (contract) => contract.balanceOf(address),
    [tokenAddress, address]
  );

  useEffect(() => {
    setDisplayedInputBalance(inputBalance);
  }, [inputBalance]);

  return (
    <div className="form-floating mb-3">
      {inputBalance && (
        <small
          style={{ right: "10px", top: "7px", position: "absolute" }}
          className="balance"
        >
          {tokenAddress === AddressZero ? null : (
            <strong>
              Balance:{" "}
              <TokenAmount decimals={decimals}>
                {displayedInputBalance}
              </TokenAmount>
            </strong>
          )}
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
