import { useState, useContext } from "react";

import FormSection from "../components/FormSection";
import InputField from "../components/InputField";
import { ToastContext } from "../notifications/ToastProvider";
import { apiFetch } from "../utils/api";
import { formatPhone } from "../utils/format";

import "../styles/forms.css";

function CustomerForm({
  customer,
  onCancel,
  onCustomerCreated,
  onCustomerUpdated,
}) {
  const { addToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    full_name: customer ? (customer.full_name ?? "") : "",
    company_name: customer ? (customer.company_name ?? "") : "",
    phone: customer ? formatPhone(customer.phone ?? "") : "",
    business_phone: customer ? formatPhone(customer.business_phone ?? "") : "",
    email: customer ? (customer.email ?? "") : "",
    street_address: customer ? (customer.street_address ?? "") : "",
    city: customer ? (customer.city ?? "") : "",
    postal_code: customer ? (customer.postal_code ?? "") : "",
    country: customer ? (customer.country ?? "") : "",
    province: customer ? (customer.province ?? "") : "",
    rbq: customer ? (customer.rbq ?? "") : "",
    ccq: customer ? (customer.ccq ?? "") : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLabel = customer ? "Save changes" : "Create customer";

  function handleFormChange(e) {
    const name = e.target.name;
    let value = e.target.value;

    if (name === "phone" || name === "business_phone") {
      value = formatPhone(value);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    const url = customer ? `/customers/${customer.id}` : "/customers";
    const method = customer ? "PUT" : "POST";

    try {
      await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (customer) {
        await onCustomerUpdated(formData.full_name);
      } else {
        await onCustomerCreated(formData.full_name);
      }
    } catch (error) {
      addToast({
        message: "Couldn't save customer",
        submessage: error.message,
        status: "error",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleFormSubmit}>
      {/* Customer info */}
      <FormSection title="Customer">
        <InputField
          label="Full name"
          fieldId="full_name"
          fieldType="text"
          fieldPlaceholder="Enter full name"
          fieldValue={formData.full_name}
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

      {/* Business info */}
      <FormSection title="Business">
        <InputField
          label="Company name"
          fieldId="company_name"
          fieldType="text"
          fieldPlaceholder="Enter company name"
          fieldValue={formData.company_name}
          onChange={handleFormChange}
        />

        <InputField
          label="Business phone"
          fieldId="business_phone"
          fieldType="tel"
          fieldPlaceholder="(514) 123-1234"
          fieldValue={formData.business_phone}
          onChange={handleFormChange}
        />

        <InputField
          label="RBQ"
          fieldId="rbq"
          fieldType="text"
          fieldPlaceholder="1234-5678-90"
          fieldValue={formData.rbq}
          onChange={handleFormChange}
        />

        <InputField
          label="CCQ"
          fieldId="ccq"
          fieldType="text"
          fieldPlaceholder="1234567"
          fieldValue={formData.ccq}
          onChange={handleFormChange}
        />
      </FormSection>

      {/* Address */}
      <FormSection title="Address">
        <InputField
          label="Street address"
          fieldId="street_address"
          fieldType="text"
          fieldPlaceholder="1234 Main Street"
          fieldValue={formData.street_address}
          onChange={handleFormChange}
          full
        />

        <InputField
          label="City"
          fieldId="city"
          fieldType="text"
          fieldPlaceholder="Montreal"
          fieldValue={formData.city}
          onChange={handleFormChange}
        />

        <InputField
          label="Province"
          fieldId="province"
          fieldType="text"
          fieldPlaceholder="Quebec"
          fieldValue={formData.province}
          onChange={handleFormChange}
        />

        <InputField
          label="Postal code"
          fieldId="postal_code"
          fieldType="text"
          fieldPlaceholder="H3A 1A1"
          fieldValue={formData.postal_code}
          onChange={handleFormChange}
        />

        <InputField
          label="Country"
          fieldId="country"
          fieldType="text"
          fieldPlaceholder="Canada"
          fieldValue={formData.country}
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

export default CustomerForm;
