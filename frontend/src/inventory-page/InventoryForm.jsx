import { useState, useContext } from "react";

import FormSection from "../components/FormSection";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";

import "../styles/forms.css";

function InventoryForm({
  item,
  supplierOptions,
  onCancel,
  onItemCreated,
  onItemUpdated,
}) {
  const [formData, setFormData] = useState({
    item: item ? (item.item ?? "") : "",
    category: item ? (item.category ?? "") : "",
    stock: item ? (item.stock ?? "") : "",
    bought_price: item ? (item.bought_price ?? "") : "",
    sale_price: item ? (item.sale_price ?? "") : "",
    suppliers_id: item ? (item.suppliers_id ?? "") : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLabel = item ? "Save changes" : "Create item";

  const { addToast } = useContext(ToastContext);

  function handleFormChange(e) {
    const name = e.target.name;
    let value = e.target.value;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    const url = item ? `/api/inventory/${item.id}` : "/api/inventory";
    const method = item ? "PUT" : "POST";

    try {
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (item) {
        await onItemUpdated(formData.item);
      } else {
        await onItemCreated(formData.item);
      }
    } catch (error) {
      addToast({
        message: "Couldn't save item",
        submessage: error.message,
        status: "error",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <form action="" className="form" onSubmit={handleFormSubmit}>
      {/* Product info */}
      <FormSection title="Product">
        <InputField
          label="Item name"
          fieldId="item"
          fieldType="text"
          fieldPlaceholder="Enter product name"
          fieldValue={formData.item}
          onChange={handleFormChange}
        />

        <SelectField
          label="Supplier"
          fieldId="suppliers_id"
          fieldValue={formData.suppliers_id}
          onChange={handleFormChange}
          options={supplierOptions}
          placeholder="Select supplier"
        />

        <SelectField
          label="Category"
          fieldId="category"
          fieldValue={formData.category}
          onChange={handleFormChange}
          options={[{ value: "placeholder", label: "Placeholder" }]}
          placeholder="Select category"
        />

        <InputField
          label="Stock"
          fieldId="stock"
          fieldType="number"
          fieldPlaceholder="0"
          fieldValue={formData.stock}
          onChange={handleFormChange}
        />
      </FormSection>

      {/* Pricing */}
      <FormSection title="Pricing">
        <InputField
          label="Cost price"
          fieldId="bought_price"
          fieldType="text"
          fieldPlaceholder="0.00"
          fieldValue={formData.bought_price}
          onChange={handleFormChange}
        />

        <InputField
          label="Sale price"
          fieldId="sale_price"
          fieldType="text"
          fieldPlaceholder="0.00"
          fieldValue={formData.sale_price}
          onChange={handleFormChange}
        />
      </FormSection>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default InventoryForm;
