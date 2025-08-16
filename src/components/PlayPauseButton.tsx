import React from 'react';
import CirclePauseIcon from './icons/CirclePauseIcon'
import CirclePlayIcon from './icons/CirclePlayIcon'

interface PlayPauseButtonProps {
    color?: string;
    wrapperStyle?:  React.CSSProperties;
    style?: React.CSSProperties;
    className?: string;
    isPaused: boolean;
    onClick: () => void;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ isPaused, onClick, color = 'currentColor', wrapperStyle, style, className }) => {
    return (
        <div style={{display: "flex", ...wrapperStyle}} onClick={onClick}>{
            isPaused
                ? <CirclePlayIcon color={color} style={style} className={className}  />
                : <CirclePauseIcon color={color} style={style} className={className} />
        }
        </div>
    )
};

export default PlayPauseButton;