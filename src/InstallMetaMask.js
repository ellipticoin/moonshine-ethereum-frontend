export default function InstallMetaMask(props) {
  return (
    <div className="text-center d-flex align-items-center justify-content-center">
      <div>
        <h2 className="mb-5">
          The MetaMask Extension is required to use Moonshine
        </h2>
        <a
          className="btn btn-primary btn-lg"
          target="_blank"
          rel="noreferrer"
          href="https://metamask.io/download.html"
        >
          Install MetaMask
        </a>
      </div>
    </div>
  );
}
