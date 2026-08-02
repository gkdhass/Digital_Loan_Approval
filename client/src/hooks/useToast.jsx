import { useContext, createContext } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = (message, type = 'success') => {
    // Create a custom event to trigger toast
    const event = new CustomEvent('showToast', { detail: { message, type } });
    window.dispatchEvent(event);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
