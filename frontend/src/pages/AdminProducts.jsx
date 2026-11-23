import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { createProduct, deleteProduct, listProducts, updateProduct } from '../api/products';
import { errorMessage } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Field from '../components/Field';
import Spinner from '../components/Spinner';
import PageLoader from '../components/PageLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ProductImage from '../components/ProductImage';
import { EditIcon, PackageIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { formatPrice } from '../utils/format';

function ProductFormModal({ product, onClose, onSaved }) {
  const isNew = !product;
  const toast = useToast();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    category: product?.category ?? '',
    price: product?.price ?? '',
    stockQuantity: product?.stockQuantity ?? '',
    imageUrl: product?.imageUrl ?? '',
    description: product?.description ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    const price = Number(form.price);
    if (form.price === '' || Number.isNaN(price) || price < 0) next.price = 'Enter a valid price';
    const stock = Number(form.stockQuantity);
    if (form.stockQuantity === '' || !Number.isInteger(stock) || stock < 0) next.stockQuantity = 'Enter a whole number';
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      stockQuantity: stock,
      category: form.category.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    setSaving(true);
    try {
      if (isNew) await createProduct(payload);
      else await updateProduct(product.id, payload);
      toast.success(isNew ? 'Product created' : 'Product updated');
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err, 'We couldn’t save this product.'));
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isNew ? 'New product' : 'Edit product'}
      onClose={saving ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn btn--primary" disabled={saving}>
            {saving ? <Spinner className="spinner--sm" /> : isNew ? 'Create product' : 'Save changes'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Field label="Name" htmlFor="p-name" error={errors.name} className="form-grid__full">
            <input id="p-name" value={form.name} onChange={set('name')} />
          </Field>
          <Field label="Category" htmlFor="p-category">
            <input id="p-category" value={form.category} onChange={set('category')} placeholder="e.g. Electronics" />
          </Field>
          <Field label="Price" htmlFor="p-price" error={errors.price}>
            <input id="p-price" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} />
          </Field>
          <Field label="Stock quantity" htmlFor="p-stock" error={errors.stockQuantity}>
            <input id="p-stock" type="number" step="1" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} />
          </Field>
          <Field label="Image URL" htmlFor="p-image">
            <input id="p-image" type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://…" />
          </Field>
          <Field label="Description" htmlFor="p-desc" className="form-grid__full">
            <textarea id="p-desc" rows="4" value={form.description} onChange={set('description')} />
          </Field>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ product, onClose, onDeleted }) {
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success(`Deleted “${product.name}”`);
      onDeleted();
    } catch (err) {
      toast.error(errorMessage(err, 'We couldn’t delete this product.'));
      setDeleting(false);
    }
  }

  return (
    <Modal
      title="Delete product?"
      onClose={deleting ? () => {} : onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={deleting} data-autofocus>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={confirm} disabled={deleting}>
            {deleting ? <Spinner className="spinner--sm" /> : 'Delete'}
          </button>
        </>
      }
    >
      <p>
        “{product.name}” will be removed from the shop. Carts that still contain it will show it as unavailable.
      </p>
    </Modal>
  );
}

export default function AdminProducts() {
  const { status, data, error, reload } = useAsync((signal) => listProducts({ signal }), []);
  const [editing, setEditing] = useState(null); // product object, or 'new'
  const [deleting, setDeleting] = useState(null);

  const products = data ?? [];

  function afterChange() {
    setEditing(null);
    setDeleting(null);
    reload();
  }

  return (
    <div className="container">
      <header className="page-head">
        <div>
          <h1 className="page-head__title">Manage products</h1>
          <p className="page-head__sub">
            {status === 'success' ? `${products.length} ${products.length === 1 ? 'product' : 'products'} in the catalogue` : 'Add, edit and remove catalogue items.'}
          </p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
          <PlusIcon size={18} /> New product
        </button>
      </header>

      {status === 'loading' && data === null ? (
        <PageLoader label="Loading products…" />
      ) : status === 'error' ? (
        <ErrorState title="We couldn’t load the products" message={errorMessage(error)} onRetry={reload} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={28} />}
          title="No products yet"
          message="Create the first product to get the shop started."
          action={
            <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
              New product
            </button>
          }
        />
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col" className="num">
                  Price
                </th>
                <th scope="col" className="num">
                  Stock
                </th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="table__product">
                      <div className="table__thumb">
                        <ProductImage src={product.imageUrl} name={product.name} />
                      </div>
                      <span className="table__name">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category || '—'}</td>
                  <td className="num">{formatPrice(product.price)}</td>
                  <td className="num">
                    <span className={`stock-pill${Number(product.stockQuantity) <= 0 ? ' is-out' : Number(product.stockQuantity) <= 5 ? ' is-low' : ''}`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <div className="table__actions">
                      <button
                        type="button"
                        className="icon-btn icon-btn--ghost"
                        onClick={() => setEditing(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <EditIcon size={18} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--ghost icon-btn--danger"
                        onClick={() => setDeleting(product)}
                        aria-label={`Delete ${product.name}`}
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductFormModal
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={afterChange}
        />
      )}
      {deleting && <DeleteDialog product={deleting} onClose={() => setDeleting(null)} onDeleted={afterChange} />}
    </div>
  );
}
