import { useState } from "react";

function useModalState() {
  const [selectedItem, setSelectedItem] = useState(null);

  const [isOpen, setIsOpen] = useState(false);
  const [shouldClose, setShouldClose] = useState(false);

  function openAddModal() {
    setSelectedItem(null);
    setIsOpen(true);
  }

  function openEditModal(row) {
    setSelectedItem(row);
    setIsOpen(true);
  }

  function requestClose() {
    setShouldClose(true);
  }

  function handleClosed() {
    setSelectedItem(null);
    setShouldClose(false);
    setIsOpen(false);
  }

  return {
    selectedItem,
    isOpen,
    shouldClose,
    openAddModal,
    openEditModal,
    requestClose,
    handleClosed,
  };
}

export default useModalState;
