import { useState } from "react";
import { CircleCheckBig, CircleX, TriangleAlert, Info, X } from "lucide-react";

function Toast({ message, submessage, status = "success", onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const icons = {
    success: <CircleCheckBig />,
    error: <CircleX />,
    warning: <TriangleAlert />,
    info: <Info />,
  };

  function handleAnimationEnd(e) {
    if (e.animationName === "toast-progress") {
      setIsClosing(true);
    } else if (isClosing && e.animationName === "toastClose") {
      onClose();
    }
  }

  return (
    <div
      className={isClosing ? `toast ${status} closing` : `toast ${status}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="toast-content">
        <div className="toast-icon">{icons[status]}</div>

        <div className="toast-text">
          <p className="toast-message">{message}</p>
          <p className="toast-submessage">{submessage}</p>
        </div>

        <button
          type="button"
          className="btn-icon toast-close"
          onClick={() => setIsClosing(true)}
        >
          <X />
        </button>
      </div>
    </div>
  );
}

export default Toast;
