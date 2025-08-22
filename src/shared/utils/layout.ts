import { useAppTheme } from '../../features/theme/theme';

/**
 * Hook to get header height using theme context
 */
export const useHeaderHeight = (): number => {
  const theme = useAppTheme();
  return theme.layout.buttonSizes.header + 34; // header button size + status bar
};

/**
 * Hook to get screen padding using theme context
 */
export const useScreenPadding = () => {
  const theme = useAppTheme();
  return theme.layout.dimensions.chat.inputPadding;
};
