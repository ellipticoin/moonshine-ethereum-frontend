import { useEffect } from "react";
import { Collapse } from "bootstrap";
export function useCollapse(ref, show) {
  useEffect(() => {
    var collapse = new Collapse(ref.current, {
      toggle: false,
    });
    show ? collapse.show() : collapse.hide();
  }, [ref, show]);
}
