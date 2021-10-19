import "./App.css";
import { useCallback, useContext, useRef } from "react";
import AppContext from "./AppContext";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./MSXInputs/TokenAmountInput";
import { useState } from "react";
import { TOKENS } from "./constants";
import { MOONSHINE_BRIDGE } from "./contracts";

export default function Withdraw(props) {
  const { address } = props;
  const [token, setToken] = useState(TOKENS['WETH'].address);
  const [value, setValue] = useState(1000n);
  const [loading, setLoading] = useState(false);
  const inputAmountRef = useRef(null);
  const { apolloClient } = useContext(AppContext);
  const withdraw = useCallback(async () => {
    setLoading(true);
    try {
      console.log(value);
      const tx = await MOONSHINE_BRIDGE.createWithdrawlRequest(value, token);
      await tx.wait();
    } catch (err) {
      err.message ? alert(err.message) : alert(JSON.stringify(err));
      setValue(0n);
      inputAmountRef.current.setRawValue("");
      setLoading(false);
    }
    setValue(0n);
    inputAmountRef.current.setRawValue("");
    await apolloClient.refetchQueries({
      include: ["tokens", "liquidityTokens"],
    });
    setLoading(false);
  }, [apolloClient, token, value]);

  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col-sm-12 col-lg-6">
          <TokenSelect
            value={token}
            onChange={({ address }) => setToken(address)}
            placeholder="Token To Withdraw"
          />
        </div>
        <div className="col-sm-12 col-lg-6">
          <TokenAmountInput
            label="Amount To Withdraw"
            ref={inputAmountRef}
            address={address}
            token={token}
            onChange={(value) => setValue(value)}
            value={value}
          />
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <button
          onClick={() => withdraw()}
          className="btn btn-primary"
          type="button"
        >
          {loading ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            "Withdraw"
          )}
        </button>
      </div>
      <div className="text-muted text-center">
        Note: Switch to Polygon To Deposit Tokens
      </div>
    </form>
  );
}
