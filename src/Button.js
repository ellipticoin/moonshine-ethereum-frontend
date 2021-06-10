export default function Button(props) {
  return (
    <>
      <button
        className="btn btn-primary"
        type="button"
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
      >
        {props.loading ? (
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          props.children
        )}
      </button>
    </>
  );
}
