import { useModal } from "./react-bootstrap";

export default function Modal(props) {
  const { children, show } = props;
  // const ref = useRef(null);
  const modalRef = useModal(show);
  return (
    <div className="modal fade" ref={modalRef}>
      <div className="modal-dialog">
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
