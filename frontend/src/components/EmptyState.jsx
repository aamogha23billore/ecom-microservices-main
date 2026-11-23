export default function EmptyState({ icon, title, message, action }) {
  return (
    <div className="state">
      {icon && <div className="state__icon">{icon}</div>}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
