import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface AccessibleImageProps {
  alt?: string;
  url: string;
  style: ImageStyle;
}
export default function ImageAltText({ alt, ...props }: AccessibleImageProps) {
  const accessibilityLabel = alt || undefined;
  return (
    <Image
      source={{ uri: props.url }}
      style={props.style}
      accessible={true}
      accessibilityRole="image"
      accessibilityHint={accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: props.url, min: 0, max: 100 }}
      accessibilityIgnoresInvertColors={false}
    />
  );
}
