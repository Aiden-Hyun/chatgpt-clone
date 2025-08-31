import { Image } from 'expo-image';
import React from 'react';

import { OpenAILogoProps } from '../interfaces/components';
import { useThemeContext } from '../theme/context/ThemeContext';

export const OpenAILogo: React.FC<OpenAILogoProps> = ({ size = 16, variant }) => {
  const { themeMode, currentTheme } = useThemeContext();
  const isDarkTheme = variant ? variant === 'white' : 
    (themeMode === 'system' ? currentTheme.colors.background.primary === '#1A202C' : themeMode === 'dark');

  const source = isDarkTheme
    ? require('../../../assets/OpenAI/PNGs/OpenAI-white-monoblossom.png')
    : require('../../../assets/OpenAI/PNGs/OpenAI-black-monoblossom.png');

  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
};
