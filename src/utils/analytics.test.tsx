import React, { ReactNode } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { Mixpanel } from 'mixpanel-react-native';

import { createStandaloneTrackFunction, useAnalytics } from './analytics';
import { initializeMixpanel, MixpanelContext } from './mixpanel';
import { waitForPromises } from './TestUtils';

const mockMixpanel = new Mixpanel('token', true);

jest.mock('./mixpanel', () => ({
  ...jest.requireActual('./mixpanel'),
  initializeMixpanel: jest.fn(async () => mockMixpanel),
}));

describe('useAnalytics', () => {
  const render = () =>
    renderHook(useAnalytics, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MixpanelContext.Provider value={Promise.resolve(mockMixpanel)}>
          {children}
        </MixpanelContext.Provider>
      ),
    }).result.current;

  describe('track', () => {
    it('tracks the event using Mixpanel', async () => {
      const { track } = render();

      track('Make tea', 'Course', { sugar: 2, milk: false });

      await waitForPromises();

      expect(mockMixpanel.track).toHaveBeenCalledWith('Make tea', {
        area: 'Course',
        sugar: 2,
        milk: false,
      });
    });
  });
});

describe('createStandaloneTrackFunction', () => {
  it('initializes a single Mixpanel instance', async () => {
    const track = createStandaloneTrackFunction();

    await track('Make tea', 'Account');
    await track('Make coffee', 'Course');

    expect(initializeMixpanel).toHaveBeenCalledTimes(1);
  });

  it('tracks the event using Mixpanel', async () => {
    await createStandaloneTrackFunction()('Make tea', 'Course', { sugar: 2, milk: false });

    expect(mockMixpanel.track).toHaveBeenCalledWith('Make tea', {
      area: 'Course',
      sugar: 2,
      milk: false,
    });
  });
});
