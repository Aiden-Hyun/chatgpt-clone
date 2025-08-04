import React from 'react';
import { Toast, useToast } from './index';

export const ToastContainer: React.FC = () => {
  const { toast, hideToast } = useToast();

  return (
    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onHide={hideToast}
    />
  );
}; 