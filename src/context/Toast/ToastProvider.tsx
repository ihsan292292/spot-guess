import React, { useState, ReactNode, useCallback, useRef } from 'react';

import Toast from '../../components/Toast';

import { ToastData, ToastContext } from './ToastContext';

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);
    const [nextId, setNextId] = useState(0);
    const shownToastIds = useRef(new Set<number>());

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info', timeout: number = 3000) => {
        const id = nextId;

        if (!shownToastIds.current.has(id)) {
            setToasts((prevToasts) => [...prevToasts, { id, message, type, timeout }]);
            shownToastIds.current.add(id);
            setNextId((prevId) => prevId + 1);

            setTimeout(() => {
                setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
                shownToastIds.current.delete(id);
            }, timeout);
        }
    }, [nextId]);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => {
                            setToasts((prevToasts) => prevToasts.filter((t) => t.id !== toast.id));
                            shownToastIds.current.delete(toast.id);
                        }}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
