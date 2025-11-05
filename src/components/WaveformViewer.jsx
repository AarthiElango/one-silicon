import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

export default function WaveformViewer({ theme }) {
  const [zoom, setZoom] = useState(1);
  const [signals, setSignals] = useState([
    { name: 'clk', type: 'clock', values: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1] },
    { name: 'rst', type: 'data', values: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'count[3:0]', type: 'bus', values: ['0', '0', '1', '1', '2', '2', '3', '3', '4', '4', '5', '5', '6', '6', '7', '7'], expanded: false }
  ]);

  const timeSteps = Array.from({ length: 16 }, (_, i) => i * 5);

  const toggleSignal = (index) => {
    setSignals(prev => prev.map((sig, i) => 
      i === index ? { ...sig, expanded: !sig.expanded } : sig
    ));
  };

  const renderWaveform = (signal) => {
    const cellWidth = 40 * zoom;
    
    if (signal.type === 'clock') {
      return (
        <svg width={signal.values.length * cellWidth} height="40" className="border-l border-gray-700">
          {signal.values.map((value, i) => (
            <g key={i}>
              <line
                x1={i * cellWidth}
                y1={value === 0 ? 30 : 10}
                x2={(i + 1) * cellWidth}
                y2={value === 0 ? 30 : 10}
                stroke="#10b981"
                strokeWidth="2"
              />
              {i < signal.values.length - 1 && signal.values[i] !== signal.values[i + 1] && (
                <line
                  x1={(i + 1) * cellWidth}
                  y1={10}
                  x2={(i + 1) * cellWidth}
                  y2={30}
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </svg>
      );
    } else if (signal.type === 'data') {
      return (
        <svg width={signal.values.length * cellWidth} height="40" className="border-l border-gray-700">
          {signal.values.map((value, i) => (
            <g key={i}>
              <line
                x1={i * cellWidth}
                y1={value === 0 ? 30 : 10}
                x2={(i + 1) * cellWidth}
                y2={value === 0 ? 30 : 10}
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {i < signal.values.length - 1 && signal.values[i] !== signal.values[i + 1] && (
                <line
                  x1={(i + 1) * cellWidth}
                  y1={10}
                  x2={(i + 1) * cellWidth}
                  y2={30}
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}
        </svg>
      );
    } else { // bus
      return (
        <svg width={signal.values.length * cellWidth} height="40" className="border-l border-gray-700">
          {signal.values.map((value, i) => (
            <g key={i}>
              <path
                d={`
                  M ${i * cellWidth + 5} 10
                  L ${(i + 1) * cellWidth - 5} 10
                  L ${(i + 1) * cellWidth} 15
                  L ${(i + 1) * cellWidth} 25
                  L ${(i + 1) * cellWidth - 5} 30
                  L ${i * cellWidth + 5} 30
                  L ${i * cellWidth} 25
                  L ${i * cellWidth} 15
                  Z
                `}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              <text
                x={i * cellWidth + cellWidth / 2}
                y="24"
                textAnchor="middle"
                fill="#f59e0b"
                fontSize="12"
                fontFamily="monospace"
              >
                {value}
              </text>
            </g>
          ))}
        </svg>
      );
    }
  };

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* GTKWave Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-sm">GTKWave - counter.vcd</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="h-7">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.25))} className="h-7">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Signal Names Panel */}
        <div className={`w-48 border-r overflow-y-auto ${theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-100 border-gray-200'}`}>
          <div className={`px-3 py-2 text-xs border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
            Signals
          </div>
          
          {signals.map((signal, index) => (
            <div key={index}>
              <div
                className={`flex items-center gap-2 px-3 py-2.5 hover:bg-gray-800/50 cursor-pointer border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}
                onClick={() => toggleSignal(index)}
              >
                {signal.type === 'bus' && (
                  signal.expanded ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                )}
                <span className="text-sm font-mono">{signal.name}</span>
              </div>
              
              {signal.expanded && signal.type === 'bus' && (
                <div className="pl-6">
                  {[3, 2, 1, 0].map(bit => (
                    <div
                      key={bit}
                      className={`px-3 py-2 text-xs font-mono border-b ${theme === 'dark' ? 'border-gray-800 text-gray-400' : 'border-gray-200 text-gray-600'}`}
                    >
                      count[{bit}]
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Waveform Display Panel */}
        <div className="flex-1 overflow-auto">
          <div className={`sticky top-0 z-10 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
            <svg width={timeSteps.length * 40 * zoom} height="30">
              {timeSteps.map((time, i) => (
                <g key={i}>
                  <line x1={i * 40 * zoom} y1="20" x2={i * 40 * zoom} y2="30" stroke="#6b7280" strokeWidth="1" />
                  <text x={i * 40 * zoom + 5} y="15" fill="#9ca3af" fontSize="10" fontFamily="monospace">
                    {time}ns
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Waveforms */}
          <div>
            {signals.map((signal, index) => (
              <div key={index} className={`border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                {renderWaveform(signal)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={`px-4 py-1 text-xs border-t ${theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800 text-gray-500' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
        <div className="flex items-center justify-between">
          <span>Time: 0ns - 80ns</span>
          <span>3 signals loaded</span>
        </div>
      </div>
    </div>
  );
}
