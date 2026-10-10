import { useState, useEffect } from "react";
import { X } from "lucide-react";
import "../styles/buttons.css";
import "../styles/modals.css";

function Modal({
  children,
  onClose,
  shouldCloseModal,
  modalTitle,
  modalSubtitle,
}) {
  const [isClosing, setIsClosing] = useState(false);

  function handleAnimationEnd(e) {
    if (isClosing && e.target === e.currentTarget) onClose();
  }

  useEffect(() => {
    if (shouldCloseModal) setIsClosing(true);
  }, [shouldCloseModal]);

  return (
    <div
      className={isClosing ? "modal-overlay closing" : "modal-overlay"}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{modalTitle}</h2>

            <p className="modal-subtitle">{modalSubtitle}</p>
          </div>

          <button
            type="button"
            className="btn-icon"
            onClick={() => setIsClosing(true)}
          >
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export default Modal;
