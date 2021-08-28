import "./App.css";
import { useRef } from "react";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./TokenAmountInput";
import { useState } from "react";
import { TOKENS } from "./constants";
import { POLYGON_BRIDGE, ETH } from "./contracts";
import { scaleUpTokenAmount } from "./quickswap";

export default function Deposit(props) {
  const { address } = props;
  const [token, setToken] = useState({ address: TOKENS[0].address });
  const [value, setValue] = useState(0n);
  const [loading, setLoading] = useState(false);
  const inputAmountRef = useRef(null);
  const deposit = async () => {
    setLoading(true);
    try {
      console.log(scaleUpTokenAmount(ETH, value));

      const tx = await POLYGON_BRIDGE.depositEtherFor(address, {
        value: scaleUpTokenAmount(ETH, value),
      });
      await tx.wait();
    } catch (err) {
      if (err.data && err.data.message) alert(err.data.message);
      if (err) alert(err);
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
            tokens={[
              {
                id: 0,
                name: TOKENS[0].name,
                icon: TOKENS[0].logoURI,
                label: TOKENS[0].symbol,
                value: TOKENS[0].address,
                address: TOKENS[0].address,
              },
            ]}
            value={token.address}
            onChange={(token) => setToken(token)}
            placeholder="Token To Deposit"
          />
        </div>
        <div className="col-sm-12 col-lg-6">
          <TokenAmountInput
            label="Amount To Deposit"
            ref={inputAmountRef}
            address={address}
            tokenAddress={token.address}
            onChange={(value) => setValue(value)}
            value={value}
          />
        </div>
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
    </form>
  );
}
