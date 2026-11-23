export default function Spinner({ label = 'Loading', className = '' }) {
  return <span className={`spinner ${className}`} role="status" aria-label={label} />;
}
