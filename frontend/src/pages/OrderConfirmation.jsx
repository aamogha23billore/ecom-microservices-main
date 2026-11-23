import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrderBySession } from '../api/orders';
import { errorMessage } from '../api/client';
import ProductImage from '../components/ProductImage';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import { CheckIcon } from '../components/Icons';
import { formatDate, formatPrice } from '../utils/format';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const { refresh } = useCart();

  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState(null);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [snapshotLines, setSnapshotLines] = useState([]);
  const [snapshotTotal, setSnapshotTotal] = useState(0);

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    try {
      const cached = sessionStorage.getItem('ecom_checkout_snapshot');

      if (cached) {
        const parsed = JSON.parse(cached);

        setSnapshotLines(parsed.lines || []);
        setSnapshotTotal(parsed.total || 0);

        sessionStorage.removeItem('ecom_checkout_snapshot');
      }
    } catch {}

    async function verify() {
      try {
        setLoading(true);

        let order = null;
        let lastError = null;
        let attempts = 0;

        /*
         * Stripe redirects the browser immediately after payment.
         *
         * The webhook may still be processing when this page loads.
         * Therefore the backend can temporarily return:
         *
         *     HTTP 200 + PENDING
         *
         * We keep polling until the webhook changes the order
         * to CONFIRMED.
         */
        while (attempts < 10) {
          try {
            order = await getOrderBySession(
              sessionId,
              profile?.id
            );

            lastError = null;

            const status = String(
              order?.status ?? ''
            ).toUpperCase();

            /*
             * Webhook has finished:
             *
             * Order -> CONFIRMED
             * Payment -> PAID
             * Cart -> cleared
             */
            if (status === 'CONFIRMED') {
              break;
            }

          } catch (err) {
            lastError = err;
            order = null;
          }

          attempts++;

          /*
           * Wait one second before checking again.
           */
          if (attempts < 10) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000)
            );
          }
        }

        /*
         * We never received an order.
         */
        if (!order) {
          throw (
            lastError ||
            new Error('Order could not be found yet.')
          );
        }

        /*
         * We received an order, but it never became CONFIRMED
         * within the 10-second polling window.
         */
        const finalStatus = String(
          order.status ?? ''
        ).toUpperCase();

        if (finalStatus !== 'CONFIRMED') {
          throw new Error(
            'Your payment was received, but the order is still being finalized. Please check My Orders in a moment.'
          );
        }

        /*
         * Only use the verified database order after the
         * webhook has confirmed it.
         */
        if (mounted) {
          setVerifiedOrder(order);

          /*
           * The webhook clears the cart in the backend.
           * Refresh the frontend cart context so the navbar
           * cart badge reflects the cleared cart.
           */
          await refresh().catch(() => {});
        }

      } catch (err) {
        if (mounted) {
          setError(
            errorMessage(
              err,
              'Your payment was received, but your order is still being finalized. Please check My Orders in a moment.'
            )
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    verify();

    return () => {
      mounted = false;
    };
  }, [sessionId, profile?.id, refresh]);

  /*
   * Wait while the Stripe webhook finishes.
   */
  if (loading) {
    return (
      <div
        className="container container--narrow"
        style={{
          textAlign: 'center',
          padding: '60px 0',
        }}
      >
        <Spinner className="spinner--lg" />

        <h2
          style={{
            marginTop: '20px',
            fontSize: '1.4rem',
          }}
        >
          Confirming your order...
        </h2>

        <p className="confirm__lead">
          Your payment was successful. Please wait a moment while we finish creating your order.
        </p>
      </div>
    );
  }

  /*
   * Show an error if the order could not be confirmed.
   */
  if (error) {
    return (
      <div className="container container--narrow">
        <ErrorState
          title="Order Confirmation"
          message={error}
          action={
            <Link
              to="/orders"
              className="btn btn--primary"
            >
              View My Orders
            </Link>
          }
        />
      </div>
    );
  }

  /*
   * For Stripe checkout, verifiedOrder is the order fetched
   * after the webhook confirmed it.
   *
   * state?.order is retained as a fallback for normal
   * non-Stripe order navigation.
   */
  const order = verifiedOrder || state?.order;

  /*
   * Reached this page without an order.
   */
  if (!order) {
    return <Navigate to="/" replace />;
  }

  /*
   * Product lines can come from router state or the
   * checkout snapshot saved in sessionStorage.
   */
  const lines =
    state?.lines && state.lines.length > 0
      ? state.lines
      : snapshotLines;

  const total =
    state?.total ||
    snapshotTotal ||
    order.totalAmount ||
    0;

  const status = String(
    order.status ?? 'CONFIRMED'
  );

  const isStripe =
    order.paymentMethod === 'STRIPE' ||
    Boolean(sessionId);

  return (
    <div className="container container--narrow">
      <div className="confirm">

        <div className="confirm__badge">
          <CheckIcon size={30} />
        </div>

        <h1 className="confirm__title">
          Thank you
          {profile?.firstName
            ? `, ${profile.firstName}`
            : ''}!
        </h1>

        <p className="confirm__lead">
          {isStripe
            ? 'Your payment was successful and your order is confirmed!'
            : 'Your order has been placed. We’ll take it from here.'}
        </p>

        <dl className="confirm__meta">

          <div>
            <dt>Order number</dt>
            <dd>#{order.id}</dd>
          </div>

          <div>
            <dt>Status</dt>

            <dd>
              <span
                className={`status status--${status.toLowerCase()}`}
              >
                {status.charAt(0) +
                  status.slice(1).toLowerCase()}
              </span>
            </dd>
          </div>

          <div>
            <dt>Payment</dt>

            <dd>
              {isStripe ? (
                <span
                  className="badge badge--success"
                  style={{ fontWeight: 600 }}
                >
                  Paid via Stripe
                </span>
              ) : (
                <span className="badge badge--muted">
                  Cash on Delivery
                </span>
              )}
            </dd>
          </div>

          {order.createdAt && (
            <div>
              <dt>Placed</dt>
              <dd>
                {formatDate(order.createdAt)}
              </dd>
            </div>
          )}

        </dl>

        {lines.length > 0 && (
          <ul className="confirm__items">

            {lines.map((line) => (
              <li key={line.productId}>

                <div className="confirm__thumb">
                  <ProductImage
                    src={line.product?.imageUrl}
                    name={line.product?.name ?? '?'}
                  />
                </div>

                <div className="confirm__item-info">

                  <span className="confirm__item-name">
                    {line.product?.name ??
                      `Product #${line.productId}`}
                  </span>

                  <span className="confirm__item-qty">
                    {line.quantity} ×{' '}
                    {formatPrice(line.unitPrice)}
                  </span>

                </div>

                <span className="price">
                  {formatPrice(line.lineTotal)}
                </span>

              </li>
            ))}

          </ul>
        )}

        <div className="confirm__total">
          <span>Total</span>

          <span className="price">
            {formatPrice(total)}
          </span>
        </div>

        <div className="confirm__actions">

          <Link
            to="/orders"
            className="btn btn--secondary btn--lg"
          >
            View my orders
          </Link>

          <Link
            to="/"
            className="btn btn--primary btn--lg"
          >
            Continue shopping
          </Link>

        </div>

      </div>
    </div>
  );
}
