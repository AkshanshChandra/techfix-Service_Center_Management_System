import { useCallback, useEffect, useState } from 'react';

/**
 * Runs `fetcher` whenever `deps` change and tracks loading/error state.
 * `reload` re-runs it after a mutation; `setData` applies an optimistic update.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fetcher, deps);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    run()
      .then((result) => { if (!cancelled) { setData(result); setError(null); } })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [run]);

  useEffect(load, [load]);

  return { data, loading, error, reload: load, setData };
}
