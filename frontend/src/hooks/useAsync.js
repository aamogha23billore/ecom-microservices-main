import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `fn(signal)` on mount and whenever `deps` change; cancels stale calls.
 * Keeps the previous `data` while reloading so lists don't flash empty.
 */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setState((s) => ({ ...s, status: 'loading', error: null }));

    Promise.resolve()
      .then(() => fnRef.current(controller.signal))
      .then(
        (data) => {
          if (active) setState({ status: 'success', data, error: null });
        },
        (error) => {
          if (active && error?.name !== 'AbortError') {
            setState({ status: 'error', data: null, error });
          }
        },
      );

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
