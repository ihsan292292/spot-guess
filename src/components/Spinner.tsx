import React from 'react';
import './Spinner.css';

interface SpinnerProps {
    color?: string;
    size?: string;
    speed?: string; // Duration for one full rotation, e.g., '1s'
}

const Spinner: React.FC<SpinnerProps> = ({ color = '#3498db', size = '40px', speed = '0.8s' }) => {
    return (
        <div
            className="spinner"
            style={{
                borderColor: `${color} transparent transparent transparent`,
                width: size,
                height: size,
                animationDuration: speed,
            }}
        />
    );
};

export default Spinner;