import { DependencyList, useEffect, useState } from 'react';

export type AsyncFetchState<T> = {
  fetching: boolean;
  data?: T;
  error?: any;
};

export default function useAsyncFetch<T>(fetch: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<AsyncFetchState<T>>({ fetching: false });

  useEffect(() => {
    let canceled = false;

    setState(previousState => ({ ...previousState, fetching: true }));

    (async () => {
      try {
        const data = await fetch();
        !canceled && setState({ fetching: false, data });
      } catch (error) {
        console.warn('Asynchronous fetch raised error', { error });
        !canceled && setState(({ data }) => ({ fetching: false, data, error }));
      }
    })();

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
