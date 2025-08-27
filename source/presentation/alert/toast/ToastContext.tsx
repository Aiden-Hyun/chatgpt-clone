import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { AlertType } from '../../../business/alert/constants/alertConstants';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

// Define the context type
interface ToastContextType {
  toast: {
    visible: boolean;
    message: string;
    type: AlertType;
    duration: number;
  };
  showToast: (message: string, type?: AlertType, duration?: number) => void;
  hideToast: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

// Create the context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider component
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const { toastService } = useBusinessContext();
  const [toastState, setToastState] = useState({
    visible: false,
    message: '',
    type: AlertType.INFO,
    duration: 3000,
  });
  
  // Update local state when toast service state changes
  useEffect(() => {
    const currentToast = toastService.getCurrentToast();
    const visible = toastService.isVisible();
    
    if (currentToast) {
      setToastState({
        visible,
        message: currentToast.getMessage(),
        type: currentToast.getType(),
        duration: currentToast.getDuration(),
      });
    } else {
      setToastState(prev => ({
        ...prev,
        visible,
      }));
    }
  }, [toastService]);
  
  // Delegate to the toast service
  const showToast = useCallback((message: string, type: AlertType = AlertType.INFO, duration?: number) => {
    toastService.showToast(message, type, duration);
  }, [toastService]);
  
  const hideToast = useCallback(() => {
    toastService.hideToast();
  }, [toastService]);
  
  const showSuccess = useCallback((message: string, duration?: number) => {
    toastService.showSuccess(message, duration);
  }, [toastService]);
  
  const showError = useCallback((message: string, duration?: number) => {
    toastService.showError(message, duration);
  }, [toastService]);
  
  const showWarning = useCallback((message: string, duration?: number) => {
    toastService.showWarning(message, duration);
  }, [toastService]);
  
  const showInfo = useCallback((message: string, duration?: number) => {
    toastService.showInfo(message, duration);
  }, [toastService]);
  
  // Create the context value
  const value = React.useMemo(() => ({
    toast: toastState,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }), [toastState, showToast, hideToast, showSuccess, showError, showWarning, showInfo]);
  
  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook to use the toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};