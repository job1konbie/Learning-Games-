import React from 'react';
import { ProjectileType, LevelConfig, GameMode } from '../game/types';
import { Volume2, VolumeX, RotateCcw, Pause, Play, HelpCircle, Grid, Sliders } from 'lucide-react';
import { sounds } from '../game/audio';

interface GameHUDProps {
  currentLevel: LevelConfig;
  mode: GameMode;
  score: number;
  ducksRemaining: number;
  totalDucks: number;
  ammoCounts: Record<ProjectileType, number>;
  selectedAmmo: ProjectileType;
  onSelectAmmo: (type: ProjectileType) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  onOpenHowToPlay: () => void;
  onOpenSandboxConfig?: () => void;
  comboNotification?: string | null;
}

const AMMO_CONFIGS: { type: ProjectileType; label: string; desc: string; iconBg: string }[] = [
  {
    type: 'standard',
    label: 'Standard',
    desc: 'Solid carnival pebble',
    iconBg: 'bg-rose-500',
  },
  {
    type: 'water_balloon',
    label: 'Water Splash',
    desc: 'Area blast wave',
    iconBg: 'bg-cyan-500',
  },
  {
    type: 'splitter',
    label: 'Splitter',
    desc: 'Tap in-flight to split x3',
    iconBg: 'bg-amber-500',
  },
  {
    type: 'bomb',
    label: 'Quack Bomb',
    desc: 'Shockwave demolition',
    iconBg: 'bg-slate-700',
  },
];

export const GameHUD: React.FC<GameHUDProps> = ({
  currentLevel,
  mode,
  score,
  ducksRemaining,
  totalDucks,
  ammoCounts,
  selectedAmmo,
  onSelectAmmo,
  isMuted,
  onToggleMute,
  isPaused,
  onTogglePause,
  onRestart,
  onOpenLevelSelect,
  onOpenHowToPlay,
  onOpenSandboxConfig,
  comboNotification,
}) => {
  return (
    <div className="w-full max-w-[1050px] mx-auto flex flex-col gap-2 pointer-events-auto">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-800 text-slate-200 text-sm">
        {/* Left: Level / Mode info */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-100 tracking-wide font-display">
            {mode === 'campaign' ? currentLevel.title : mode === 'arcade' ? 'Endless Gallery' : 'Free Sandbox'}
          </span>
          <span className="text-slate-500" aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <span>Ducks:</span>
            <span className="font-mono tabular-nums text-slate-100 font-bold">
              {totalDucks - ducksRemaining}/{totalDucks}
            </span>
          </div>
        </div>

        {/* Center: Score & Combo Notification */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Score</span>
            <span className="font-mono font-extrabold text-lg text-emerald-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>

          {comboNotification && (
            <span className="text-xs font-bold text-amber-300 animate-pulse font-display">
              {comboNotification}
            </span>
          )}
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5">
          {mode === 'sandbox' && onOpenSandboxConfig && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenSandboxConfig();
              }}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Sandbox Controls"
              aria-label="Sandbox Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onOpenLevelSelect();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Choose Level"
            aria-label="Level Select"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Restart Level"
            aria-label="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onTogglePause();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onToggleMute();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenHowToPlay();
            }}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="How to Play"
            aria-label="Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Ammo Selector Deck */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium tracking-wide">Projectiles:</span>
          <div className="flex items-center gap-2">
            {AMMO_CONFIGS.map((ammo) => {
              const count = ammoCounts[ammo.type] ?? 0;
              const isSelected = selectedAmmo === ammo.type;
              const isDisabled = mode === 'campaign' && count <= 0;

              return (
                <button
                  key={ammo.type}
                  disabled={isDisabled}
                  onClick={() => {
                    sounds.playClick();
                    onSelectAmmo(ammo.type);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all text-xs font-medium ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 shadow-sm font-semibold'
                      : isDisabled
                      ? 'opacity-40 cursor-not-allowed bg-slate-800/50 text-slate-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${ammo.iconBg} shrink-0`} />
                  <span>{ammo.label}</span>
                  {mode === 'campaign' && (
                    <span className="font-mono tabular-nums opacity-80">({count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tip text */}
        <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
          <span>Pull & stretch backwards to aim</span>
          <span aria-hidden="true">·</span>
          <span>Tap/Space in-flight to activate powers</span>
        </div>
      </div>
    </div>
  );
};
