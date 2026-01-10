import React, { useState } from 'react';

interface ScreenshotViewerProps {
  src: string;
  timestamp: string;
}

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({ src, timestamp }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-800 p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-slate-100 font-bold text-xl tracking-tight">Live Feed</h3>
        <div className="flex items-center gap-2">
            {timestamp && (
                <span className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Updated {new Date(timestamp).toLocaleTimeString()}
                </span>
            )}
        </div>
      </div>
      
      <div className="relative flex-1 min-h-[300px] rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner group w-full">
        {src ? (
            <>
              <div 
                className={`w-full h-full flex items-center justify-center ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img 
                    src={src} 
                    alt="Bot View" 
                    className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out select-none"
                    style={{ 
                      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                    }}
                    draggable={false}
                />
              </div>

              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex gap-2 bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-lg shadow-xl z-10">
                <button 
                  onClick={handleZoomOut}
                  disabled={scale <= 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Zoom Out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                  </svg>
                </button>
                <span className="flex items-center justify-center min-w-[3rem] text-sm font-semibold text-slate-200 border-x border-slate-800 px-2">
                  {Math.round(scale * 100)}%
                </span>
                <button 
                  onClick={handleZoomIn}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
                  title="Zoom In"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                 <button 
                  onClick={handleReset}
                  disabled={scale === 1}
                   className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md border-l border-slate-800 ml-1 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Reset"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                </button>
              </div>
            </>
        ) : (
            <div className="text-slate-600 flex flex-col items-center justify-center h-full">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-medium">No signal</span>
            </div>
        )}
      </div>
    </div>
  );
};
