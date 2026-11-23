import Spinner from './Spinner';

export default function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader">
      <Spinner className="spinner--lg" label={label} />
      <p>{label}</p>
    </div>
  );
}
