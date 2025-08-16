import React from 'react';

interface AbsoluteCenterWrapperProps {
    style?: React.CSSProperties;
    className?: string;
    children: React.ReactNode;
}

const AbsoluteCenterWrapper: React.FC<AbsoluteCenterWrapperProps> = ({ style, className, children }) => {
    return (
        <div style={
                {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    margin: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...style
                }
            } 
            className={className}>
                {children}
        </div>
    )
};

export default AbsoluteCenterWrapper;