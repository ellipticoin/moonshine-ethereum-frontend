import { ethSwitchChain } from "./ethereum";
export default function UnlockMetaMask() {
  return (
    <div className="text-center">
      <h2>Please Connect To a Supported Network</h2>
      <div>
      <div>
        <button
          onClick={(e) => {
            e.preventDefault();
            ethSwitchChain("0x13881");
          }}
          className="btn btn-lg btn-primary mt-4"
          type="submit"
        >
          Connect To Mumbai
        </button>
      </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            ethSwitchChain("0x4");
          }}
          className="btn btn-lg btn-primary mt-4"
          type="submit"
        >
          Connect To Rinkarby (Atrbitrum Testnet)
        </button>
      </div>
      <div>
        <button
          onClick={(e) => {
            e.preventDefault();
            ethSwitchChain("0x4");
          }}
          className="btn btn-lg btn-primary mt-4"
          type="submit"
        >
          Connect To Rinkeby
        </button>
      </div>
    </div>
  );
}
