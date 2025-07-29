import React from 'react';
import { Platform } from 'react-native';

interface FormWrapperProps {
  children: React.ReactNode;
  onSubmit?: (e: any) => void;
  style?: any;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({ 
  children, 
  onSubmit, 
  style 
}) => {
  // Only use HTML form on web platform
  if (Platform.OS === 'web') {
    return (
      <form 
        onSubmit={(e) => { 
          e.preventDefault(); 
          onSubmit?.(e); 
        }} 
        style={style}
      >
        {children}
      </form>
    );
  }

  // On mobile platforms, just return children without form wrapper
  return <>{children}</>;
}; 