import { useCallback, useState } from 'react';

import { AlertState } from '../../interfaces/alert';

export const useCustomAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    type: 'info',
  });

  const showAlert = useCallback((
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
      type?: 'success' | 'error' | 'warning' | 'info';
    }
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      onConfirm: options?.onConfirm,
      onCancel: options?.onCancel,
      confirmText: options?.confirmText || 'OK',
      cancelText: options?.cancelText || 'Cancel',
      type: options?.type || 'info',
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const showSuccessAlert = useCallback((
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showAlert(title, message, { ...options, type: 'success' });
  }, [showAlert]);

  const showErrorAlert = useCallback((
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showAlert(title, message, { ...options, type: 'error' });
  }, [showAlert]);

  const showWarningAlert = useCallback((
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showAlert(title, message, { ...options, type: 'warning' });
  }, [showAlert]);

  const showInfoAlert = useCallback((
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      onCancel?: () => void;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showAlert(title, message, { ...options, type: 'info' });
  }, [showAlert]);

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
  };
}; 