function SelectField({
  label,
  fieldId,
  fieldValue,
  onChange,
  options,
  placeholder,
  full,
}) {
  return (
    <div className={full ? "form-group full" : "form-group"}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
      </label>

      <select
        id={fieldId}
        className="form-select"
        name={fieldId}
        value={fieldValue}
        onChange={onChange}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
