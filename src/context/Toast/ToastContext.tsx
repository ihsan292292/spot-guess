import { createContext } from 'react';

export interface ToastData {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
    timeout: number;
}

export interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'info', timeout?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);