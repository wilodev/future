import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import CloseButton from '.';

// Mocking the navigation prop
const mockNavigation: any = {
  goBack: jest.fn(),
};

describe('Close Button', () => {
  // Tests that CloseButton component renders without crashing
  it('test_renders_without_crashing', () => {
    const tree = render(<CloseButton navigation={mockNavigation} />).toJSON();
    expect(tree).toMatchSnapshot(`--updateSnapshot`);
  });
  // Tests that CloseButton component calls navigation.goBack() when pressed
  it('test_press_close_button', () => {
    const { getByTestId } = render(<CloseButton navigation={mockNavigation} />);
    // Find the pressable component by testID
    const pressable = getByTestId('close-button');
    // Simulate a press event on the pressable component
    fireEvent.press(pressable);
    // Check if navigation.goBack() has been called
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
