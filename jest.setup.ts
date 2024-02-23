import '@testing-library/jest-native/extend-expect';
// require('react-native-reanimated/lib/reanimated2/jestUtils').setUpTests();
// jest.mock('react-native-reanimated', () => ({
//   useAnimatedStyle: jest.fn(),
//   useSharedValue: jest.fn(),
//   useAnimatedScrollHandler: jest.fn(),
// }));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
