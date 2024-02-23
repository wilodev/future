import { ImageSourcePropType, ImageProps, Image } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useTheme } from '~/designSystem/themes';

type ImageWithCacheProps = {
  placeholderSource?: ImageSourcePropType;
  source: ImageSourcePropType;
  accessibilityText: string;
  onImageLoad?: () => void;
} & ImageProps;
export const ImageWithCache: React.FC<ImageWithCacheProps> = ({
  placeholderSource,
  source,
  accessibilityText,
  onImageLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const { dark } = useTheme();
  const defaultPlaceholder = dark
    ? require('~/assets/image-placeholder-dark.png')
    : require('~/assets/image-placeholder.png');

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onImageLoad) {
      onImageLoad();
    }
  }, [onImageLoad]);
  return (
    <Image
      {...props}
      source={isLoaded ? source : placeholderSource || defaultPlaceholder}
      onLoad={handleLoad}
      accessible={true}
      accessibilityRole="image"
      accessibilityHint={accessibilityText}
      accessibilityLabel={accessibilityText}
      accessibilityValue={{
        text: isLoaded ? source : placeholderSource || defaultPlaceholder,
        min: 0,
        max: 100,
      }}
      accessibilityIgnoresInvertColors={false}
    />
  );
};
