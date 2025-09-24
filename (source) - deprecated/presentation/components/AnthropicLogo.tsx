// src/components/AnthropicLogo.tsx
import { Image } from 'expo-image';
import React from 'react';

import { AnthropicLogoProps } from '../interfaces/components';

export const AnthropicLogo: React.FC<AnthropicLogoProps> = ({ size = 16 }) => {
  return (
    <Image
      source={require('../../../assets/Anthropic/images.png')}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
};
