import ActionMenu from "../components/ActionMenu";
import { formatPhone } from "../utils/format";

import "../styles/tables.css";

function CustomerTable({ customers, onEditCustomer, onDeleteCustomer }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Full name</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="table-primary-cell">{customer.full_name}</td>
              <td>{customer.company_name || "-"}</td>
              <td>{formatPhone(customer.phone) || "-"}</td>
              <td>{customer.email || "-"}</td>
              <td>
                {[customer.street_address, customer.city]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </td>
              <td>
                <ActionMenu
                  actions={[
                    {
                      label: "Edit",
                      onClick: () => onEditCustomer(customer),
                    },
                    {
                      label: "Delete",
                      varaint: "danger",
                      onClick: () => onDeleteCustomer(customer),
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable;
