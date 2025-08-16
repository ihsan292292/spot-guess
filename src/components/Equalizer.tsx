import React, { useState, useEffect, useRef } from "react";
import "./Equalizer.css"; 

interface EqualizerProps {
  state: "playing" | "paused";
  amountOfBars?: number;
  desiredFps?: number;
}

const Equalizer: React.FC<EqualizerProps> = ({ state, amountOfBars = 10, desiredFps = 20, }) => {
  const [bars, setBars] = useState<number[]>(new Array(amountOfBars).fill(0));

  const animationRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);

  const generateNextHeights = (prevHeights: number[]): number[] => {
    const decay = 0.95;
    const peakChance = 0.1;
    const maxVariance = 0.2;
  
    return prevHeights.map((height) => {
      const isPeak = Math.random() < peakChance;
      const newHeight = isPeak
        ? Math.random()
        : height * decay + (Math.random() * maxVariance - maxVariance / 2);
      return Math.max(0, Math.min(1, newHeight));
    });
  };

  const animate = (timestamp: number) => {
    const frameInterval = 1000 / desiredFps;
    const elapsedTime = timestamp - lastTimestampRef.current;

    if (elapsedTime >= frameInterval) {
      setBars(prev => generateNextHeights(prev));
      lastTimestampRef.current = timestamp;
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (state === "playing") {
      lastTimestampRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setBars(prev => new Array(prev.length).fill(0));
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state]);

  return (
    <div className="equalizer-container">
      <div className="equalizer-bars bars-top">
        {bars.map((height, index) => (
          <div 
            key={index} 
            className={`equalizer-bar top ${state}`} 
            style={{ transform: `scaleY(${height})` }} 
          />
        ))}
      </div>

      <div className="equalizer-bars bars-bottom">
        {bars.map((height, index) => (
          <div
            key={index}
            className={`equalizer-bar reflection ${state}`}
            style={{ transform: `scaleY(${height})`  }}
          />
        ))}
      </div>
    </div>
  );
};

export default Equalizer;
