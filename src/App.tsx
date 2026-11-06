import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DuckGameCanvas } from './components/DuckGameCanvas';
import { GameHUD } from './components/GameHUD';
import { VictoryModal } from './components/VictoryModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SandboxDrawer } from './components/SandboxDrawer';
import { LEVELS } from './game/levels';
import { LevelConfig, LevelProgress, GameMode, ProjectileType } from './game/types';
import { LAUNCH_POWER } from './game/physics';
import { sounds } from './game/audio';

export default function App() {
  // Mode & Levels
  const [mode, setMode] = useState<GameMode>('campaign');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [levelProgress, setLevelProgress] = useState<Record<number, LevelProgress>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('duck_shot_progress');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore corrupted json
        }
      }
    }
    return { 1: { stars: 0, highScore: 0, completed: false } };
  });

  // Current Level Configuration
  const baseLevel = useMemo(() => {
    return LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  }, [currentLevelId]);

  // Sandbox Customizations
  const [sandboxPower, setSandboxPower] = useState(LAUNCH_POWER);
  const [sandboxWind, setSandboxWind] = useState(0);

  // Active level config (allows sandbox wind override)
  const activeLevel: LevelConfig = useMemo(() => {
    if (mode === 'sandbox') {
      return {
        ...baseLevel,
        wind: sandboxWind,
      };
    }
    return baseLevel;
  }, [baseLevel, mode, sandboxWind]);

  // Game Play State
  const [score, setScore] = useState(0);
  const [ducksRemaining, setDucksRemaining] = useState(baseLevel.ducks.length);
  const [totalDucks, setTotalDucks] = useState(baseLevel.ducks.length);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [comboNotification, setComboNotification] = useState<string | null>(null);

  // Ammo inventory
  const [ammoCounts, setAmmoCounts] = useState<Record<ProjectileType, number>>(() => {
    const initial: Record<ProjectileType, number> = {
      standard: 0,
      water_balloon: 0,
      splitter: 0,
      bomb: 0,
    };
    baseLevel.ammo.forEach((a) => {
      initial[a.type] = a.count;
    });
    return initial;
  });

  const [selectedAmmo, setSelectedAmmo] = useState<ProjectileType>(() => {
    return baseLevel.ammo[0]?.type || 'standard';
  });

  // Audio mute state
  const [isMuted, setIsMuted] = useState(() => sounds.getMuted());

  // Modal displays
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isSandboxConfigOpen, setIsSandboxConfigOpen] = useState(false);

  // Key to force reload canvas state
  const [gameSessionKey, setGameSessionKey] = useState(0);

  // Sync ammo and ducks whenever level or mode changes
  const resetLevelState = useCallback(
    (lvl: LevelConfig, currentMode: GameMode) => {
      setScore(0);
      setDucksRemaining(lvl.ducks.length);
      setTotalDucks(lvl.ducks.length);
      setIsGameOverModalOpen(false);
      setIsLevelCleared(false);
      setComboNotification(null);
      setIsPaused(false);

      const newAmmo: Record<ProjectileType, number> = {
        standard: currentMode === 'sandbox' ? 999 : 0,
        water_balloon: currentMode === 'sandbox' ? 999 : 0,
        splitter: currentMode === 'sandbox' ? 999 : 0,
        bomb: currentMode === 'sandbox' ? 999 : 0,
      };

      if (currentMode !== 'sandbox') {
        lvl.ammo.forEach((a) => {
          newAmmo[a.type] = a.count;
        });
      }

      setAmmoCounts(newAmmo);
      const defaultAmmo = lvl.ammo.find((a) => a.count > 0)?.type || 'standard';
      setSelectedAmmo(defaultAmmo);
      setGameSessionKey((prev) => prev + 1);
    },
    []
  );

  useEffect(() => {
    resetLevelState(activeLevel, mode);
  }, [activeLevel, mode, resetLevelState]);

  // Save progress helper
  const saveProgress = useCallback((lvlId: number, starsEarned: number, finalScore: number) => {
    setLevelProgress((prev) => {
      const existing = prev[lvlId] || { stars: 0, highScore: 0, completed: false };
      const updated = {
        ...prev,
        [lvlId]: {
          stars: Math.max(existing.stars, starsEarned),
          highScore: Math.max(existing.highScore, finalScore),
          completed: true,
        },
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('duck_shot_progress', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Handlers
  const handleConsumeAmmo = (type: ProjectileType) => {
    if (mode === 'sandbox') return;

    setAmmoCounts((prev) => {
      const current = prev[type] || 0;
      const updatedCount = Math.max(0, current - 1);
      const updated = { ...prev, [type]: updatedCount };

      // If current ammo type ran out, auto switch to available ammo
      if (updatedCount === 0) {
        const available = Object.keys(updated).find(
          (k) => (updated[k as ProjectileType] || 0) > 0
        ) as ProjectileType | undefined;
        if (available) {
          setSelectedAmmo(available);
        }
      }
      return updated;
    });
  };

  const handleAddScore = (points: number, comboText?: string) => {
    setScore((prev) => prev + points);
    if (comboText) {
      setComboNotification(comboText);
      setTimeout(() => setComboNotification(null), 1400);
    }
  };

  const handleDuckCleared = (_duckId: string, remaining: number) => {
    setDucksRemaining(remaining);
  };

  const handleAllDucksCleared = () => {
    setIsLevelCleared(true);
    setIsGameOverModalOpen(true);

    // Calculate stars
    const { oneStar, twoStar, threeStar } = activeLevel.targetScore;
    let stars = 1;
    if (score >= threeStar) stars = 3;
    else if (score >= twoStar) stars = 2;
    else if (score >= oneStar) stars = 1;

    saveProgress(currentLevelId, stars, score);
  };

  const handleOutOfAmmo = () => {
    setIsLevelCleared(false);
    setIsGameOverModalOpen(true);
  };

  const handleNextLevel = () => {
    const nextId = currentLevelId + 1;
    if (nextId <= LEVELS.length) {
      setCurrentLevelId(nextId);
    }
  };

  const handleRestart = () => {
    resetLevelState(activeLevel, mode);
  };

  const handleToggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleSwitchMode = (newMode: GameMode) => {
    sounds.playClick();
    setMode(newMode);
  };

  return (
    <div className="min-h-screen bg-[#0a1120] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* 
        Top Bar Contract (Section 2 of Constitution):
        Exactly 3 zones separated by gap-8:
        Zone 1: Single text element wordmark
        Zone 2: 4–5 single-line clean text navigation links
        Zone 3: 1 primary action
      */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <span className="text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 font-display">
          Duck Shot
        </span>

        {/* Zone 2: Single-line Text Links / Modes */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => handleSwitchMode('campaign')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'campaign' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Campaign
          </button>
          <button
            onClick={() => handleSwitchMode('arcade')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'arcade' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Arcade Gallery
          </button>
          <button
            onClick={() => handleSwitchMode('sandbox')}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'sandbox' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Free Sandbox
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setIsLevelSelectOpen(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Stages
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setIsHowToPlayOpen(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How to Play
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              handleRestart();
            }}
            className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 font-display shadow-sm cursor-pointer"
          >
            New Shot
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 flex flex-col gap-3 items-center justify-center">
        {/* Unobtrusive HUD */}
        <GameHUD
          currentLevel={activeLevel}
          mode={mode}
          score={score}
          ducksRemaining={ducksRemaining}
          totalDucks={totalDucks}
          ammoCounts={ammoCounts}
          selectedAmmo={selectedAmmo}
          onSelectAmmo={setSelectedAmmo}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused((prev) => !prev)}
          onRestart={handleRestart}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
          onOpenSandboxConfig={() => setIsSandboxConfigOpen(true)}
          comboNotification={comboNotification}
        />

        {/* Canvas Game Arena */}
        <div className="w-full max-w-[1050px] aspect-[1050/540] relative flex items-center justify-center">
          <DuckGameCanvas
            key={`${currentLevelId}_${mode}_${gameSessionKey}`}
            currentLevel={activeLevel}
            mode={mode}
            currentAmmoType={selectedAmmo}
            ammoCounts={ammoCounts}
            onConsumeAmmo={handleConsumeAmmo}
            onAddScore={handleAddScore}
            onDuckCleared={handleDuckCleared}
            onAllDucksCleared={handleAllDucksCleared}
            onOutOfAmmo={handleOutOfAmmo}
            isPaused={isPaused}
            onRestartRequest={handleRestart}
            customPower={mode === 'sandbox' ? sandboxPower : LAUNCH_POWER}
          />
        </div>

        {/* Quiet Editorial Footer */}
        <footer className="w-full max-w-[1050px] flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-900">
          <div className="flex items-center gap-2">
            <span>2D Physics Slingshot</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio API Synthesizer</span>
            <span aria-hidden="true">·</span>
            <span>Retina 60 FPS Canvas</span>
          </div>
          <div>Aim with drag & release · Space to trigger abilities</div>
        </footer>
      </main>

      {/* Modals & Dialogs */}
      {isGameOverModalOpen && (
        <VictoryModal
          isCleared={isLevelCleared}
          score={score}
          level={activeLevel}
          onNextLevel={() => {
            setIsGameOverModalOpen(false);
            handleNextLevel();
          }}
          onRestart={() => {
            setIsGameOverModalOpen(false);
            handleRestart();
          }}
          onLevelSelect={() => {
            setIsGameOverModalOpen(false);
            setIsLevelSelectOpen(true);
          }}
          isLastLevel={currentLevelId === LEVELS.length}
        />
      )}

      {isLevelSelectOpen && (
        <LevelSelectModal
          levels={LEVELS}
          currentLevelId={currentLevelId}
          progress={levelProgress}
          onSelectLevel={(id) => setCurrentLevelId(id)}
          onClose={() => setIsLevelSelectOpen(false)}
        />
      )}

      {isHowToPlayOpen && (
        <HowToPlayModal onClose={() => setIsHowToPlayOpen(false)} />
      )}

      <SandboxDrawer
        isOpen={isSandboxConfigOpen}
        onClose={() => setIsSandboxConfigOpen(false)}
        power={sandboxPower}
        onPowerChange={setSandboxPower}
        wind={sandboxWind}
        onWindChange={setSandboxWind}
        onResetDefaults={() => {
          setSandboxPower(LAUNCH_POWER);
          setSandboxWind(0);
        }}
      />
    </div>
  );
}
