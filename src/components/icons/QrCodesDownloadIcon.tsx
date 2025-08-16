import React from 'react';

import './QrCodesDownloadIcon.css';

interface QrCodePdfIconProps {
    onClick: React.MouseEventHandler<HTMLDivElement>;
    className?: string;
    text?: string;
    //TODO disabled
}

const QrCodePdfIcon: React.FC<QrCodePdfIconProps> = ({ onClick, className, text }) => {
    return (
        <div onClick={onClick} className={`button-wrapper ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                id="Qr-Code--Streamline-Sharp"
                height="24"
                width="24"
            >
                <g id="qr-code--codes-tags-code-qr">
                    <path id="Vector 2518" stroke="#000000" d="m10 10 -4 0 0 -4 4 0 0 4Z" strokeWidth="1.5"></path>
                    <path id="Vector 2537" stroke="#000000" d="m18 10 -4 0 0 -4 4 0 0 4Z" strokeWidth="1.5"></path>
                    <path id="Vector 2538" stroke="#000000" d="m10 18 -4 0 0 -4 4 0 0 4Z" strokeWidth="1.5"></path>
                    <path id="Vector 2532" stroke="#000000" d="M2 9V2h7" strokeWidth="1.5"></path>
                    <path id="Vector 2534" stroke="#000000" d="M2 15v7h7" strokeWidth="1.5"></path>
                    <path id="Vector 2533" stroke="#000000" d="m15 2 7 0 0 7" strokeWidth="1.5"></path>
                    <path id="Vector 2535" stroke="#000000" d="m15 22 7 0 0 -7" strokeWidth="1.5"></path>
                    <path id="Vector 2545" stroke="#000000" d="M19.25 18H14v-5" strokeWidth="1.5"></path>
                    <path
                        id="Vector 2507"
                        stroke="#000000"
                        d="M17.9956 14.2542V13.75h0.5042v0.5042h-0.5042Z"
                        strokeWidth="1.5"
                    ></path>
                </g>
            </svg>
            <div className="button-text">{text}</div>
        </div>
    );
};

export default QrCodePdfIcon;
