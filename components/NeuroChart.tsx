import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { HistoryPoint } from '../types';

interface NeuroChartProps {
  data: HistoryPoint[];
  selectedDay?: number;
  onSelectPoint?: (day: number) => void;
}

const NeuroChart: React.FC<NeuroChartProps> = ({ data, selectedDay, onSelectPoint }) => {
  return (
    <div className="w-full h-[300px] bg-black/20 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/5 relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
          Temporal Chemistry Logs
        </h3>
        <div className="text-[8px] font-mono text-gray-600">
          {selectedDay !== undefined ? `SELECTED_DAY: ${selectedDay}` : 'IDLE_READY'} // BUFF_CAPACITY: {data.length}/100
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart 
          data={data}
          onClick={(e) => {
            if (e && e.activePayload && onSelectPoint) {
              onSelectPoint(e.activePayload[0].payload.day);
            }
          }}
        >
          <CartesianGrid strokeDasharray="10 10" stroke="rgba(255,255,255,0.02)" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="rgba(255,255,255,0.1)" 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }}
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.1)" 
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 700 }} 
            domain={[0, 2]} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.9)', 
              border: '1px border rgba(255,255,255,0.1)', 
              borderRadius: '16px',
              backdropFilter: 'blur(20px)',
              fontSize: '10px',
              color: '#fff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
            }}
            itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
          />
          <Legend 
             verticalAlign="top" 
             align="right" 
             iconType="circle"
             wrapperStyle={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', paddingBottom: '20px' }}
          />
          <Line 
            type="monotone" 
            dataKey="dopamine" 
            stroke="#f43f5e" 
            strokeWidth={2} 
            dot={selectedDay !== undefined ? (props: any) => {
              const { cx, cy, payload } = props;
              if (payload.day === selectedDay) {
                return (
                  <circle cx={cx} cy={cy} r={6} fill="#f43f5e" stroke="white" strokeWidth={2} />
                );
              }
              return null;
            } : false}
            name="DOPAMINE"
            animationDuration={1500}
          />
          <Line 
            type="monotone" 
            dataKey="serotonin" 
            stroke="#06b6d4" 
            strokeWidth={2} 
            dot={false}
            name="SEROTONIN"
            animationDuration={1500}
          />
          <Line 
            type="monotone" 
            dataKey="adrenaline" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            dot={false}
            name="ADRENALINE"
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-gray-600 uppercase font-black opacity-0 group-hover:opacity-100 transition-opacity">
        Click chart point to engineer historical comparison
      </div>
    </div>
  );
};

export default NeuroChart;