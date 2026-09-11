import { useCallback, useEffect, useRef, useState } from 'react';

// Generic data-fetching hook: wraps a service call and exposes loading/error
// state plus a manual refetch. Keeps UI code free of repetitive fetch logic.
export function useFetch(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Re-run whenever any of the dependency values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, error, loading, refetch: load };
}