import "./App.css";
import { useRef } from "react";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./ETHInputs/TokenAmountInput";
import { useState } from "react";
import { BRIDGE_ADDRESS, TOKENS, SAFE_ADDRESS, SIGNER } from "./constants";
import { ERC20 } from "./contracts";
import { scaleUpTokenAmount } from "./helpers";

export default function Deposit(props) {
  const { address } = props;
  const [token, setToken] = useState();
  const [value, setValue] = useState(0n);
  const [loading, setLoading] = useState(false);
  const [depositToSafe, setDepositToSafe] = useState(false);
  const to = depositToSafe ? SAFE_ADDRESS : BRIDGE_ADDRESS;
  const inputAmountRef = useRef(null);
  const deposit = async () => {
    setLoading(true);
    try {
      const tx = await (token === TOKENS["MATIC"].address
        ? SIGNER.sendTransaction({
            to,
            value: scaleUpTokenAmount(token, value),
          })
        : ERC20.attach(token)
            .connect(SIGNER)
            .transfer(to, scaleUpTokenAmount(token, value)));
      await tx.wait();
    } catch (err) {
      err.message ? alert(err.message) : alert(JSON.stringify(err));
      setValue(0n);

      if (inputAmountRef.current) inputAmountRef.current.setRawValue("");
      setLoading(false);
    }
    setValue(0n);
    inputAmountRef.current.setRawValue("");
    setLoading(false);
  };

  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col-sm-12 col-lg-6">
          <TokenSelect
            value={token}
            onChange={({ address }) => setToken(address)}
            placeholder="Token To Deposit"
          />
        </div>
        <div className="col-sm-12 col-lg-6">
          <TokenAmountInput
            label="Amount To Deposit"
            ref={inputAmountRef}
            address={address}
            token={token}
            onChange={(value) => setValue(value)}
            value={value}
          />
        </div>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          onChange={() => setDepositToSafe(!depositToSafe)}
          checked={depositToSafe}
          className="form-check-input"
        />
        <label title="" className="form-check-label">
          Deposit Directly To Safe
        </label>
      </div>
      <div className="d-grid gap-2 mt-2">
        <button
          onClick={() => deposit()}
          className="btn btn-primary"
          type="button"
        >
          {loading ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            "Deposit"
          )}
        </button>
      </div>
      <div className="text-muted text-center">
        Note: Switch to Moonshine Chain To Withdraw Tokens
      </div>
    </form>
  );
}
