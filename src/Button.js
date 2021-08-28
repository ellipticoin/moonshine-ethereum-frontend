export default function Button(props) {
  return (
    <>
      <button
        type="button"
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
        className={props.className || "btn btn-primary"}
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
