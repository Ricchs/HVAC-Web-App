import { createContext } from "react";
import useToast from "./useToast";

const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <ToastContext value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext>
  );
}

export { ToastContext };
export default ToastProvider;
