import React from 'react';


interface MainContentWrapperProps {
    style?: React.CSSProperties; 
    children: React.ReactNode;
}

export const MainContentWrapper: React.FC<MainContentWrapperProps> = ({children, style}) => {
    return (
        <div
            style={{
                padding: '20px',
                maxWidth: '600px',
                margin: '0 auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                ...style, 
            }}
        >
            {children}
        </div>
    );
};
