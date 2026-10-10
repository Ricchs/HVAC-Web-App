function InputField({
  label,
  fieldId,
  fieldType,
  fieldPlaceholder,
  fieldValue,
  onChange,
  full,
}) {
  return (
    <div className={full ? "form-group full" : "form-group"}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
      </label>

      <input
        id={fieldId}
        className="form-input"
        name={fieldId}
        type={fieldType}
        placeholder={fieldPlaceholder}
        value={fieldValue}
        onChange={onChange}
      />
    </div>
  );
}

export default InputField;
