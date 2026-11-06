import React from 'react';
import { X, Target, Crosshair, Sparkles, Shield, Compass } from 'lucide-react';
import { sounds } from '../game/audio';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">How to Play Duck Shot</h2>
            <p className="text-xs text-slate-400">Master physics, trajectory arcs, and special carnival pebbles.</p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-4 text-xs text-slate-300">
          {/* Controls */}
          <div className="flex flex-col gap-2 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-display">Slingshot Mechanics</span>
            </div>
            <p className="text-slate-400">
              Click or touch the slingshot fork on the left pier, then <strong>pull backwards and downwards</strong> to stretch the elastic rubber band. The white dotted trajectory line previews your flight arc. Release to launch!
            </p>
          </div>

          {/* Projectile Abilities */}
          <div className="flex flex-col gap-2 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-display">Special Projectiles</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <strong className="text-rose-400">Standard:</strong> Bouncy, direct impact pebble.
              </div>
              <div>
                <strong className="text-cyan-400">Water Balloon:</strong> Bursts on impact, splashing nearby ducks with shockwaves.
              </div>
              <div>
                <strong className="text-amber-400">Splitter:</strong> Press Space or tap screen in mid-air to split into 3 stones!
              </div>
              <div>
                <strong className="text-slate-300">Quack Bomb:</strong> Heavy iron bomb that demolishes crates and duck barricades.
              </div>
            </div>
          </div>

          {/* Ducks Field Guide */}
          <div className="flex flex-col gap-2 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Target className="w-4 h-4 text-rose-400" />
              <span className="text-sm font-display">Rubber Duck Roster</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div>
                <strong className="text-yellow-300">Classic Yellow Duck:</strong> 100 pts. Standard calm swimmer.
              </div>
              <div>
                <strong className="text-amber-300">Captain Duck:</strong> 250 pts. Wears pirate hat; takes 2 hits.
              </div>
              <div>
                <strong className="text-cyan-300">Diver Duck:</strong> 350 pts. Speedy duck that patrols quickly.
              </div>
              <div>
                <strong className="text-amber-400">Golden Sovereign:</strong> 800 pts. High-value shimmering trophy duck.
              </div>
              <div>
                <strong className="text-rose-400">Glider Duck:</strong> 400 pts. Suspended in air by helium balloon!
              </div>
              <div>
                <strong className="text-yellow-400">Mega Quacken Boss:</strong> 1,500 pts. Heavy boss with 4 HP bar.
              </div>
            </div>
          </div>

          {/* Rings & Obstacles */}
          <div className="flex items-center gap-3 bg-slate-950/50 p-3.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            <Compass className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <strong>Bonus Rings & TNT:</strong> Launch through glowing brass rings for <strong>2X multiplier</strong>. Hit red TNT barrels to trigger explosive domino chain reactions!
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors font-display"
        >
          Got It, Let&apos;s Shoot!
        </button>
      </div>
    </div>
  );
};
