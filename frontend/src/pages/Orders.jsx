import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useAsync } from '../hooks/useAsync';
import { listOrders } from '../api/orders';
import { listProducts } from '../api/products';
import { errorMessage } from '../api/client';
import ProductImage from '../components/ProductImage';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { PackageIcon } from '../components/Icons';
import { formatDate, formatPrice } from '../utils/format';

function titleCase(value) {
  const text = String(value ?? '');
  return text.charAt(0) + text.slice(1).toLowerCase();
}

export default function Orders() {
  const { profile } = useAuth();

  const { status, data, error, reload } = useAsync(
    async (signal) => {
      const [orders, products] = await Promise.all([
        listOrders(profile.id, { signal }),
        // Names and images are a nicety: if the catalogue fails, still show the orders.
        listProducts({ signal }).catch((err) => {
          if (err?.name === 'AbortError') throw err;
          return [];
        }),
      ]);
      return {
        orders: orders ?? [],
        byId: new Map((products ?? []).map((p) => [String(p.id), p])),
      };
    },
    [profile.id],
  );

  if (status === 'error') {
    return (
      <div className="container">
        <ErrorState title="We couldn’t load your orders" message={errorMessage(error)} onRetry={reload} />
      </div>
    );
  }

  if (!data) return <PageLoader label="Loading your orders…" />;

  const { orders, byId } = data;

  if (orders.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon={<PackageIcon size={28} />}
          title="No orders yet"
          message="When you place an order it will show up here."
          action={
            <Link to="/" className="btn btn--primary">
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container container--narrow">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Your orders</h1>
          <p className="page-head__sub">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}, newest first
          </p>
        </div>
      </header>

      <ol className="orders">
        {orders.map((order) => {
          const units = (order.items ?? []).reduce((n, item) => n + (item.quantity ?? 0), 0);
          const statusKey = String(order.status ?? '').toLowerCase();
          return (
            <li className="order-card" key={order.id}>
              <header className="order-card__head">
                <div>
                  <h2 className="order-card__id">Order #{order.id}</h2>
                  <p className="order-card__date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-card__summary">
                  {order.paymentMethod === 'STRIPE' && (
                    <span className="badge badge--success" style={{ fontSize: '0.75rem', marginRight: '6px' }}>
                      Paid with Stripe
                    </span>
                  )}
                  <span className={`status status--${statusKey}`}>{titleCase(order.status)}</span>
                  <span className="order-card__total price">{formatPrice(order.totalAmount)}</span>
                </div>
              </header>

              <ul className="order-card__items">
                {(order.items ?? []).map((item) => {
                  const product = byId.get(String(item.productId));
                  const name = product?.name ?? `Product #${item.productId}`;
                  return (
                    <li className="order-item" key={item.id ?? item.productId}>
                      <div className="order-item__thumb">
                        <ProductImage src={product?.imageUrl} name={product?.name ?? '?'} />
                      </div>
                      <div className="order-item__info">
                        {product ? (
                          <Link to={`/products/${item.productId}`} className="order-item__name">
                            {name}
                          </Link>
                        ) : (
                          <span className="order-item__name">{name}</span>
                        )}
                        <span className="order-item__qty">
                          {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </div>
                      <span className="price">{formatPrice(item.subTotal)}</span>
                    </li>
                  );
                })}
              </ul>

              <footer className="order-card__foot">
                {units} {units === 1 ? 'item' : 'items'}
              </footer>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
