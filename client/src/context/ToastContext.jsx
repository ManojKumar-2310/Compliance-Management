import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        // Fallback if used outside provider
        return {
            success: (message) => toast.success(message),
            error: (message) => toast.error(message),
            info: (message) => toast(message),
            warning: (message) => toast(message, { icon: '⚠️' }),
            loading: (message) => toast.loading(message),
            promise: toast.promise,
        };
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const showToast = {
        success: (message) => toast.success(message, {
            style: {
                background: '#10b981',
                color: 'white',
                fontWeight: '500',
            },
            duration: 3000,
        }),
        error: (message) => toast.error(message, {
            style: {
                background: '#ef4444',
                color: 'white',
                fontWeight: '500',
            },
            duration: 4000,
        }),
        info: (message) => toast(message, {
            style: {
                background: '#3b82f6',
                color: 'white',
                fontWeight: '500',
            },
            duration: 3000,
            icon: 'ℹ️',
        }),
        warning: (message) => toast(message, {
            style: {
                background: '#f59e0b',
                color: 'white',
                fontWeight: '500',
            },
            duration: 3500,
            icon: '⚠️',
        }),
        loading: (message) => toast.loading(message),
        promise: toast.promise,
    };

    return (
        <ToastContext.Provider value={showToast}>
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'glass-ultra',
                    style: {
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    },
                }}
            />
            {children}
        </ToastContext.Provider>
    );
};
