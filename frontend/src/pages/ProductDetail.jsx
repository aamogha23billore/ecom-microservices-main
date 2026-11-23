import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { getProduct } from '../api/products';
import { errorMessage } from '../api/client';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductImage from '../components/ProductImage';
import QuantityStepper from '../components/QuantityStepper';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { ArrowLeftIcon, CartIcon, PackageIcon } from '../components/Icons';
import { formatPrice } from '../utils/format';

export default function ProductDetail() {
  const { id } = useParams();
  const { status, data, error, reload } = useAsync((signal) => getProduct(id, { signal }), [id]);
  const { addItem, lines } = useCart();
  const toast = useToast();
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => setQuantity(1), [id]);

  // `data` can briefly belong to the previous id while a new one loads.
  const product = data && String(data.id) === String(id) ? data : null;

  if (status === 'error') {
    return (
      <div className="container">
        {error?.status === 404 ? (
          <EmptyState
            icon={<PackageIcon size={28} />}
            title="Product not found"
            message="It may have been removed or is no longer available."
            action={
              <Link to="/" className="btn btn--primary">
                Back to shop
              </Link>
            }
          />
        ) : (
          <ErrorState title="We couldn’t load this product" message={errorMessage(error)} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="detail detail--skeleton" aria-busy="true">
          <div className="detail__media skeleton" />
          <div className="detail__info">
            <span className="skeleton skeleton--line skeleton--short" />
            <span className="skeleton skeleton--title" />
            <span className="skeleton skeleton--line skeleton--price" />
            <span className="skeleton skeleton--block" />
          </div>
        </div>
      </div>
    );
  }

  const stock = Number(product.stockQuantity) || 0;
  const soldOut = stock <= 0;
  const inCart = lines.find((l) => l.productId === String(product.id))?.quantity ?? 0;

  async function handleAdd() {
    setBusy(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} × “${product.name}” to your cart`);
      setQuantity(1);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not add this item to your cart.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">
        <ArrowLeftIcon size={18} /> Back to shop
      </Link>

      <div className="detail">
        <div className="detail__media">
          <ProductImage src={product.imageUrl} name={product.name} />
        </div>

        <div className="detail__info">
          {product.category && <span className="eyebrow">{product.category}</span>}
          <h1 className="detail__title">{product.name}</h1>
          <p className="detail__price price">{formatPrice(product.price)}</p>

          <p className={`stock ${soldOut ? 'stock--out' : stock <= 5 ? 'stock--low' : 'stock--in'}`}>
            <span className="stock__dot" />
            {soldOut ? 'Sold out' : stock <= 5 ? `Only ${stock} left in stock` : 'In stock'}
          </p>

          {product.description && <p className="detail__desc">{product.description}</p>}

          <div className="detail__buy">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              max={Math.max(1, stock)}
              disabled={soldOut || busy}
            />
            <button
              type="button"
              className="btn btn--primary btn--lg detail__add"
              onClick={handleAdd}
              disabled={soldOut || busy}
            >
              {busy ? <Spinner className="spinner--sm" /> : <CartIcon size={20} />}
              {soldOut ? 'Sold out' : 'Add to cart'}
            </button>
          </div>

          {inCart > 0 && (
            <p className="detail__incart">
              You have {inCart} in your cart. <Link to="/cart">View cart</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
