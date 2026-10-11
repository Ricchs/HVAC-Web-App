import { useContext } from "react";
import { UserRound } from "lucide-react";

import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { ToastContext } from "../notifications/ToastProvider";
import useResource from "../hooks/useResource";
import useModalState from "../hooks/useModalState";

import CustomerTable from "./CustomerTable";
import CustomerForm from "./CustomerForm";

function CustomersPage() {
  const { addToast } = useContext(ToastContext);

  // Customers list
  const {
    items: customers,
    search,
    setSearch,
    loadItems: loadCustomers,
    deleteItem: deleteCustomer,
  } = useResource({
    endpoint: "/api/customers",
    noun: "customer",
    pluralNoun: "customers",
    getName: (customer) => customer.full_name,
  });

  // Modal state
  const {
    selectedItem: selectedCustomer,
    isOpen,
    shouldClose,
    openAddModal,
    openEditModal,
    requestClose,
    handleClosed,
  } = useModalState();

  return (
    <div className="page">
      {/* Header */}
      <PageHeader
        title="Customers"
        actionLabel="+ Add Customer"
        onAction={openAddModal}
      />

      {/* Table toolbar */}
      <div className="table-toolbar">
        <input
          className="table-search"
          type="search"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className="table-filter">
          <option value="">Filter</option>
        </select>
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <EmptyState search={search} label="customers" icon={UserRound} />
      ) : (
        <CustomerTable
          customers={customers}
          onEditCustomer={openEditModal}
          onDeleteCustomer={deleteCustomer}
        />
      )}

      {/* Modal */}
      {isOpen &&
        (selectedCustomer ? (
          // Edit modal
          <Modal
            onClose={handleClosed}
            shouldCloseModal={shouldClose}
            modalTitle={`Edit Customer #${selectedCustomer.id}`}
            modalSubtitle="Modify the customer's information below"
          >
            <CustomerForm
              customer={selectedCustomer}
              onCancel={requestClose}
              onCustomerUpdated={async (customerName) => {
                await loadCustomers();
                requestClose();
                addToast({
                  message: "Customer updated",
                  submessage: `${customerName}'s changes were saved.`,
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
            modalTitle="Add Customer"
            modalSubtitle="Enter the customer's information below."
          >
            <CustomerForm
              onCancel={requestClose}
              onCustomerCreated={async (customerName) => {
                await loadCustomers();
                requestClose();
                addToast({
                  message: "Customer created",
                  submessage: `${customerName} was added to your customers.`,
                  status: "success",
                });
              }}
            />
          </Modal>
        ))}
    </div>
  );
}

export default CustomersPage;
