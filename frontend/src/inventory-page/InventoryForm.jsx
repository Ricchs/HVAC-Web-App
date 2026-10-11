import { useState, useContext } from "react";

import FormSection from "../components/FormSection";
import InputField from "../components/InputField";
import SelectField from "../components/SelectField";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";
import { validation } from "../utils/validation";

import "../styles/forms.css";

const requiredFields = [
  "item",
  "suppliers_id",
  "category",
  "stock",
  "bought_price",
  "sale_price",
];

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

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLabel = item ? "Save changes" : "Create item";

  const { addToast } = useContext(ToastContext);

  function handleFormChange(e) {
    const name = e.target.name;
    let value = e.target.value;

    if (name === "stock") {
      value = value.replace(/\D/g, "");
    } else if (name === "sale_price" || name === "bought_price") {
      value = value.replace(/[^\d.]/g, "");

      const [whole, ...rest] = value.split(".");
      if (rest.length > 0) {
        value = whole + "." + rest.join("").slice(0, 2);
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    const { [name]: _removed, ...rest } = errors;
    setErrors(rest);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const result = validation(requiredFields, formData);
    if (Object.keys(result).length > 0) {
      setErrors(result);
      return;
    }

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
          inputMode="text"
          fieldPlaceholder="Enter product name"

          fieldValue={formData.item}
          onChange={handleFormChange}
          error={errors.item}
        />

        <SelectField
          label="Supplier"
          fieldId="suppliers_id"

          placeholder="Select supplier"
          options={supplierOptions}

          fieldValue={formData.suppliers_id}
          onChange={handleFormChange}
          error={errors.suppliers_id}
        />

        <SelectField
          label="Category"
          fieldId="category"

          placeholder="Select category"
          options={[{ value: "placeholder", label: "Placeholder" }]}

          fieldValue={formData.category}
          onChange={handleFormChange}
          error={errors.category}
        />

        <InputField
          label="Stock"
          fieldId="stock"

          fieldType="text"
          inputMode="numeric"
          fieldPlaceholder="0"

          fieldValue={formData.stock}
          onChange={handleFormChange}
          error={errors.stock}
        />
      </FormSection>

      {/* Pricing */}
      <FormSection title="Pricing">
        <InputField
          label="Cost price"
          fieldId="bought_price"

          fieldType="text"
          inputMode="decimal"
          fieldPlaceholder="0.00"

          fieldValue={formData.bought_price}
          onChange={handleFormChange}
          error={errors.bought_price}
        />

        <InputField
          label="Sale price"
          fieldId="sale_price"

          fieldType="text"
          inputMode="decimal"
          fieldPlaceholder="0.00"

          fieldValue={formData.sale_price}
          onChange={handleFormChange}
          error={errors.sale_price}
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
