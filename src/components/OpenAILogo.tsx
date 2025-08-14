import { useThemeContext } from '@/features/theme/ThemeContext';
import React from 'react';
import BlackLogo from '../../assets/OpenAI/SVGs/OpenAI-black-monoblossom.svg';
import WhiteLogo from '../../assets/OpenAI/SVGs/OpenAI-white-monoblossom.svg';

interface OpenAILogoProps {
  size?: number;
  variant?: 'white' | 'black';
}

export const OpenAILogo: React.FC<OpenAILogoProps> = ({ size = 16, variant }) => {
  const { currentTheme } = useThemeContext();
  const effectiveTheme = variant
    ? (variant === 'white' ? 'dark' : 'light')
    : currentTheme;

  const Logo = effectiveTheme === 'dark' ? WhiteLogo : BlackLogo;
  return <Logo width={size} height={size} />;
};
