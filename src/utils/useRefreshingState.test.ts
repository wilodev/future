import { act, renderHook } from '@testing-library/react-hooks';
import useRefreshingState from './useRefreshingState';

describe('useRefreshingState', () => {
  const setup = (refetchPromise = Promise.resolve()) => {
    const refetchFn = jest.fn(() => refetchPromise);

    const renderer = renderHook(() => useRefreshingState(refetchFn));

    return { refetchFn, ...renderer };
  };

  it('initially sets refreshing to `false`', () => {
    const { result } = setup();

    expect(result.current.refreshing).toBe(false);
  });

  describe('refresh', () => {
    it('immediately sets refreshing to true', () => {
      const { result } = setup();

      act(() => result.current.refresh());

      expect(result.current.refreshing).toBe(true);
    });

    it('triggers a refetch', () => {
      const { result, refetchFn } = setup();

      act(() => result.current.refresh());

      expect(refetchFn).toHaveBeenCalled();
    });

    it('does not trigger another refetch if one is already in progress', () => {
      const { result, refetchFn } = setup();

      act(() => result.current.refresh());
      act(() => result.current.refresh());

      expect(refetchFn).toHaveBeenCalledTimes(1);
    });

    it('sets refresh back to false if the refetch function does not return a value', () => {
      const { result } = renderHook(() => useRefreshingState(() => {}));

      act(() => result.current.refresh());

      expect(result.current.refreshing).toBe(false);
    });

    it('sets refreshing back to false when the refetch completes successfully', async () => {
      const { result } = setup(Promise.resolve());

      await act(async () => result.current.refresh());

      expect(result.current.refreshing).toBe(false);
    });

    it('does not attempt to update state if the fetch operation completes after the component has been unloaded', async () => {
      let resolveFetch: () => void;

      const { result, unmount } = setup(new Promise(resolve => (resolveFetch = () => resolve())));

      act(() => result.current.refresh());

      unmount();

      await act(async () => resolveFetch());

      expect(result.current.refreshing).toBe(true);
    });
  });
});
