import React, { ReactNode } from 'react';
import { Pressable, PressableProps } from 'react-native';

interface HoverDetectorProps extends PressableProps {
  children: ReactNode;
  onHoverChange?: (isHovered: boolean) => void;
}

// For native platforms, we simulate hover with press events
const HoverDetector: React.FC<HoverDetectorProps> = ({ 
  children, 
  onHoverChange,
  style,
  ...props 
}) => {
  return (
    <Pressable
      style={style}
      onPressIn={() => onHoverChange?.(true)}
      onPressOut={() => onHoverChange?.(false)}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default HoverDetector;
