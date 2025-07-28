import React from 'react';
import { LoadingScreen } from './LoadingScreen';

interface LoadingWrapperProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loading,
  children,
  message,
  size = 'large',
  fullScreen = true,
}) => {
  if (loading) {
    return (
      <LoadingScreen 
        message={message} 
        size={size} 
        fullScreen={fullScreen}
      />
    );
  }

  return <>{children}</>;
}; 