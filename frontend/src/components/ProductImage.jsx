import { useEffect, useState } from 'react';
import { hueFromString } from '../utils/format';

// Falls back to a tinted tile with the product's initial when the image is
// missing or fails to load (the catalogue stores free-form image URLs).
export default function ProductImage({ src, name = '', className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div
        className={`product-image product-image--fallback ${className}`.trim()}
        style={{ '--hue': hueFromString(name) }}
        aria-hidden="true"
      >
        <span>{(name.trim()[0] || '·').toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className={`product-image ${className}`.trim()}
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
