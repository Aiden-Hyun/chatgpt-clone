import React from "react";

import { Toast } from "./Toast";
import { useToast } from "./ToastContext";

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
