import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioRenderer } from '../portfolio/PortfolioRenderer';

export const LiveCanvas = () => {
  const { portfolio, deviceView, studioTheme } = usePortfolio();
  const isLight = studioTheme === 'light';

  // Container styling based on active viewport
  let frameWidthClass = 'w-full';
  let frameBorderClass = 'border-0';

  if (deviceView === 'tablet') {
    frameWidthClass = `max-w-[768px] my-6 rounded-[2.5rem] border-[10px] ${
      isLight ? 'border-slate-300 shadow-2xl shadow-slate-300/60' : 'border-[#1e2638] shadow-2xl'
    }`;
  } else if (deviceView === 'mobile') {
    frameWidthClass = `max-w-[380px] my-6 rounded-[3rem] border-[10px] ${
      isLight ? 'border-slate-300 shadow-2xl shadow-slate-300/60' : 'border-[#1e2638] shadow-2xl'
    }`;
  }

  return (
    <main
      className={`flex-1 relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-200 ${
        isLight ? 'bg-[#f4f6fa]' : 'bg-[#070a12]'
      }`}
    >
      {/* Canvas Viewport Scroll Area */}
      <div className="flex-1 overflow-y-auto flex justify-center items-start p-2 sm:p-6">
        <div className={`transition-all duration-300 origin-top overflow-hidden ${frameWidthClass} ${frameBorderClass}`}>
          {/* Mobile Notch Simulation */}
          {deviceView === 'mobile' && (
            <div className={`h-6 flex items-center justify-center ${isLight ? 'bg-slate-300' : 'bg-[#1e2638]'}`}>
              <div className="w-24 h-4 bg-black rounded-b-xl" />
            </div>
          )}

          {/* Render Active Portfolio */}
          <PortfolioRenderer portfolio={portfolio} isPreview={true} />
        </div>
      </div>
    </main>
  );
};
