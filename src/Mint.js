import "./App.css";
import { useRef } from "react";
import TokenSelect from "./TokenSelect";
import TokenAmountInput from "./TokenAmountInput";
import { useState } from "react";
import { ethers } from "ethers";
const {
  constants: { AddressZero },
} = ethers;

export default function Mint(props) {
  const { address } = props;
  const [token, setToken] = useState({ address: AddressZero });
  const [value, setValue] = useState(0n);
  const [loading, setLoading] = useState(false);
  const inputAmountRef = useRef(null);
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
    setLoading(false);
  };

  return (
    <form className="d-flex  flex-column">
      <div className="row">
        <div className="col">
          <TokenSelect
            value={token.address}
            onChange={(token) => setToken(token)}
            placeholder="Token To Mint"
          />
        </div>
        <div className="col">
          <TokenAmountInput
            label="Amount To Mint"
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
