import React from 'react';

import './LoadingOverlayView.css';

interface LoadingOverlayProps {
    progress: number;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, header, footer }) => {
    return (
        <div className="loading-overlay">
            <div className="loading-container">
                {header && <div className="loading-header">{header}</div>}
                <div className="progress-bar">
                    <div className="progress" style={{ width: `${progress}%` }} />
                </div>
                {footer && <div className="loading-footer">{footer}</div>}
            </div>
        </div>
    );
};

export default LoadingOverlay;
