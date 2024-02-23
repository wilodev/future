import { useCallback, useEffect, useRef, useState } from 'react';

export default function useRefreshingState<T>(refetch: () => Promise<T> | void) {
  const unloadedRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    const refetchPromise = refetch();

    if (refetchPromise) {
      refetchPromise.finally(() => {
        if (!unloadedRef.current) {
          setRefreshing(false);
        }
      });
    } else {
      setRefreshing(false);
    }
  }, [refreshing, unloadedRef, refetch]);

  useEffect(
    () => () => {
      unloadedRef.current = true;
    },
    [],
  );

  return { refresh, refreshing };
}
