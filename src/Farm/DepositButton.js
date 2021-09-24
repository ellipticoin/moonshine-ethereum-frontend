import Button from "../Button";
export default function DepositButton(props) {
  const {
    onClick,
    children,
    loading,
    tokenRequiresApproval,
    baseTokenRequiresApproval,
    approveBaseToken,
    approveToken,
  } = props;
  if (baseTokenRequiresApproval) {
    return (
      <button
        onClick={() => approveBaseToken()}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Approve Base Token"
        )}
      </button>
    );
  } else if (tokenRequiresApproval) {
    return (
      <button
        onClick={() => approveToken()}
        className="btn btn-primary"
        type="button"
      >
        {loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          "Approve Token"
        )}
      </button>
    );
  } else {
    return (
      <Button
        onClick={onClick}
        className="btn btn-primary"
        type="button"
        loading={loading}
      >
        {children}
      </Button>
    );
  }
}
