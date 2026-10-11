import { useContext } from "react";
import { Truck } from "lucide-react";

import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import { ToastContext } from "../notifications/ToastProvider";
import useResource from "../hooks/useResource";
import useModalState from "../hooks/useModalState";

import SuppliersTable from "./SuppliersTable";
import SuppliersForm from "./SuppliersForm";

function SuppliersTab({ onTabSwitch }) {
  const { addToast } = useContext(ToastContext);

  // Suppliers list
  const {
    items: suppliers,
    search,
    setSearch,
    loadItems: loadSuppliers,
    deleteItem: deleteSupplier,
  } = useResource({
    endpoint: "/api/suppliers",
    noun: "supplier",
    pluralNoun: "suppliers",
    getName: (supplier) => supplier.company_name,
  });

  // Modal state
  const {
    selectedItem: selectedSupplier,
    isOpen,
    shouldClose,
    openAddModal,
    openEditModal,
    requestClose,
    handleClosed,
  } = useModalState();

  return (
    <>
      {/* Table toolbar*/}
      <div className="table-toolbar">
        {/* Tabs */}
        <div className="table-tabs">
          <button className="table-tab" onClick={onTabSwitch}>
            Inventory
          </button>
          <button className="table-tab active">Suppliers</button>
        </div>

        {/* Search */}
        <input
          className="table-search"
          type="search"
          placeholder="Search suppliers..."
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
          + Add supplier
        </button>
      </div>

      {/* Table */}
      {suppliers.length === 0 ? (
        <EmptyState search={search} label="suppliers" icon={Truck} />
      ) : (
        <SuppliersTable
          suppliers={suppliers}
          onEditSupplier={openEditModal}
          onDeleteSupplier={deleteSupplier}
        />
      )}

      {/* Modal */}
      {isOpen &&
        (selectedSupplier ? (
          // Edit modal
          <Modal
            onClose={handleClosed}
            shouldCloseModal={shouldClose}
            modalTitle={`Edit ${selectedSupplier.company_name}`}
            modalSubtitle="Modify the supplier's information below"
          >
            <SuppliersForm
              supplier={selectedSupplier}
              onCancel={requestClose}
              onSupplierUpdated={async (supplier) => {
                await loadSuppliers();
                requestClose();
                addToast({
                  message: "Supplier updated",
                  submessage: `${supplier}'s changes were saved.`,
                  status: "success",
                });
              }}
            />
          </Modal>
        ) : (
          //Add modal
          <Modal
            onClose={handleClosed}
            shouldCloseModal={shouldClose}
            modalTitle="Add supplier"
            modalSubtitle="Enter the supplier's information below"
          >
            <SuppliersForm
              onCancel={requestClose}
              onSupplierCreated={async (supplier) => {
                await loadSuppliers();
                requestClose();
                addToast({
                  message: "Supplier created",
                  submessage: `${supplier} was added to your suppliers.`,
                  status: "success",
                });
              }}
            />
          </Modal>
        ))}
    </>
  );
}

export default SuppliersTab;
