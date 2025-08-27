import { useCallback, useEffect, useState } from 'react';
import { AlertType } from '../../../business/alert/constants/alertConstants';
import { AlertOptions } from '../../../business/alert/entities/AlertDialog';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText: string;
  cancelText: string;
  type: AlertType;
}

export const useCustomAlert = () => {
  const { alertService } = useBusinessContext();
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel',
    type: AlertType.INFO,
  });
  
  // Update local state when alert service state changes
  useEffect(() => {
    const currentAlert = alertService.getCurrentAlert();
    const visible = alertService.isVisible();
    
    if (currentAlert) {
      setAlertState({
        visible,
        title: currentAlert.getTitle(),
        message: currentAlert.getMessage(),
        onConfirm: currentAlert.getOnConfirm(),
        onCancel: currentAlert.getOnCancel(),
        confirmText: currentAlert.getConfirmText(),
        cancelText: currentAlert.getCancelText(),
        type: currentAlert.getType(),
      });
    } else {
      setAlertState(prev => ({
        ...prev,
        visible,
      }));
    }
  }, [alertService]);
  
  // Delegate to the alert service
  const showAlert = useCallback((
    title: string,
    message: string,
    options?: AlertOptions & { type?: AlertType }
  ) => {
    const type = options?.type || AlertType.INFO;
    alertService.showAlert(title, message, type, options);
  }, [alertService]);
  
  const hideAlert = useCallback(() => {
    alertService.hideAlert();
  }, [alertService]);
  
  const showSuccessAlert = useCallback((
    title: string,
    message: string,
    options?: AlertOptions
  ) => {
    alertService.showSuccessAlert(title, message, options);
  }, [alertService]);
  
  const showErrorAlert = useCallback((
    title: string,
    message: string,
    options?: AlertOptions
  ) => {
    alertService.showErrorAlert(title, message, options);
  }, [alertService]);
  
  const showWarningAlert = useCallback((
    title: string,
    message: string,
    options?: AlertOptions
  ) => {
    alertService.showWarningAlert(title, message, options);
  }, [alertService]);
  
  const showInfoAlert = useCallback((
    title: string,
    message: string,
    options?: AlertOptions
  ) => {
    alertService.showInfoAlert(title, message, options);
  }, [alertService]);
  
  return {
    alert: alertState,
    showAlert,
    hideAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
  };
};