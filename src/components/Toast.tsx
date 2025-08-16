import React from 'react';
import './Toast.css'; // Add styles for different toast types here

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    return (
        <div className={`toast toast-${type}`} onClick={onClose}>
            {message}
        </div>
    );
};

export default Toast;