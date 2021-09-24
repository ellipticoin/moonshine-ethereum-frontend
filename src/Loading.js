export default function Loading(props) {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: props.height }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}
