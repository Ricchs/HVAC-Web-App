function FormSection({ title, children }) {
  return (
    <div className="form-section">
      <h3>{title}</h3>
      <div className="form-grid">{children}</div>
    </div>
  );
}

export default FormSection;
