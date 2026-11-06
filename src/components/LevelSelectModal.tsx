import React from 'react';
import { LevelConfig, LevelProgress } from '../game/types';
import { X, Star, Lock } from 'lucide-react';
import { sounds } from '../game/audio';

interface LevelSelectModalProps {
  levels: LevelConfig[];
  currentLevelId: number;
  progress: Record<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">Campaign Stages</h2>
            <p className="text-xs text-slate-400">Aim, hit quirky rubber ducks, and earn 3 stars on every pond.</p>
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

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((lvl) => {
            const p = progress[lvl.id] || { stars: 0, highScore: 0, completed: false };
            // First level is always unlocked; subsequent levels unlock if previous is completed or played
            const isUnlocked = lvl.id === 1 || progress[lvl.id - 1]?.completed || p.completed;
            const isCurrent = lvl.id === currentLevelId;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => {
                  sounds.playClick();
                  onSelectLevel(lvl.id);
                  onClose();
                }}
                className={`text-left p-3.5 rounded-lg border transition-all flex flex-col gap-2 ${
                  isCurrent
                    ? 'border-emerald-500/80 bg-emerald-950/20 shadow-md'
                    : isUnlocked
                    ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-800/60'
                    : 'border-slate-800/50 bg-slate-950/30 opacity-45 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-200 font-display">
                      {lvl.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">
                        Active
                      </span>
                    )}
                  </div>
                  {!isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= p.stars ? 'fill-current' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-1">{lvl.subtitle}</p>

                {isUnlocked && p.highScore > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Best Score</span>
                    <span className="text-slate-300 tabular-nums">{p.highScore.toLocaleString()}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
