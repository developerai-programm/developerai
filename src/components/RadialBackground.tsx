import React from 'react';
import { cn } from '../lib/utils';

interface RadialBackgroundProps {
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientSize?: string;
  gradientPosition?: string;
  gradientStop?: string;
}

export const RadialBackground: React.FC<RadialBackgroundProps> = ({ 
  className,
  gradientFrom = "#ffffff",
  gradientTo = "#6366f1", // Vibrant indigo
  gradientSize = "100% 100%",
  gradientPosition = "50% 0%", // Glow from the top
  gradientStop = "0%"
}) => {
  return (
    <div 
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none",
        className
      )}
      style={{
        zIndex: 0,
        background: `radial-gradient(${gradientSize} at ${gradientPosition}, ${gradientFrom} ${gradientStop}, ${gradientTo} 100%)`
      }}
    />
  );
};
