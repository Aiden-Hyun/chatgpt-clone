import React, { ReactNode } from 'react';
import { Pressable } from 'react-native';

interface HoverDetectorProps {  
  style?: any;
  children: ReactNode;
  onHoverChange?: (isHovered: boolean) => void;
}

const HoverDetector: React.FC<HoverDetectorProps> = ({ 
  children, 
  onHoverChange,
  style,
  ...props 
}) => {
  // In React Native Web, Pressable has hover state capabilities
  return (
    <Pressable 
      style={style}
      onHoverIn={() => onHoverChange?.(true)}
      onHoverOut={() => onHoverChange?.(false)}
      {...props}
    >
      {children}
    </Pressable>
  );
};

export default HoverDetector;
