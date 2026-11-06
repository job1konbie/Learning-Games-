import React, { useEffect } from 'react';
import { LevelConfig } from '../game/types';
import { Star, RotateCcw, ArrowRight, Grid, Award } from 'lucide-react';
import { sounds } from '../game/audio';

interface VictoryModalProps {
  isCleared: boolean;
  score: number;
  level: LevelConfig;
  onNextLevel: () => void;
  onRestart: () => void;
  onLevelSelect: () => void;
  isLastLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isCleared,
  score,
  level,
  onNextLevel,
  onRestart,
  onLevelSelect,
  isLastLevel,
}) => {
  // Calculate stars earned
  const { oneStar, twoStar, threeStar } = level.targetScore;
  let stars = 0;
  if (isCleared) {
    if (score >= threeStar) stars = 3;
    else if (score >= twoStar) stars = 2;
    else stars = 1;
  }

  useEffect(() => {
    if (isCleared) {
      sounds.playVictory();
      for (let i = 0; i < stars; i++) {
        setTimeout(() => {
          sounds.playStarDing(i);
        }, 500 + i * 280);
      }
    }
  }, [isCleared, stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-1 text-amber-400">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-display">
            {isCleared ? 'Level Cleared!' : 'Out of Ammo!'}
          </h2>
          <p className="text-sm text-slate-400">
            {isCleared ? level.subtitle : 'Some stubborn ducks escaped your sights. Pull back and try again!'}
          </p>
        </div>

        {/* Stars */}
        {isCleared && (
          <div className="flex items-center justify-center gap-3 py-2">
            {[1, 2, 3].map((sIndex) => {
              const active = sIndex <= stars;
              return (
                <div
                  key={sIndex}
                  className={`transition-all duration-300 transform ${
                    active ? 'scale-110 text-amber-400 drop-shadow-md' : 'text-slate-700'
                  }`}
                >
                  <Star className="w-9 h-9 fill-current" />
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Grid */}
        <div className="bg-slate-950/60 rounded-lg p-4 border border-slate-800/80 flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Final Score</span>
            <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="h-px bg-slate-800/70" />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>3-Star Target</span>
            <span className="font-mono tabular-nums text-slate-300">{threeStar.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>2-Star Target</span>
            <span className="font-mono tabular-nums text-slate-300">{twoStar.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onLevelSelect();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Grid className="w-4 h-4" />
            <span>Levels</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>

          {isCleared && !isLastLevel && (
            <button
              onClick={() => {
                sounds.playClick();
                onNextLevel();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm font-display"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
