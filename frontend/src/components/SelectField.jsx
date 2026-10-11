function SelectField({
  label,
  fieldId,

  placeholder,
  options,

  fieldValue,
  onChange,
  error,

  full,
}) {
  return (
    <div className={full ? "form-group full" : "form-group"}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
      </label>

      <select
        className={error ? "form-select error" : "form-select"}
        id={fieldId}
        name={fieldId}

        value={fieldValue}
        onChange={onChange}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default SelectField;
