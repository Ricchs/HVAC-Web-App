function PageHeader({ title, actionLabel, onAction }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>

      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
