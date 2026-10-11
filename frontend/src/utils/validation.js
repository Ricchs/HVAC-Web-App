export function validation(requiredFields, formData) {
  const invalidFields = {};
  for (const requiredField of requiredFields) {
    const value = formData[requiredField];
    if (value === null || value === undefined) {
      invalidFields[requiredField] = "Please enter a value";
    } else if (typeof value === "string") {
      if (value.trim() === "") {
        invalidFields[requiredField] = "This field is required";
      }
    }
  }

  return invalidFields;
}
