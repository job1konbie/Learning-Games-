import React from 'react';
import { X, Sliders, Wind, Zap } from 'lucide-react';
import { sounds } from '../game/audio';

interface SandboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  power: number;
  onPowerChange: (p: number) => void;
  wind: number;
  onWindChange: (w: number) => void;
  onResetDefaults: () => void;
}

export const SandboxDrawer: React.FC<SandboxDrawerProps> = ({
  isOpen,
  onClose,
  power,
  onPowerChange,
  wind,
  onWindChange,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold font-display text-white">Physics Sandbox Controls</h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Slingshot Launch Power */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Elastic Tension Power
              </span>
              <span className="font-mono text-emerald-400 font-bold">{power.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="3.0"
              max="11.0"
              step="0.5"
              value={power}
              onChange={(e) => onPowerChange(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Gentle (3.0x)</span>
              <span>Default (6.4x)</span>
              <span>Cannon (11.0x)</span>
            </div>
          </div>

          {/* Wind Speed & Direction */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                Crosswind Velocity
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {wind === 0 ? 'Calm' : `${wind > 0 ? '+' : ''}${wind.toFixed(1)} kt`}
              </span>
            </div>
            <input
              type="range"
              min="-10.0"
              max="10.0"
              step="1.0"
              value={wind}
              onChange={(e) => onWindChange(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Headwind (-10)</span>
              <span>0</span>
              <span>Tailwind (+10)</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onResetDefaults();
            }}
            className="flex-1 py-1.5 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex-1 py-1.5 text-xs font-bold rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors font-display"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
