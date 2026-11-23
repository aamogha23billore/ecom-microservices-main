export default function Field({ label, htmlFor, hint, error, className = '', children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {error ? (
        <p className="field__msg field__msg--error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__msg">{hint}</p>
      ) : null}
    </div>
  );
}
