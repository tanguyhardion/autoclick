import React from 'react';

interface ControlPanelProps {
  onStart: () => void;
  onStop: () => void;
  onContinue: () => void;
  onScreenshot: () => void;
  loading: boolean;
  status: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onStart, onStop, onContinue, onScreenshot, loading, status 
}) => {
  const isRunning = status === 'RUNNING';
  
  const buttonBase = "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95 duration-200";

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8">
      <h3 className="text-slate-100 font-bold mb-6 text-xl tracking-tight">Bot Controls</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={onStart}
          disabled={loading || isRunning}
          className={`${buttonBase} bg-emerald-500 hover:bg-emerald-600 text-white`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Start
        </button>
        
        <button
          onClick={onStop}
          disabled={loading || status === 'STOPPED'}
          className={`${buttonBase} bg-primary-600 hover:bg-primary-700 text-white`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
          Stop
        </button>

        <button
          onClick={onContinue}
          disabled={loading || isRunning}
          className={`${buttonBase} bg-blue-500 hover:bg-blue-600 text-white`}
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Continue
        </button>

        <button
          onClick={onScreenshot}
          disabled={loading}
          className={`${buttonBase} bg-stone-100 hover:bg-stone-200 text-stone-700`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Screenshot
        </button>
      </div>
    </div>
  );
};
