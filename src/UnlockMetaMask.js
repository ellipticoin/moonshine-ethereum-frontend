import { ethRequestAccounts } from "./ethereum";
export default function UnlockMetaMask() {
  return (
    <div className="text-center">
      <h2>Please connect to MetaMask to "Arbitrum Testnet V5"</h2>
      <button
        onClick={(e) => {
          e.preventDefault();
          ethRequestAccounts();
        }}
        className="btn btn-lg btn-primary mt-4"
        type="submit"
      >
        Connect To MetaMask
      </button>
    </div>
  );
}
