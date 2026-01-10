import React from 'react';

interface StatBoxProps {
  title: string;
  value: string | number;
  variant?: 'default' | 'status';
}

export const StatBox: React.FC<StatBoxProps> = ({ title, value, variant = 'default' }) => {
  const isStatus = variant === 'status';
  
  const getStatusColor = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === 'RUNNING') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'STOPPED') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (s === 'IDLE') return 'bg-slate-700/50 text-slate-400 border-slate-600/50';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-800 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow duration-300 h-full">
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">{title}</h3>
      {isStatus ? (
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(String(value))}`}>
          {value}
        </span>
      ) : (
        <div className="text-3xl font-bold text-slate-100">
          {value}
        </div>
      )}
    </div>
  );
};
