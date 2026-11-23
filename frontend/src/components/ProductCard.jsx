import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage';
import Spinner from './Spinner';
import { PlusIcon } from './Icons';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const stock = Number(product.stockQuantity) || 0;

  const soldOut = stock <= 0;
  const low = !soldOut && stock <= 5;

  const stockLabel = soldOut
    ? 'Sold out'
    : low
      ? `Only ${stock} left`
      : 'In stock';

  const href = `/products/${product.id}`;

  async function handleAdd() {
    if (busy || soldOut) return;

    setBusy(true);

    try {
      await addItem(product.id, 1);

      toast.success(
        `Added “${product.name}” to your cart`,
      );
    } catch (err) {
      toast.error(
        errorMessage(
          err,
          'Could not add this item to your cart.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="product-card">
      <Link
        to={href}
        className="product-card__media"
        aria-label={`View ${product.name}`}
        tabIndex={-1}
      >
        <ProductImage
          src={product.imageUrl}
          name={product.name}
        />

        {soldOut && (
          <span className="badge badge--muted">
            Sold out
          </span>
        )}

        {low && (
          <span className="badge badge--accent">
            Only {stock} left
          </span>
        )}
      </Link>

      <div className="product-card__body">
        {product.category && (
          <span className="eyebrow">
            {product.category}
          </span>
        )}

        <h3 className="product-card__name">
          <Link to={href}>
            {product.name}
          </Link>
        </h3>

        <span
          className={`product-card__stock${
            soldOut
              ? ' product-card__stock--out'
              : low
                ? ' product-card__stock--low'
                : ''
          }`}
        >
          <span className="product-card__stock-dot" />
          {stockLabel}
        </span>

        <div className="product-card__foot">
          <div className="product-card__price">
            <span className="price">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            type="button"
            className="icon-btn icon-btn--brand"
            onClick={handleAdd}
            disabled={soldOut || busy}
            aria-label={
              soldOut
                ? `${product.name} is sold out`
                : `Add ${product.name} to cart`
            }
          >
            {busy ? (
              <Spinner className="spinner--sm" />
            ) : (
              <PlusIcon size={20} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}