import { useContext } from "react";
import { PackageOpen } from "lucide-react";

import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { ToastContext } from "../notifications/ToastProvider";
import useResource from "../hooks/useResource";
import useModalState from "../hooks/useModalState";

import InventoryTable from "./InventoryTable";
import InventoryForm from "./InventoryForm";

function InventoryTab({ onTabSwitch, onInventoryChange }) {
  const { addToast } = useContext(ToastContext);

  // Inventory list
  const { items, search, setSearch, loadItems, deleteItem } = useResource({
    endpoint: "/api/inventory",
    noun: "item",
    pluralNoun: "items",
    getName: (item) => item.item,
    onChange: onInventoryChange,
  });

  // Modal state
  const {
    selectedItem,
    isOpen,
    shouldClose,
    openAddModal,
    openEditModal,
    requestClose,
    handleClosed,
  } = useModalState();

  // Suppliers list
  const { items: suppliers } = useResource({
    endpoint: "/api/suppliers",
    noun: "supplier",
    pluralNoun: "suppliers",
    getName: (supplier) => supplier.company_name,
  });

  return (
    <>
      {/* Table toolbar*/}
      <div className="table-toolbar">
        {/* Tabs */}
        <div className="table-tabs">
          <button className="table-tab active">Inventory</button>
          <button className="table-tab" onClick={onTabSwitch}>
            Suppliers
          </button>
        </div>

        {/* Search */}
        <input
          className="table-search"
          type="search"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Filters */}
        <select className="table-filter">
          <option value="">Filter</option>
        </select>

        <select className="table-filter">
          <option value="">Category</option>
        </select>

        {/* Add button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddModal}
        >
          + Add item
        </button>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <EmptyState search={search} label="items" icon={PackageOpen} />
      ) : (
        <InventoryTable
          items={items}
          onEditItem={openEditModal}
          onDeleteItem={deleteItem}
        />
      )}

      {/* Modal */}
      {isOpen &&
        (selectedItem ? (
          // Edit modal
          <Modal
            onClose={handleClosed}
            shouldCloseModal={shouldClose}
            modalTitle={"Edit product"}
            modalSubtitle="Modify the product's information below"
          >
            <InventoryForm
              item={selectedItem}
              supplierOptions={suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.company_name,
              }))}

              onCancel={requestClose}
              onItemUpdated={async (item) => {
                await loadItems();
                await onInventoryChange();
                requestClose();
                addToast({
                  message: "Item updated",
                  submessage: `${item}'s changes were saved.`,
                  status: "success",
                });
              }}
            />
          </Modal>
        ) : (
          // Add modal
          <Modal
            onClose={handleClosed}
            shouldCloseModal={shouldClose}
            modalTitle="Add Product"
            modalSubtitle="Enter the product's information below"
          >
            <InventoryForm
              supplierOptions={suppliers.map((supplier) => ({
                value: supplier.id,
                label: supplier.company_name,
              }))}

              onCancel={requestClose}
              onItemCreated={async (item) => {
                await loadItems();
                await onInventoryChange();
                requestClose();
                addToast({
                  message: "Item created",
                  submessage: `${item} was added to your inventory.`,
                  status: "success",
                });
              }}
            />
          </Modal>
        ))}
    </>
  );
}

export default InventoryTab;
