import { useEffect, useRef, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import "../styles/ActionMenu.css";

function ActionMenu({ actions }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="action-menu" ref={menuRef}>
      <button
        type="button"
        className="btn-icon action-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <EllipsisVertical />
      </button>

      {isOpen && (
        <div className="action-menu-dropdown">
          {actions.map((action) => (
            <button
              key={action.label}
              className={`action-menu-item ${
                action.variant === "danger" ? "danger" : ""
              }`}
              onClick={() => {
                action.onClick();
                setIsOpen(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActionMenu;
