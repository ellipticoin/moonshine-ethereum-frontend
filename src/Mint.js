import "./App.css";
import { useRef } from "react";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./TokenAmountInput";
import { useState } from "react";
import { ethers } from "ethers";

export default function Mint() {
  const [token, setToken] = useState();
  const [value, setValue] = useState(0n);
  const [loading, setLoading] = useState(false);
  const inputAmountRef = useRef(null);
  const mint = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const tokenContract = new ethers.Contract(
      token.value,
      ["function mint(address account, uint256 amount)"],
      signer
    );
    const tx = await tokenContract.mint(
      "0xAdfe2B5BeAc83382C047d977db1df977FD9a7e41",
      value
    );
    await tx.wait();
    setValue(0n);
    inputAmountRef.current.setRawValue("");
    setToken(null);
    setLoading(false);
  };
  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col">
          <TokenSelect
            value={token}
            onChange={(token) => setToken(token)}
            size={4000}
            placeholder="Token To Mint"
          />
        </div>
        <div className="col">
          <div className="form-floating mb-3">
            <TokenAmountInput
              className="form-control"
              id="inputAmount"
              ref={inputAmountRef}
              tokenAddress={token && token.value}
              onChange={(value) => setValue(value)}
              value={value}
            />
            <label htmlFor="inputAmount">Amount To Mint</label>
          </div>
        </div>
      </div>
      <div className="d-grid gap-2 mt-2">
        <button
          onClick={() => mint()}
          className="btn btn-primary"
          type="button"
        >
          {loading ? (
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            "Mint"
          )}
        </button>
      </div>
    </form>
  );
}
