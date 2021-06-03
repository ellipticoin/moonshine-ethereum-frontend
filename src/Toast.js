import { Toast } from "bootstrap";
import { useEffect, useRef } from "react";

export default function Toast2(props) {
  const { children } = props;

  const toastEl = useRef(null);
  useEffect(() => {
    var myCollapse = toastEl.current;
    var bsCollapse = new Toast(myCollapse, { autohide: false });
    bsCollapse.show();
  }, []);
  return (
    <div
      ref={toastEl}
      className="toast top-0 end-0"
      style={{ marginLeft: "auto" }}
    >
      <div className="toast-header">
        <strong className="me-auto">Transaction</strong>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>
      <div className="toast-body">{children}</div>
    </div>
  );
}
