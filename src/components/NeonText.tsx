import React from 'react';
import neonTextStyles from './NeonText.css?raw';

interface NeonTitleProps {
    style?: React.CSSProperties;
    text: string;
}
const NeonTitle: React.FC<NeonTitleProps> = (props) => {
    return (
        <>
            <style>{neonTextStyles}</style>
            <div className={"neon-container"} style={props.style}>
                <h1 className={"neon-text"}>{props.text}</h1>
            </div>
        </>
    );
};

export default NeonTitle;
