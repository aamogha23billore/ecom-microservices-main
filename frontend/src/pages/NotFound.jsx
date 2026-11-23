import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { StoreIcon } from '../components/Icons';

export default function NotFound() {
  return (
    <div className="container">
      <EmptyState
        icon={<StoreIcon size={28} />}
        title="Page not found"
        message="The page you’re looking for doesn’t exist or has moved."
        action={
          <Link to="/" className="btn btn--primary">
            Back to shop
          </Link>
        }
      />
    </div>
  );
}
