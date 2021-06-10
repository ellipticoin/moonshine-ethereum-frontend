import "./App.css";
import { useRef } from "react";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./TokenAmountInput";
import { useState } from "react";
import { ethers } from "ethers";
import { usePools } from "./contracts";

export default function Mint(props) {
  const { address } = props;
  const [token, setToken] = useState();
  const [value, setValue] = useState(0n);
  const [loading, setLoading] = useState(false);
  const inputAmountRef = useRef(null);
  const pools = usePools();
  const mint = async () => {
    setLoading(true);
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const tokenContract = new ethers.Contract(
      token.address,
      ["function mint(address account, uint256 amount)"],
      signer
    );
    const tx = await tokenContract.mint(address, value);
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
            pools={pools}
            onChange={(token) => setToken(token)}
            size={4000}
            placeholder="Token To Mint"
          />
        </div>
        <div className="col">
          <TokenAmountInput
            label="Amount To Mint"
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
