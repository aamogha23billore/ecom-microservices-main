import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { addToCart, getCart, removeFromCart, updateCartItem } from '../api/cart';
import { listProducts } from '../api/products';

const CartContext = createContext(null);

/**
 * The cart endpoint only returns { id, userId, productId, quantity, price }.
 * We join it with the product catalogue (ONE request for all products, not one
 * per cart line - the gateway rate-limits the products route) so the UI can
 * show names, images and the real current price.
 */
export function CartProvider({ children }) {
  const { profile } = useAuth();
  const userId = profile?.id;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const [items, setItems] = useState([]);
  const [state, setState] = useState({ status: 'idle', error: null });

  const refresh = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    setState((s) => ({ status: s.status === 'ready' ? 'ready' : 'loading', error: null }));
    try {
      const [raw, products] = await Promise.all([getCart(uid), listProducts()]);
      const byId = new Map((products ?? []).map((p) => [String(p.id), p]));
      setItems(
        (raw ?? []).map((item) => ({
          ...item,
          productId: String(item.productId),
          product: byId.get(String(item.productId)) ?? null,
        })),
      );
      setState({ status: 'ready', error: null });
    } catch (error) {
      setState({ status: 'error', error });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (userId) {
      refresh().catch(() => {});
    } else {
      setItems([]);
      setState({ status: 'idle', error: null });
    }
  }, [userId, refresh]);

  const requireUserId = () => {
    if (!userIdRef.current) {
      throw new Error('Your login has no customer profile yet, so the cart is unavailable.');
    }
    return userIdRef.current;
  };

  const addItem = useCallback(
    async (productId, quantity = 1) => {
      await addToCart(requireUserId(), productId, quantity);
      await refresh().catch(() => {});
    },
    [refresh],
  );

  // Sets an exact quantity (the backend validates it against stock).
  const setQuantity = useCallback(
    async (productId, quantity) => {
      await updateCartItem(requireUserId(), productId, quantity);
      await refresh().catch(() => {});
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (productId) => {
      await removeFromCart(requireUserId(), productId);
      await refresh().catch(() => {});
    },
    [refresh],
  );

  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = item.product;
        const available = Boolean(product);
        // Priced from the live catalogue so the cart always shows today's price.
        const unitPrice = available ? Number(product.price) || 0 : 0;
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product,
          available,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      }),
    [items],
  );

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, l) => sum + l.lineTotal, 0), [lines]);
  const hasUnavailable = lines.some((l) => !l.available);

  const value = useMemo(
    () => ({
      status: state.status,
      error: state.error,
      lines,
      count,
      total,
      hasUnavailable,
      refresh,
      addItem,
      setQuantity,
      removeItem,
    }),
    [state, lines, count, total, hasUnavailable, refresh, addItem, setQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
