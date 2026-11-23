import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { createCheckoutSession, createOrder } from '../api/orders';
import { errorMessage } from '../api/client';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';
import Spinner from '../components/Spinner';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import {
  ArrowRightIcon,
  CartIcon,
  MapPinIcon,
  TrashIcon,
} from '../components/Icons';
import { formatPrice } from '../utils/format';

function formatAddress(address) {
  if (!address) return '';

  const cityLine = [
    address.city,
    [address.state, address.zipcode].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(', ');

  return [address.street, cityLine, address.country]
    .filter(Boolean)
    .join(' · ');
}

export default function Cart() {
  const {
    status,
    error,
    lines,
    count,
    total,
    hasUnavailable,
    refresh,
    setQuantity,
    removeItem,
  } = useCart();

  const { profile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [busyId, setBusyId] = useState(null);
  const [pending, setPending] = useState({});
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  useEffect(() => {
    if (searchParams.get('payment_status') === 'cancelled') {
      toast.info(
        'Checkout was cancelled. Your items are still saved in your cart.'
      );
    }
  }, [searchParams, toast]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  async function handleQuantity(line, next) {
    if (next === line.quantity) return;

    setBusyId(line.productId);
    setPending((p) => ({
      ...p,
      [line.productId]: next,
    }));

    try {
      await setQuantity(line.productId, next);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update the quantity.'));
    } finally {
      setPending((p) => {
        const { [line.productId]: _discard, ...rest } = p;
        return rest;
      });

      setBusyId(null);
    }
  }

  async function handleRemove(line) {
    setBusyId(line.productId);

    try {
      await removeItem(line.productId);

      toast.info(
        `Removed “${line.product?.name ?? 'item'}” from your cart`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'Could not remove that item.'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCheckout() {
    setPlacing(true);

    const snapshot = {
      lines,
      total,
    };

    if (paymentMethod === 'stripe') {
      try {
        const origin = window.location.origin;

        const res = await createCheckoutSession(profile.id, {
          successUrl: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/cart?payment_status=cancelled`,
        });

        if (res && res.checkoutUrl) {
          sessionStorage.setItem(
            'ecom_checkout_snapshot',
            JSON.stringify(snapshot)
          );

          window.location.href = res.checkoutUrl;
        } else {
          throw new Error('Checkout session could not be created.');
        }
      } catch (err) {
        toast.error(
          errorMessage(
            err,
            'Could not initiate Stripe Checkout. Please try again.'
          )
        );

        setPlacing(false);
      }
    } else {
      try {
        const order = await createOrder(profile.id);

        await refresh().catch(() => {});

        navigate('/order-confirmation', {
          state: {
            order,
            ...snapshot,
          },
        });
      } catch (err) {
        toast.error(
          errorMessage(
            err,
            'We couldn’t place your order. Please try again.'
          )
        );

        setPlacing(false);
      }
    }
  }

  if (status === 'loading' && lines.length === 0) {
    return <PageLoader label="Loading your cart…" />;
  }

  if (status === 'error' && lines.length === 0) {
    return (
      <div className="container">
        <ErrorState
          title="We couldn’t load your cart"
          message={errorMessage(error)}
          onRetry={() => refresh().catch(() => {})}
        />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container">
        <EmptyState
          icon={<CartIcon size={28} />}
          title="Your cart is empty"
          message="Browse the collection and add something you like."
          action={
            <Link to="/" className="btn btn--primary">
              Start shopping
            </Link>
          }
        />
      </div>
    );
  }

  const address = formatAddress(profile?.address);

  return (
    <div className="container cart-page">

      {/* PAGE HEADER */}
      <header className="cart-page__header">
        <div>
          <span className="cart-page__eyebrow">Shopping cart</span>

          <h1 className="page-head__title">
            Your cart
          </h1>

          <p className="page-head__sub">
            {count} {count === 1 ? 'item' : 'items'} ready for checkout
          </p>
        </div>

        <Link to="/" className="cart-page__continue-top">
          Continue shopping
          <ArrowRightIcon size={16} />
        </Link>
      </header>

      <div className="cart">

        {/* LEFT: CART ITEMS */}
        <section className="cart__items-section">

          <div className="cart-section-header">
            <div>
              <h2>Your items</h2>
              <span>
                {count} {count === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>

          <ul className="cart__lines">
            {lines.map((line) => {
              const busy = busyId === line.productId;
              const stock =
                Number(line.product?.stockQuantity) || 0;

              return (
                <li
                  className={`cart-line${
                    line.available ? '' : ' is-unavailable'
                  }`}
                  key={line.productId}
                >

                  {/* PRODUCT IMAGE */}
                  <Link
                    to={`/products/${line.productId}`}
                    className="cart-line__media"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <ProductImage
                      src={line.product?.imageUrl}
                      name={line.product?.name ?? '?'}
                    />
                  </Link>

                  {/* PRODUCT DETAILS */}
                  <div className="cart-line__info">

                    {line.product?.category && (
                      <span className="eyebrow">
                        {line.product.category}
                      </span>
                    )}

                    {line.available ? (
                      <Link
                        to={`/products/${line.productId}`}
                        className="cart-line__name"
                      >
                        {line.product.name}
                      </Link>
                    ) : (
                      <span className="cart-line__name">
                        Product #{line.productId}
                      </span>
                    )}

                    {line.available ? (
                      <span className="cart-line__unit">
                        {formatPrice(line.unitPrice)} each
                      </span>
                    ) : (
                      <span className="badge badge--muted">
                        No longer available
                      </span>
                    )}

                    <button
                      type="button"
                      className="cart-line__remove cart-line__remove-mobile"
                      onClick={() => handleRemove(line)}
                      disabled={busy}
                    >
                      {busy ? (
                        <Spinner className="spinner--sm" />
                      ) : (
                        <>
                          <TrashIcon size={15} />
                          Remove
                        </>
                      )}
                    </button>

                  </div>

                  {/* QUANTITY */}
                  <div className="cart-line__qty">
                    {line.available ? (
                      <QuantityStepper
                        size="sm"
                        label={line.product.name}
                        value={
                          pending[line.productId] ??
                          line.quantity
                        }
                        min={1}
                        max={Math.max(1, stock)}
                        disabled={busy}
                        onMaxReached={(max) =>
                          toast.error(
                            `Only ${max} ${
                              max === 1 ? 'unit' : 'units'
                            } available in stock.`
                          )
                        }
                        onChange={(next) =>
                          handleQuantity(line, next)
                        }
                      />
                    ) : (
                      <span className="cart-line__qty-fixed">
                        Qty {line.quantity}
                      </span>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="cart-line__price-block">
                    <span className="cart-line__price-label">
                      Total
                    </span>

                    <div className="cart-line__total price">
                      {line.available
                        ? formatPrice(line.lineTotal)
                        : '—'}
                    </div>
                  </div>

                  {/* DESKTOP REMOVE */}
                  <button
                    type="button"
                    className="icon-btn icon-btn--ghost cart-line__remove cart-line__remove-desktop"
                    onClick={() => handleRemove(line)}
                    disabled={busy}
                    aria-label={`Remove ${
                      line.product?.name ??
                      `product ${line.productId}`
                    } from cart`}
                  >
                    {busy ? (
                      <Spinner className="spinner--sm" />
                    ) : (
                      <TrashIcon size={18} />
                    )}
                  </button>

                </li>
              );
            })}
          </ul>

          {/* TRUST / SHOPPING MESSAGE */}
          <div className="cart-trust">
            <div className="cart-trust__item">
              <span className="cart-trust__icon">✓</span>
              <div>
                <strong>Secure checkout</strong>
                <span>Your payment information is protected.</span>
              </div>
            </div>

            <div className="cart-trust__item">
              <span className="cart-trust__icon">✓</span>
              <div>
                <strong>Easy returns</strong>
                <span>Shop with confidence.</span>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT: SUMMARY */}
        <aside
          className="summary summary--checkout"
          aria-label="Order summary"
        >

          <div className="summary__heading">
            <div>
              <span className="summary__eyebrow">
                Checkout
              </span>

              <h2>Order summary</h2>
            </div>

            <span className="summary__item-count">
              {count} {count === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* PRICE SUMMARY */}
          <dl className="summary__rows">

            <div>
              <dt>
                Items ({count})
              </dt>

              <dd>
                {formatPrice(total)}
              </dd>
            </div>

            <div>
              <dt>
                Delivery
              </dt>

              <dd className="summary__free">
                Free
              </dd>
            </div>

            <div className="summary__divider" />

            <div className="summary__total">
              <dt>Total</dt>

              <dd className="price">
                {formatPrice(total)}
              </dd>
            </div>

          </dl>

          {/* DELIVERY */}
          {address && (
            <div className="summary__section">

              <div className="summary__section-header">
                <div className="summary__section-title">
                  <MapPinIcon size={17} />
                  <span>Delivering to</span>
                </div>

                <Link to="/profile">
                  Change
                </Link>
              </div>

              <div className="summary__address">
                {address}
              </div>

            </div>
          )}

          {/* PAYMENT */}
          <div className="summary__payment-methods">

            <div className="summary__section-title">
              <span>Payment method</span>
            </div>

            <div className="payment-options">

              {/* STRIPE */}
              <label
                className={`payment-option ${
                  paymentMethod === 'stripe'
                    ? 'is-selected'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={() =>
                    setPaymentMethod('stripe')
                  }
                />

                <div className="payment-option__content">

                 <div className="payment-option__title">
  <span className="payment-option__main">
    Pay with Stripe
  </span>
</div>
                  <span className="payment-option__desc">
                    Cards · Apple Pay · Google Pay
                  </span>

                </div>

              </label>

              {/* COD */}
              <label
                className={`payment-option ${
                  paymentMethod === 'direct'
                    ? 'is-selected'
                    : ''
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="direct"
                  checked={paymentMethod === 'direct'}
                  onChange={() =>
                    setPaymentMethod('direct')
                  }
                />

                <div className="payment-option__content">

                  <div className="payment-option__title">
                    <span className="payment-option__main">
                      Cash on Delivery
                    </span>
                  </div>

                  <span className="payment-option__desc">
                    Pay when your items arrive
                  </span>

                </div>

              </label>

            </div>
          </div>

          {/* UNAVAILABLE WARNING */}
          {hasUnavailable && (
            <p
              className="notice notice--warn"
              role="alert"
            >
              Remove the unavailable items to continue.
            </p>
          )}

          {/* CHECKOUT BUTTON */}
          <button
            type="button"
            className="btn btn--primary btn--lg btn--block summary__checkout"
            onClick={handleCheckout}
            disabled={placing || hasUnavailable}
          >
            {placing ? (
              <Spinner className="spinner--sm" />
            ) : paymentMethod === 'stripe' ? (
              <>
                <span>
                  Pay {formatPrice(total)}
                </span>

                <ArrowRightIcon size={18} />
              </>
            ) : (
              <>
                <span>
                  Place order · {formatPrice(total)}
                </span>

                <ArrowRightIcon size={18} />
              </>
            )}
          </button>

          <div className="summary__secure">
            <span>🔒</span>
            <span>
              Secure payment · Your information is protected
            </span>
          </div>

          <Link
            to="/"
            className="summary__continue"
          >
            Continue shopping
          </Link>

        </aside>

      </div>
    </div>
  );
}