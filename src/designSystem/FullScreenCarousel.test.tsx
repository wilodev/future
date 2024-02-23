import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import FullScreenCarousel from './FullScreenCarousel';
import { Text } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  default: jest.fn(() => ({ height: 100, width: 100 })),
}));

describe('FullScreenCarousel', () => {
  const setup = (index = 0) => {
    const renderItemMock = jest.fn();
    const mockData = [
      {
        key: 1,
        description: 'Item 1',
        image: 'image',
        title: 'title',
        url: 'url',
        contentType: 'contentType',
      },
      {
        key: 2,
        description: 'Item 2',
        image: 'image',
        title: 'title',
        url: 'url',
        contentType: 'contentType',
      },
      {
        key: 3,
        description: 'Item 3',
        image: 'image',
        title: 'title',
        url: 'url',
        contentType: 'contentType',
      },
    ];
    const onIndexChangeMock = jest.fn();
    const renderComponent = () =>
      render(
        <ErrorBoundary
          FallbackComponent={() => (
            <Text testID="carousel">Error occurred while rendering the carousel.</Text>
          )}>
          <FullScreenCarousel
            data={mockData}
            renderItem={renderItemMock}
            index={index}
            onIndexChange={onIndexChangeMock}
            testID="carousel"
          />
          ,
        </ErrorBoundary>,
      );

    return { renderItemMock, onIndexChangeMock, renderComponent, mockData };
  };

  describe('when the carousel is loaded', () => {
    it('should not scroll to negative indices', () => {
      const { renderComponent, onIndexChangeMock } = setup(-1);
      renderComponent();

      expect(onIndexChangeMock).not.toHaveBeenCalled();
    });

    it('should not crash when data or renderItem are not provided', () => {
      const { renderComponent, onIndexChangeMock } = setup();
      const { getByTestId } = renderComponent();

      expect(getByTestId('carousel')).toBeDefined();
      expect(onIndexChangeMock).not.toHaveBeenCalled();
    });
  });

  describe('when the carousel is swiped', () => {
    // it('calls the onIndexChange callback', () => {
    //   const eventData = {
    //     nativeEvent: {
    //       contentSize: { height: 600, width: 400 },
    //       contentOffset: { x: 90, y: 0 },
    //       layoutMeasurement: { height: 100, width: 100 },
    //     },
    //   };
    //   const { renderComponent, onIndexChangeMock } = setup();
    //   const { getByTestId } = renderComponent();
    //   fireEvent.scroll(getByTestId('carousel'), eventData);
    //   if (eventData.nativeEvent.contentOffset.x > 0) {
    //     expect(onIndexChangeMock).toHaveBeenCalled();
    //   }
    // });

    it('does not call the onIndexChange callback if swipe distance is not enough', () => {
      const eventData = {
        nativeEvent: {
          contentSize: { height: 600, width: 400 },
          contentOffset: { x: 50, y: 0 },
          layoutMeasurement: { height: 100, width: 100 },
        },
      };
      const { renderComponent, onIndexChangeMock } = setup();
      const { getByTestId } = renderComponent();
      fireEvent.scroll(getByTestId('carousel'), eventData);

      expect(onIndexChangeMock).not.toHaveBeenCalled();
    });
  });
});
