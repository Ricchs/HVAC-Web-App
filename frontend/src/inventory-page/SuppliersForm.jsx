import { useState, useContext } from "react";

import FormSection from "../components/FormSection";
import InputField from "../components/InputField";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";
import { formatPhone } from "../utils/format";
import { validation } from "../utils/validation";

import "../styles/forms.css";

const requiredFields = ["company_name"];

function SuppliersForm({
  supplier,
  onCancel,
  onSupplierCreated,
  onSupplierUpdated,
}) {
  const [formData, setFormData] = useState({
    company_name: supplier ? (supplier.company_name ?? "") : "",
    contact_name: supplier ? (supplier.contact_name ?? "") : "",
    phone: supplier ? (supplier.phone ?? "") : "",
    email: supplier ? (supplier.email ?? "") : "",
  });

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLabel = supplier ? "Save changes" : "Create supplier";

  const { addToast } = useContext(ToastContext);

  function handleFormChange(e) {
    const name = e.target.name;
    let value = e.target.value;

    if (name === "phone") value = formatPhone(value);

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

    const url = supplier ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
    const method = supplier ? "PUT" : "POST";

    try {
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (supplier) {
        await onSupplierUpdated(formData.company_name);
      } else {
        await onSupplierCreated(formData.company_name);
      }
    } catch (error) {
      addToast({
        message: "Couldn't save supplier",
        submessage: error.message,
        status: "error",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleFormSubmit}>
      {/* Company name */}
      <FormSection title="Company">
        <InputField
          label="Company name"
          fieldId="company_name"

          fieldType="text"
          inputMode="text"
          fieldPlaceholder="Enter company's name"

          fieldValue={formData.company_name}
          onChange={handleFormChange}
          error={errors.company_name}

          full
        />
      </FormSection>

      <FormSection title="Contact">
        <InputField
          label="Contact name"
          fieldId="contact_name"
          fieldType="text"
          fieldPlaceholder="Enter contact name"
          fieldValue={formData.contact_name}
          onChange={handleFormChange}
        />

        <InputField
          label="Phone"
          fieldId="phone"
          fieldType="tel"
          fieldPlaceholder="(514) 123-1234"
          fieldValue={formData.phone}
          onChange={handleFormChange}
        />

        <InputField
          label="Email"
          fieldId="email"
          fieldType="email"
          fieldPlaceholder="name@example.com"
          fieldValue={formData.email}
          onChange={handleFormChange}
          full
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

export default SuppliersForm;
