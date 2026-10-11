import ActionMenu from "../components/ActionMenu";
import { formatMoney } from "../utils/format";

import "../styles/tables.css";

function InventoryTable({ items, onEditItem, onDeleteItem }) {
  const badgeColour = { out: "red", low: "yellow", in: "green" };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Supplier</th>
            <th>Status</th>
            <th className="cell-right">Stock</th>
            <th className="cell-right">Cost</th>
            <th className="cell-right">Price</th>
            <th className="cell-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="table-primary-cell">{item.item}</td>
              <td>{item.category}</td>
              <td>{item.supplier}</td>
              <td>
                <span className={`badge ${badgeColour[item.status_code]}`}>
                  {item.status}
                </span>
              </td>
              <td className="cell-right">{item.stock}</td>
              <td className="cell-right">{formatMoney(item.bought_price)}</td>
              <td className="cell-right">{formatMoney(item.sale_price)}</td>
              <td className="cell-right">
                <ActionMenu
                  actions={[
                    {
                      label: "Edit",
                      onClick: () => onEditItem(item),
                    },
                    {
                      label: "Delete",
                      variant: "danger",
                      onClick: () => onDeleteItem(item),
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

export default InventoryTable;
