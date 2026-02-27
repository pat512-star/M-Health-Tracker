
import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
}

const SliderInput: React.FC<SliderInputProps> = ({ 
  label, value, onChange, minLabel, midLabel, maxLabel 
}) => {
  return (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{label}</h3>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-6"
      />
      <div className="flex justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span className="w-1/3 text-left">{minLabel}</span>
        <span className="w-1/3 text-center">{midLabel}</span>
        <span className="w-1/3 text-right">{maxLabel}</span>
      </div>
      <div className="mt-4 flex justify-center">
        <span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-xl font-bold">
          {value}
        </span>
      </div>
    </div>
  );
};

export default SliderInput;
