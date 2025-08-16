import React from 'react';

import LogOutIcon from './icons/LogOutIcon';

const defaultStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '0.25em 1.75em 0.25em 1.25em',
    borderRadius: '4px',
    color: 'var(--text-color)',
    background: 'var(--primary-color)',
    // boxShadow: '8px 8px 15px #a3a3a3, -8px -8px 15px #ffffff',
    border: 'none',
    fontSize: '1em',
    // fontWeight: 'bold',
    // color: '#333',
    cursor: 'pointer',
    outline: 'none',
    transition: 'box-shadow 0.3s ease',
};

export interface LogoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    style?: React.CSSProperties;
    children: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ style, children, ...props }) => {
    return (
        <button
            style={{
                ...defaultStyles,
                ...style,
            }}
            {...props}
        >
            <LogOutIcon style={{marginRight: "0.75em"}}/>{children}
        </button>
    );
};

const activeStyles: React.CSSProperties = {
    // boxShadow: 'inset 8px 8px 15px #a3a3a3, inset -8px -8px 15px #ffffff',
};

export const LogoutButtonWithEffects: React.FC<LogoutButtonProps> = ({ style, children, ...props }) => {
    const [isPressed, setIsPressed] = React.useState(false);

    return (
        <LogoutButton
            style={{
                ...defaultStyles,
                ...(isPressed ? activeStyles : {}),
                ...style,
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            {...props}
        >
            {children}
        </LogoutButton>
    );
};
