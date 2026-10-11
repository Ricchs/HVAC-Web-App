import ActionMenu from "../components/ActionMenu";
import { formatPhone } from "../utils/format";

import "../styles/tables.css";

function SuppliersTable({ suppliers, onEditSupplier, onDeleteSupplier }) {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Phone</th>
            <th>Email</th>
            <th className="cell-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="table-primary-cell">{supplier.company_name}</td>
              <td>{supplier.contact_name || "-"}</td>
              <td>{formatPhone(supplier.phone) || "-"}</td>
              <td>{supplier.email || "-"}</td>
              <td className="cell-right">
                <ActionMenu
                  actions={[
                    {
                      label: "Edit",
                      onClick: () => onEditSupplier(supplier),
                    },
                    {
                      label: "Delete",
                      variant: "danger",
                      onClick: () => onDeleteSupplier(supplier),
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

export default SuppliersTable;
