import { useState } from "react";

function useToast() {
  const [toasts, setToasts] = useState([]);

  function addToast(toast) {
    const newToast = { ...toast };
    newToast.id = crypto.randomUUID();
    setToasts((toasts) => [...toasts, newToast]);
  }

  function removeToast(newToast) {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== newToast.id));
  }

  return { toasts, addToast, removeToast };
}

export default useToast;
