import { Platform } from 'react-native';
import { layout } from '../../features/theme/themes/tokens';

/**
 * Get consistent header height for any screen
 * Returns header height (56px) + platform-specific status bar height
 */
export const getHeaderHeight = (): number => {
  const statusBar = Platform.OS === 'ios' ? layout.statusBarHeight.ios : layout.statusBarHeight.android;
  return layout.headerHeight + statusBar;
};

/**
 * Get consistent button size for different use cases
 * @param type - The type of button: 'header', 'action', or 'icon'
 */
export const getButtonSize = (type: 'header' | 'action' | 'icon'): number => {
  return layout.buttonSizes[type];
};

/**
 * Get consistent screen padding
 * Returns an object with horizontal and vertical padding values
 */
export const getScreenPadding = () => layout.screenPadding;
