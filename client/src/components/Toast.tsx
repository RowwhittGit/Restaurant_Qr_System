import React from 'react';
import { ToastContainer, toast, type ToastOptions, type TypeOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle, FiBell } from 'react-icons/fi';

// Define props interface for ToastMessage component
interface ToastMessageProps {
  type?: TypeOptions;
  message: string;
}

// Toast message component with icon
const ToastMessage: React.FC<ToastMessageProps> = ({ type, message }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {type === 'success' && <FiCheckCircle style={{ color: '#10B981', fontSize: '24px', marginRight: '12px' }} />}
    {type === 'error' && <FiXCircle style={{ color: '#EF4444', fontSize: '24px', marginRight: '12px' }} />}
    {type === 'warning' && <FiAlertCircle style={{ color: '#F59E0B', fontSize: '24px', marginRight: '12px' }} />}
    {type === 'info' && <FiInfo style={{ color: '#3B82F6', fontSize: '24px', marginRight: '12px' }} />}
    {(!type || type === 'default') && <FiBell style={{ color: '#8B5CF6', fontSize: '24px', marginRight: '12px' }} />}
    <span style={{ flex: 1 }}>{message}</span>
  </div>
);

// Define options interface for showToast function
interface ShowToastOptions {
  type?: TypeOptions;
  toastOptions?: ToastOptions;
}

// Custom hook for toast notifications
export const useToast = () => {
  const showToast = (message: string, options?: ShowToastOptions) => {
    const { type = 'default', toastOptions } = options || {};
    const toastContent = <ToastMessage type={type} message={message} />;
    
    switch(type) {
      case 'success':
        return toast.success(toastContent, toastOptions);
      case 'error':
        return toast.error(toastContent, toastOptions);
      case 'warning':
        return toast.warning(toastContent, toastOptions);
      case 'info':
        return toast.info(toastContent, toastOptions);
      default:
        return toast(toastContent, toastOptions);
    }
  };

  return { showToast };
};

// Toast container component
const Toast: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{ width: "400px" }}
      toastStyle={{
        borderRadius: '8px',
        padding: '16px',
        fontSize: '16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
    />
  );
};

export default Toast;