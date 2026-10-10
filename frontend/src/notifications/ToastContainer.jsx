import { useContext } from "react";
import { ToastContext } from "./ToastProvider";
import Toast from "./Toast";
import "../styles/toast.css";

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          submessage={toast.submessage}
          status={toast.status}
          onClose={() => removeToast(toast)}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
