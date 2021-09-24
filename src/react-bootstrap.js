import { useCallback, useRef } from "react";
import { Collapse, Modal } from "bootstrap";

export function useCollapse(show) {
  return useCallback(
    (node) => {
      if (node !== null) {
        var collapse = new Collapse(node, {
          toggle: false,
        });
        show ? collapse.show() : collapse.hide();
      }
    },
    [show]
  );
}

export function useModal(show) {
  const modal = useRef();

  return useCallback(
    (node) => {
      if (node !== null) {
        if (!modal.current) {
          modal.current = new Modal(node, {});
        }
        if (show) {
          modal.current.show();
        } else {
          modal.current.hide();
        }
      }
    },
    [show]
  );
}
