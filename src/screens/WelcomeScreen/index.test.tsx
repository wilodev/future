import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage'; // Mock this if needed
import WelcomeScreen from './';
import { AppProvider } from '~/hooks/AppProvider';

// Mock AsyncStorage functions
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
}));

describe('WelcomeScreen', () => {
  it('renders the component with initial state', () => {
    const { getByTestId, getByText } = render(
      <AppProvider>
        <WelcomeScreen />
      </AppProvider>,
    );

    expect(getByText('Welcome to FutureLearn')).toBeTruthy();
    expect(
      getByText(
        'You’ve unlocked your learning App! Here you can view your courses and learn on the go',
      ),
    ).toBeTruthy();
    expect(getByTestId('Next-Welcome')).toBeTruthy();
  });

  it('renders the component with updated state and button', () => {
    const { getByTestId, getByText } = render(
      <AppProvider>
        <WelcomeScreen />
      </AppProvider>,
    );
    const nextButton = getByTestId('Next-Welcome');

    fireEvent.press(nextButton);

    expect(getByText('Track your progress')).toBeTruthy();
    expect(
      getByText('Track your learning progress, and set personal learning reminders'),
    ).toBeTruthy();
    expect(getByTestId('Startlearning')).toBeTruthy();
  });

  it('handles the "Next" button press', () => {
    const { getByTestId } = render(
      <AppProvider>
        <WelcomeScreen />
      </AppProvider>,
    );
    const nextButton = getByTestId('Next-Welcome');

    fireEvent.press(nextButton);

    expect(getByTestId('Startlearning')).toBeTruthy();
    const startLearningButton = getByTestId('Startlearning');
    expect(startLearningButton).toBeDefined();
  });

  // it('handles the "Start learning" button press', async () => {
  //   const replaceMock = jest.fn();
  //   const navigation = { replace: replaceMock };
  //   const { getByTestId } = render(<WelcomeScreen navigation={navigation} />);
  //   const startLearningButton = getByTestId('Startlearning'); // Use the correct test ID here

  //   fireEvent.press(startLearningButton);

  //   expect(replaceMock).toHaveBeenCalledWith('Main');
  //   expect(AsyncStorage.setItem).toHaveBeenCalledWith('welcome', 'enter');
  // });
});
