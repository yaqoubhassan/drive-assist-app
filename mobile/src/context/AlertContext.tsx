import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
// Import directly to avoid circular dependency with AddressAutocomplete
import { SuccessModal } from '../components/common/SuccessModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

type AlertVariant = 'success' | 'info' | 'warning' | 'error';

interface AlertOptions {
  title: string;
  message?: string;
  variant?: AlertVariant;
  primaryButtonLabel?: string;
  onPrimaryPress?: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (title: string, message?: string, onClose?: () => void) => void;
  showError: (title: string, message?: string, onClose?: () => void) => void;
  showInfo: (title: string, message?: string, onClose?: () => void) => void;
  showWarning: (title: string, message?: string, onClose?: () => void) => void;
  showConfirm: (options: ConfirmOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertState extends AlertOptions {
  visible: boolean;
}

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
  loading: boolean;
}

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    variant: 'success',
  });

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    visible: false,
    loading: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      visible: true,
      ...options,
    });
  }, []);

  const showSuccess = useCallback((title: string, message?: string, onClose?: () => void) => {
    setAlertState({
      visible: true,
      title,
      message,
      variant: 'success',
      onPrimaryPress: onClose,
    });
  }, []);

  const showError = useCallback((title: string, message?: string, onClose?: () => void) => {
    setAlertState({
      visible: true,
      title,
      message,
      variant: 'error',
      primaryButtonLabel: 'OK',
      onPrimaryPress: onClose,
    });
  }, []);

  const showInfo = useCallback((title: string, message?: string, onClose?: () => void) => {
    setAlertState({
      visible: true,
      title,
      message,
      variant: 'info',
      onPrimaryPress: onClose,
    });
  }, []);

  const showWarning = useCallback((title: string, message?: string, onClose?: () => void) => {
    setAlertState({
      visible: true,
      title,
      message,
      variant: 'warning',
      onPrimaryPress: onClose,
    });
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmState({
      visible: true,
      loading: false,
      ...options,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, visible: false }));
  }, []);

  const hideConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, visible: false, loading: false }));
  }, []);

  const handleAlertClose = useCallback(() => {
    hideAlert();
  }, [hideAlert]);

  const handleConfirm = useCallback(async () => {
    setConfirmState(prev => ({ ...prev, loading: true }));
    try {
      await confirmState.onConfirm();
      hideConfirm();
    } catch (error) {
      setConfirmState(prev => ({ ...prev, loading: false }));
    }
  }, [confirmState.onConfirm, hideConfirm]);

  const handleConfirmCancel = useCallback(() => {
    if (confirmState.onCancel) {
      confirmState.onCancel();
    }
    hideConfirm();
  }, [confirmState.onCancel, hideConfirm]);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showConfirm,
        hideAlert,
      }}
    >
      {children}

      {/* Success/Info/Warning/Error Modal */}
      <SuccessModal
        visible={alertState.visible}
        onClose={handleAlertClose}
        title={alertState.title}
        message={alertState.message}
        variant={alertState.variant}
        primaryButtonLabel={alertState.primaryButtonLabel}
        onPrimaryPress={() => {
          if (alertState.onPrimaryPress) {
            alertState.onPrimaryPress();
          }
          hideAlert();
        }}
        secondaryButtonLabel={alertState.secondaryButtonLabel}
        onSecondaryPress={() => {
          if (alertState.onSecondaryPress) {
            alertState.onSecondaryPress();
          }
          hideAlert();
        }}
        autoClose={alertState.autoClose}
        autoCloseDelay={alertState.autoCloseDelay}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmState.visible}
        onClose={handleConfirmCancel}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        variant={confirmState.variant}
        confirmLabel={confirmState.confirmLabel}
        cancelLabel={confirmState.cancelLabel}
        loading={confirmState.loading}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;
