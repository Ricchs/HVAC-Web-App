function InputField({
  label,
  fieldId,

  fieldType,
  inputMode,
  fieldPlaceholder,

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

      <input
        className={error ? "form-input error" : "form-input"}
        id={fieldId}
        name={fieldId}

        type={fieldType}
        inputMode={inputMode}
        placeholder={fieldPlaceholder}

        value={fieldValue}
        onChange={onChange}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default InputField;
