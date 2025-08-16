import React from 'react';

type LockIconProps = {
    color?: string;
    size?: string;
}
/* 
*   Font Awesome Free 6.6.0 by @fontawesome https://fontawesome.com 
*   License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--> 
*/  
const LockIcon: React.FC<LockIconProps> = ({ color = 'currentColor', size = '24px' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={color}
    >
        <path d="M12 1C10.34 1 9 2.34 9 4V8H6C4.34 8 3 9.34 3 11V21C3 22.66 4.34 24 6 24H18C19.66 24 21 22.66 21 21V11C21 9.34 19.66 8 18 8H15V4C15 2.34 13.66 1 12 1ZM10 4C10 3.45 10.45 3 11 3C11.55 3 12 3.45 12 4V8H10V4ZM6 10H18C18.55 10 19 10.45 19 11V21C19 21.55 18.55 22 18 22H6C5.45 22 5 21.55 5 21V11C5 10.45 5.45 10 6 10ZM11 12H13V20H11V12Z" />
    </svg>
);

export default LockIcon;
