import { switchChain } from "./ethereum";
import { MOONSHINE_CHAIN_ID, POLYGON_CHAIN_ID } from "./constants";

export default function UnlockMetaMask(props) {
  return (
    <div className="text-center d-flex flex-column align-items-center justify-content-center ">
      <p className="text-danger">
        Warning Moonshine is beta software and has not been audited. Only
        deposit what you'd be happy to lose.
      </p>
      <button
        onClick={(e) => {
          e.preventDefault();
          switchChain(POLYGON_CHAIN_ID);
        }}
        className="btn btn-lg btn-primary"
        type="submit"
      >
        Connect To Polygon to Farm MSX and Deposit Assets
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          switchChain(MOONSHINE_CHAIN_ID);
        }}
        className="btn btn-lg btn-primary mt-3"
        type="submit"
      >
        Connect To Moonshine Chain To Try the Prototype
      </button>
    </div>
  );
}
