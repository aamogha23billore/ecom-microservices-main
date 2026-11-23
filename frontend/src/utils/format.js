import { config } from '../config';

let priceFormatter;
function getPriceFormatter() {
  if (!priceFormatter) {
    try {
      priceFormatter = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
      });
    } catch {
      // Invalid currency code in env: fall back to a plain 2-decimal number.
      priceFormatter = new Intl.NumberFormat(config.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }
  return priceFormatter;
}

export function formatPrice(value) {
  return getPriceFormatter().format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(config.locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function initials(name = '') {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
  return letters || '?';
}

// Stable 0-359 number from a string; used to tint placeholder images.
export function hueFromString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % 360;
}
