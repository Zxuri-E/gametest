import React from 'react';
import { cn } from '../../utils/cn';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

export const Slider: React.FC<SliderProps> = ({
  className,
  label,
  valueDisplay,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  ...props
}) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        {label && <span className="text-slate-300">{label}</span>}
        {valueDisplay && <span className="text-cyan-400 font-mono">{valueDisplay}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className={cn(
          'w-full h-1.5 bg-canvas-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none',
          className
        )}
        {...props}
      />
    </div>
  );
};

