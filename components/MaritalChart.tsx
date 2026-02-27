
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ChartDataPoint } from '../types';

interface MaritalChartProps {
  data: ChartDataPoint[];
}

const MaritalChart: React.FC<MaritalChartProps> = ({ data }) => {
  return (
    <div className="h-[400px] w-full bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            dy={10} 
          />
          <YAxis 
            domain={[0, 10]} 
            tick={{ fontSize: 12 }} 
            axisLine={false} 
            tickLine={false} 
            dx={-10} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            type="monotone" 
            dataKey="h_overall" 
            name="Husband Overall" 
            stroke="#4f46e5" 
            strokeWidth={3} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="w_overall" 
            name="Wife Overall" 
            stroke="#ec4899" 
            strokeWidth={3} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MaritalChart;
