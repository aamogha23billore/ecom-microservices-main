import { useMemo, useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { useDebounced } from '../hooks/useDebounced';
import { listProducts, searchProducts } from '../api/products';
import { errorMessage } from '../api/client';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { CloseIcon, PackageIcon, SearchIcon } from '../components/Icons';

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
];

export default function Shop() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  const keyword = useDebounced(query.trim(), 350);

  const { status, data, error, reload } = useAsync(
    (signal) =>
      keyword
        ? searchProducts(keyword, { signal })
        : listProducts({ signal }),
    [keyword],
  );

  const all = useMemo(
    () => (data ?? []).filter((p) => p.active !== false),
    [data],
  );

  const categories = useMemo(() => {
    const names = new Set(
      all.map((p) => p.category).filter(Boolean),
    );

    return [
      { name: 'All' },
      ...[...names]
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({ name })),
    ];
  }, [all]);

  const activeCategory = categories.some(
    (item) => item.name === category,
  )
    ? category
    : 'All';

  const products = useMemo(() => {
    const list =
      activeCategory === 'All'
        ? [...all]
        : all.filter(
            (p) => p.category === activeCategory,
          );

    switch (sort) {
      case 'price-asc':
        return list.sort(
          (a, b) => Number(a.price) - Number(b.price),
        );

      case 'price-desc':
        return list.sort(
          (a, b) => Number(b.price) - Number(a.price),
        );

      case 'name':
        return list.sort(
          (a, b) =>
            String(a.name).localeCompare(String(b.name)),
        );

      default:
        return list;
    }
  }, [all, activeCategory, sort]);

  const firstLoad =
    status === 'loading' && data === null;

  const refreshing =
    status === 'loading' && data !== null;

  return (
    <div className="container shop">
      <header className="page-head shop__head">
  <div>
    <span className="eyebrow">
      Curated for everyday life
    </span>

    <h1 className="page-head__title">
      Shop the collection
    </h1>

    <p className="page-head__sub">
      {firstLoad
        ? 'Loading products…'
        : status === 'error'
          ? 'Browse everything we have in stock.'
          : keyword
            ? `${products.length} ${
                products.length === 1
                  ? 'product'
                  : 'products'
              } matching “${keyword}”`
            : 'Discover products across electronics, fashion, home, beauty and more.'}
    </p>
  </div>
</header>
      <div className="toolbar">
        <div className="search">
          <SearchIcon size={18} />

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />

          {query && (
            <button
              type="button"
              className="search__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>

        <label className="select">
          <span className="sr-only">
            Sort products
          </span>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORTS.map((s) => (
              <option
                key={s.value}
                value={s.value}
              >
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {categories.length > 2 && (
        <div
          className="chips"
          role="group"
          aria-label="Filter by category"
        >
          {categories.map(({ name }) => (
            <button
              key={name}
              type="button"
              className={`chip${
                name === activeCategory
                  ? ' is-active'
                  : ''
              }`}
              aria-pressed={
                name === activeCategory
              }
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {status === 'error' ? (
        <ErrorState
          title="We couldn’t load the products"
          message={errorMessage(error)}
          onRetry={reload}
        />
      ) : firstLoad ? (
        <div
          className="product-grid"
          aria-busy="true"
        >
          {Array.from(
            { length: 8 },
            (_, i) => (
              <ProductCardSkeleton key={i} />
            ),
          )}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<PackageIcon size={28} />}
          title={
            keyword
              ? 'No matches found'
              : 'Nothing here yet'
          }
          message={
            keyword
              ? `We couldn’t find anything for “${keyword}”. Try a different word.`
              : 'There are no products to show right now.'
          }
          action={
            query ? (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setQuery('')}
              >
                Clear search
              </button>
            ) : null
          }
        />
      ) : (
        <div
          className={`product-grid${
            refreshing
              ? ' is-refreshing'
              : ''
          }`}
          aria-busy={refreshing}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}