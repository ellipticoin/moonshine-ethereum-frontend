import { ethRequestAccounts } from "./ethereum";

export default function UnlockMetaMask(props) {
  return (
    <div className="text-center d-flex align-items-center justify-content-center ">
      <div>
        <h2>
          Please Connect{" "}
          <a target="_blank" rel="noreferrer" href="https://metamask.io/">
            MetaMask
          </a>{" "}
        </h2>
        <button
          onClick={async (e) => {
            e.preventDefault();
            await ethRequestAccounts();
          }}
          className="btn btn-lg btn-primary mt-4"
          type="submit"
        >
          Connect MetaMask
        </button>
      </div>
    </div>
  );
}
