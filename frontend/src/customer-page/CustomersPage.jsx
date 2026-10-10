import { useEffect, useState, useContext } from "react";
import { UserRound } from "lucide-react";

import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";

import CustomerTable from "./CustomerTable";
import CustomerForm from "./CustomerForm";

function CustomersPage() {
  const { addToast } = useContext(ToastContext);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [search, setSearch] = useState("");

  const [isModalActive, setIsModalActive] = useState(false);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);

  // Load customer function
  async function loadCustomers(signal) {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    try {
      const data = await apiFetch(`/customers?${params}`, { signal });
      setCustomers(data);
    } catch (error) {
      if (error.name === "AbortError") return;

      addToast({
        message: "Couldn't load customers",
        submessage: error.message,
        status: "error",
      });
    }
  }

  // Delete customer function
  async function handleDeleteCustomer(customer) {
    if (!confirm(`Delete ${customer.full_name}?`)) return;

    try {
      await apiFetch(`/customers/${customer.id}`, { method: "DELETE" });
      await loadCustomers();

      addToast({
        message: "Customer deleted",
        submessage: `${customer.full_name} was removed from your customers.`,
        status: "success",
      });
    } catch (error) {
      addToast({
        message: "Couldn't delete customer",
        submessage: error.message,
        status: "error",
      });
    }
  }

  // Refresh table when user searches
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadCustomers(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  return (
    <div className="page">
      {/* Header */}
      <PageHeader
        title="Customers"
        actionLabel="+ Add Customer"
        onAction={() => {
          setSelectedCustomer(null);
          setIsModalActive(true);
        }}
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

        <select className="tab-filter">
          <option value="">Filter</option>
        </select>
      </div>

      {/* Table */}
      {customers.length === 0 ? (
        <EmptyState search={search} label="customers" icon={UserRound} />
      ) : (
        <CustomerTable
          customers={customers}
          onEditCustomer={(customer) => {
            setSelectedCustomer(customer);
            setIsModalActive(true);
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
      )}

      {/* Modal */}
      {isModalActive &&
        (selectedCustomer ? (
          // Edit modal
          <Modal
            onClose={() => {
              setSelectedCustomer(null);
              setShouldCloseModal(false);
              setIsModalActive(false);
            }}
            shouldCloseModal={shouldCloseModal}
            modalTitle={`Edit Customer #${selectedCustomer.id}`}
            modalSubtitle="Modify the customer's information below"
          >
            <CustomerForm
              customer={selectedCustomer}
              onCancel={() => {
                setShouldCloseModal(true);
              }}
              onCustomerUpdated={async (customerName) => {
                await loadCustomers();
                setShouldCloseModal(true);
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
            onClose={() => {
              setIsModalActive(false);
              setShouldCloseModal(false);
            }}
            shouldCloseModal={shouldCloseModal}
            modalTitle="Add Customer"
            modalSubtitle="Enter the customer's information below."
          >
            <CustomerForm
              onCancel={() => {
                setShouldCloseModal(true);
              }}
              onCustomerCreated={async (customerName) => {
                await loadCustomers();
                setShouldCloseModal(true);
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
