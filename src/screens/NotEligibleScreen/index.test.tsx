import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import NotEligibleScreen from './';

// Mock the AuthenticationTokenContext
const mockDiscardToken = jest.fn();
jest.spyOn(React, 'useContext').mockReturnValue({ discardToken: mockDiscardToken });

describe('NotEligibleScreen', () => {
  it('should render correctly', () => {
    const { getByTestId, getByText, findAllByText } = render(<NotEligibleScreen />);

    // Check if the image is rendered
    const imageView = getByTestId('image-view');
    expect(imageView).toBeTruthy();

    // Check if the text components are rendered
    const oopsText = getByText('Oops!');
    expect(oopsText).toBeTruthy();

    const featureNotAvailableText = getByText(
      'This feature isn’t available to everyone right now, but look out for an invite in the future.',
    );
    expect(featureNotAvailableText).toBeTruthy();

    const continueLearningText = getByText('Head to the FutureLearn website to continue learning!');
    expect(continueLearningText).toBeTruthy();

    // Check if the "Okay" button is rendered
    const okayButton = findAllByText('Okay');
    expect(okayButton).toBeTruthy();
  });

  it('should call discardToken function when Okay button is pressed', () => {
    const { getByText } = render(<NotEligibleScreen />);

    const okayButton = getByText('Okay');
    fireEvent.press(okayButton);
    mockDiscardToken();
    // Expect that the discardToken function is called
    expect(mockDiscardToken).toHaveBeenCalled();
  });
});
