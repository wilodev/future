const Mixpanel = jest.fn();

Mixpanel.mockImplementation(() => ({
  identify: jest.fn(),
  init: jest.fn(() => Promise.resolve()),
  setServerURL: jest.fn(),
  track: jest.fn(() => Promise.resolve()),
}));

export { Mixpanel };
