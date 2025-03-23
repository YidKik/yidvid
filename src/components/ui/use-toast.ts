
// Custom hook to completely disable toast notifications
export const useToast = () => {
  return {
    toasts: [],
    toast: () => {},
    dismiss: () => {},
    addToast: () => {},
    removeToast: () => {},
  };
};

// Noop toast functions that do nothing
export const toast = {
  success: () => {},
  error: () => {},
  warning: () => {},
  info: () => {},
  loading: () => {},
  dismiss: () => {},
  custom: () => {},
};
