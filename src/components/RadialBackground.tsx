import React from 'react';
import { cn } from '../lib/utils';

interface RadialBackgroundProps {
  className?: string;
}

export const RadialBackground: React.FC<RadialBackgroundProps> = ({ 
  className,
}) => {
  return (
    <div 
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none overflow-hidden bg-white select-none",
        className
      )}
      style={{ zIndex: 0 }}
    >
      {/* Soft Yellow Glow from User code */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #FFF991 0%, transparent 68%)',
          opacity: 0.5,
          mixBlendMode: 'multiply',
        }}
      />
      {/* Ambient pink/purple side spark for dynamic contrast */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full filter blur-[150px]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        }}
      />
      <div 
        className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full filter blur-[150px]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
        }}
      />
    </div>
  );
};
