import { act, renderHook } from '@testing-library/react-hooks';
import { OnProgressData } from 'react-native-video';
import useVideoTracking from './useVideoTracking';

const mockTrackEvent = jest.fn();

jest.mock('~/utils/analytics', () => ({
  useAnalytics: () => ({ track: mockTrackEvent }),
}));

const mockStepId = '123';
const mockRunId = '345';

describe('useVideoTracking', () => {
  const setup = () => {
    return renderHook(() => useVideoTracking({ runId: mockRunId, stepId: mockStepId }));
  };

  it('call track from analytics hook when trackVideoStart is called', () => {
    const { result } = setup();
    act(() => result.current.trackVideoStart());
    expect(mockTrackEvent).toHaveBeenCalledWith('Started video', 'Video', {
      step_id: '123',
      run_id: '345',
    });
  });

  it('call track from analytics hook when trackVideoPercentagePlayed is called', () => {
    const { result } = setup();
    const data: OnProgressData = { currentTime: 8, seekableDuration: 10, playableDuration: 10 };
    act(() => result.current.trackVideoPercentagePlayed(data));
    expect(mockTrackEvent).toHaveBeenCalledWith('Video percentage played', 'Video', {
      step_id: '123',
      run_id: '345',
      percentage: 75,
      step_type: 'Video',
    });
  });
});
