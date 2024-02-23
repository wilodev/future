import { renderHook } from '@testing-library/react-hooks';

import { waitForPromises } from './TestUtils';
import useAsyncFetch from './useAsyncFetch';

describe('useAsyncFetch', () => {
  afterEach(() => jest.useRealTimers());

  it('returns the correct state during the initial fetch', () => {
    const { result } = renderHook(() => useAsyncFetch(() => new Promise(() => {})));

    expect(result.current).toEqual({ fetching: true });
  });

  describe('when the fetch has been completed successfully', () => {
    it('updates the state with the data', async () => {
      const { result } = renderHook(() => useAsyncFetch(() => Promise.resolve('some-data')));

      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'some-data' });
    });

    describe('when the component has already been unmounted', () => {
      it('does not attempt to update state', async () => {
        jest.spyOn(console, 'error');

        const { unmount } = renderHook(() => useAsyncFetch(() => Promise.resolve('some-data')));

        unmount();

        await waitForPromises();

        expect(console.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the fetch has been completed with an error', () => {
    beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());

    it('logs the error as a warning', async () => {
      renderHook(() => useAsyncFetch(() => Promise.reject('some-error')));

      await waitForPromises();

      expect(console.warn).toHaveBeenCalledWith('Asynchronous fetch raised error', {
        error: 'some-error',
      });
    });

    it('updates the state with the error', async () => {
      const { result } = renderHook(() => useAsyncFetch(() => Promise.reject('some-error')));

      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, error: 'some-error' });
    });

    describe('when the component has already been unmounted', () => {
      it('does not attempt to update state', async () => {
        jest.spyOn(console, 'error');

        const { unmount } = renderHook(() => useAsyncFetch(() => Promise.reject('some-error')));

        unmount();

        await waitForPromises();

        expect(console.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('when no deps are specified', () => {
    it('fetches the data only once', () => {
      const fetch = jest.fn(() => Promise.resolve('some-data'));

      const { rerender } = renderHook(() => useAsyncFetch(fetch));

      rerender();

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('when deps are specified', () => {
    it('re-fetches the data when the deps changed', async () => {
      const fetch = jest.fn().mockResolvedValueOnce('data-one').mockResolvedValueOnce('data-two');

      const { result, rerender } = renderHook(({ color }) => useAsyncFetch(fetch, [color]), {
        initialProps: { color: 'pink' },
      });

      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'data-one' });

      rerender({ color: 'blue' });

      expect(result.current).toEqual({ fetching: true, data: 'data-one' });

      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'data-two' });
    });

    it('preserves the previous data if the refetch fails', async () => {
      const fetch = jest.fn().mockResolvedValueOnce('data-one').mockRejectedValueOnce('error-two');

      const { result, rerender } = renderHook(({ color }) => useAsyncFetch(fetch, [color]), {
        initialProps: { color: 'pink' },
      });

      await waitForPromises();

      rerender({ color: 'blue' });

      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'data-one', error: 'error-two' });
    });

    it('does not re-fetch the data when the deps have not changed', () => {
      const fetch = jest.fn(() => Promise.resolve('some-data'));

      const { rerender } = renderHook(({ color }) => useAsyncFetch(fetch, [color]), {
        initialProps: { color: 'pink', shape: 'square' },
      });

      rerender({ color: 'pink', shape: 'circle' });

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('does not attempt to update state if the data is ready after a new fetch has started', async () => {
      jest.useFakeTimers({ advanceTimers: true });

      const fetch = jest
        .fn()
        .mockImplementationOnce(
          () => new Promise<string>(resolve => setTimeout(() => resolve('data-1'), 100)),
        )
        .mockImplementationOnce(
          () => new Promise<string>(resolve => setTimeout(() => resolve('data-2'), 10)),
        );

      const { result, rerender } = renderHook(({ color }) => useAsyncFetch(fetch, [color]), {
        initialProps: { color: 'pink' },
      });

      rerender({ color: 'blue' });

      await waitForPromises();

      jest.advanceTimersByTime(20);
      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'data-2' });

      jest.runAllTimers();
      await waitForPromises();

      expect(result.current).toEqual({ fetching: false, data: 'data-2' });
    });
  });
});
