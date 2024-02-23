import React, { useRef } from 'react';
import { Animated } from 'react-native';

export default function ({
  isVisible,
  duration = 200,
}: {
  isVisible?: boolean;
  duration?: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animate = () => {
      Animated.timing(fadeAnim, {
        useNativeDriver: true,
        toValue: isVisible ? 1 : 0,
        duration,
      }).start();
    };

    isVisible !== undefined && animate();
  }, [isVisible, fadeAnim, duration]);

  return { fadeAnim };
}
