import { connectToPolygon } from "./ethereum";

export default function UnlockMetaMask(props) {
  return (
    <div
      className="text-center d-flex align-items-center justify-content-center "
      style={{ marginTop: "80px" }}
    >
      <div>
        <h2>
          Please Connect to the{" "}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://polygon.technology/"
          >
            Polygon
          </a>{" "}
          Network
        </h2>
        <button
          onClick={async (e) => {
            e.preventDefault();
            await connectToPolygon();
          }}
          className="btn btn-lg btn-primary mt-4"
          type="submit"
        >
          Connect To Polygon
        </button>
      </div>
    </div>
  );
}
