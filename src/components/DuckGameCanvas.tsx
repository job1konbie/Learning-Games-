import React, { useRef, useEffect, useCallback } from 'react';
import {
  Duck,
  Projectile,
  Obstacle,
  Particle,
  FloatingText,
  WaterRipple,
  DuckType,
  ProjectileType,
  LevelConfig,
  GameMode,
} from '../game/types';
import { GameRenderer } from '../game/renderer';
import { PhysicsEngine, MAX_PULL_DISTANCE, LAUNCH_POWER } from '../game/physics';
import { sounds } from '../game/audio';

interface DuckGameCanvasProps {
  currentLevel: LevelConfig;
  mode: GameMode;
  currentAmmoType: ProjectileType;
  ammoCounts: Record<ProjectileType, number>;
  onConsumeAmmo: (type: ProjectileType) => void;
  onAddScore: (points: number, comboText?: string) => void;
  onDuckCleared: (duckId: string, remainingCount: number) => void;
  onAllDucksCleared: () => void;
  onOutOfAmmo: () => void;
  isPaused: boolean;
  onRestartRequest: () => void;
  customGravity?: number;
  customPower?: number;
}

export const DuckGameCanvas: React.FC<DuckGameCanvasProps> = ({
  currentLevel,
  mode,
  currentAmmoType,
  ammoCounts,
  onConsumeAmmo,
  onAddScore,
  onDuckCleared,
  onAllDucksCleared,
  onOutOfAmmo,
  isPaused,
  customPower = LAUNCH_POWER,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Slingshot Fork Coordinates
  const slingshotForkRef = useRef({ x: 125, y: 360 });

  // Aiming state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pullPosRef = useRef<{ x: number; y: number } | null>(null);

  // Entities state
  const ducksRef = useRef<Duck[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);

  // Combo & Game tracking
  const comboCountRef = useRef(0);
  const activeShotsFiredRef = useRef(0);
  const ringMultiplierActiveRef = useRef(1);
  const screenShakeRef = useRef({ intensity: 0, decay: 0.9 });
  const slowMoRef = useRef({ factor: 1, timer: 0 });

  // Arcade spawner timer
  const arcadeSpawnTimerRef = useRef(0);

  // Helper to spawn water splash particles & ripples
  const spawnWaterSplash = useCallback((x: number, y: number, speed: number) => {
    sounds.playSplash();
    const count = Math.min(24, Math.floor(speed * 0.04) + 8);

    // Particles
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const vel = (Math.random() * 0.7 + 0.3) * Math.min(speed * 0.6, 260);
      particlesRef.current.push({
        id: `water_${Math.random()}`,
        x: x + (Math.random() - 0.5) * 20,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel - 40,
        life: 0.7 + Math.random() * 0.4,
        maxLife: 1.1,
        size: Math.random() * 4 + 2,
        color: '#38bdf8',
        type: 'water',
      });
    }

    // Ripple
    ripplesRef.current.push({
      id: `rip_${Math.random()}`,
      x,
      y,
      radius: 6,
      maxRadius: 55,
      alpha: 1,
    });
  }, []);

  // Helper to spawn duck hit feathers & comic text
  const spawnDuckHitJuice = useCallback((duck: Duck, hitPoint: { x: number; y: number }, pointsAwarded: number) => {
    sounds.playQuack(duck.type === 'golden' ? 1.3 : duck.type === 'mega' ? 0.7 : 1.0);

    // Feathers
    const count = duck.type === 'mega' ? 24 : 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 140 + 40;
      particlesRef.current.push({
        id: `feather_${Math.random()}`,
        x: hitPoint.x,
        y: hitPoint.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 1.2 + Math.random() * 0.6,
        maxLife: 1.8,
        size: Math.random() * 6 + 4,
        color: duck.type === 'golden' ? '#f59e0b' : '#facc15',
        type: 'feather',
        rotation: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 6,
      });
    }

    // Floating score & comic exclamation
    const exclamations = ['QUACK!', 'DIRECT HIT!', 'BULLSEYE!', 'SPLASH!', 'BONK!'];
    const comicWord = exclamations[Math.floor(Math.random() * exclamations.length)];

    floatingTextsRef.current.push({
      id: `text_${Math.random()}`,
      x: hitPoint.x,
      y: hitPoint.y - 20,
      vy: -60,
      text: `+${pointsAwarded} ${comicWord}`,
      color: duck.type === 'golden' ? '#fbbf24' : '#fef08a',
      life: 1.2,
      maxLife: 1.2,
      scale: 1,
    });

    // Screen shake
    screenShakeRef.current.intensity = Math.max(screenShakeRef.current.intensity, duck.type === 'mega' ? 14 : 7);
  }, []);

  // Initialize level ducks and obstacles
  const loadLevel = useCallback(() => {
    const forkY = currentLevel.waterLevel - 70;
    slingshotForkRef.current = { x: 125, y: forkY };

    // Setup ducks
    const ducks: Duck[] = currentLevel.ducks.map((d, index) => {
      let radius = 22;
      let hp = 1;
      let points = 100;

      if (d.type === 'captain') {
        radius = 24;
        hp = 2;
        points = 250;
      } else if (d.type === 'diver') {
        radius = 21;
        hp = 1;
        points = 350;
      } else if (d.type === 'golden') {
        radius = 22;
        hp = 1;
        points = 800;
      } else if (d.type === 'mega') {
        radius = 42;
        hp = 4;
        points = 1500;
      } else if (d.type === 'glider') {
        radius = 20;
        hp = 1;
        points = 400;
      }

      return {
        id: `duck_${index}_${Date.now()}`,
        type: d.type,
        x: d.x,
        y: d.y,
        baseY: d.y,
        vx: (d.speed || 30) * (Math.random() > 0.5 ? 1 : -1),
        vy: 0,
        radius,
        hp,
        maxHp: hp,
        points,
        bobOffset: Math.random() * Math.PI * 2,
        bobSpeed: 3 + Math.random() * 2,
        bobAmplitude: 5 + Math.random() * 4,
        facing: 1,
        patrolMinX: d.patrolMinX,
        patrolMaxX: d.patrolMaxX,
        isHit: false,
        rotation: 0,
        angularVelocity: 0,
        inWater: d.y >= currentLevel.waterLevel - 10,
        scaleX: 1,
        scaleY: 1,
        balloonHp: d.type === 'glider' ? 1 : undefined,
      };
    });

    // Setup obstacles
    const obstacles: Obstacle[] = currentLevel.obstacles.map((o, idx) => ({
      id: `obs_${idx}_${Date.now()}`,
      type: o.type,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
      rotation: 0,
      vx: 0,
      vy: 0,
      angularVelocity: 0,
      hp: o.hp || 30,
      maxHp: o.hp || 30,
      isStatic: o.isStatic ?? false,
      inWater: o.y >= currentLevel.waterLevel - 10,
      points: o.type === 'tnt' ? 150 : 50,
    }));

    ducksRef.current = ducks;
    obstaclesRef.current = obstacles;
    projectilesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    ripplesRef.current = [];
    pullPosRef.current = null;
    isDraggingRef.current = false;
    comboCountRef.current = 0;
    activeShotsFiredRef.current = 0;
    ringMultiplierActiveRef.current = 1;
  }, [currentLevel]);

  // Reload when level changes
  useEffect(() => {
    loadLevel();
  }, [loadLevel]);

  // Trigger special ability (e.g. Splitter split or Bomb explode)
  const triggerProjectileAbility = useCallback(() => {
    let triggered = false;
    const nextProjectiles: Projectile[] = [];

    for (const p of projectilesRef.current) {
      if (p.inAir && !p.exploded) {
        if (p.type === 'splitter' && !p.hasSplit) {
          const splitKids = PhysicsEngine.splitProjectile(p);
          nextProjectiles.push(...splitKids);
          triggered = true;
        } else if (p.type === 'bomb') {
          p.exploded = true;
          triggered = true;
        } else {
          nextProjectiles.push(p);
        }
      } else {
        nextProjectiles.push(p);
      }
    }

    if (triggered) {
      projectilesRef.current = nextProjectiles;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        triggerProjectileAbility();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerProjectileAbility]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let isRunning = true;

    const renderer = new GameRenderer(ctx, canvas.width, canvas.height);

    const gameLoop = (currentTime: number) => {
      if (!isRunning) return;

      const rawDt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      // Handle slow motion
      if (slowMoRef.current.timer > 0) {
        slowMoRef.current.timer -= rawDt;
        if (slowMoRef.current.timer <= 0) {
          slowMoRef.current.factor = 1;
        }
      }
      const dt = isPaused ? 0 : rawDt * slowMoRef.current.factor;
      const gameTime = currentTime / 1000;

      // Arcade mode continuous spawner
      if (mode === 'arcade' && !isPaused) {
        arcadeSpawnTimerRef.current += rawDt;
        if (arcadeSpawnTimerRef.current > 3.2 && ducksRef.current.filter((d) => !d.isHit).length < 6) {
          arcadeSpawnTimerRef.current = 0;
          const duckTypes: DuckType[] = ['classic', 'captain', 'diver', 'golden'];
          const chosenType = duckTypes[Math.floor(Math.random() * duckTypes.length)];
          const spawnSpeed = (Math.random() * 50 + 40) * (Math.random() > 0.5 ? 1 : -1);
          ducksRef.current.push({
            id: `arcade_duck_${Date.now()}`,
            type: chosenType,
            x: spawnSpeed > 0 ? 460 : 980,
            y: currentLevel.waterLevel,
            baseY: currentLevel.waterLevel,
            vx: spawnSpeed,
            vy: 0,
            radius: chosenType === 'golden' ? 22 : 24,
            hp: chosenType === 'captain' ? 2 : 1,
            maxHp: chosenType === 'captain' ? 2 : 1,
            points: chosenType === 'golden' ? 800 : chosenType === 'captain' ? 250 : 100,
            bobOffset: Math.random() * Math.PI * 2,
            bobSpeed: 3 + Math.random() * 2,
            bobAmplitude: 5,
            facing: spawnSpeed > 0 ? 1 : -1,
            patrolMinX: 420,
            patrolMaxX: 1020,
            isHit: false,
            rotation: 0,
            angularVelocity: 0,
            inWater: true,
            scaleX: 1,
            scaleY: 1,
          });
        }
      }

      // Physics Updates
      if (!isPaused) {
        // 1. Update Projectiles
        projectilesRef.current = PhysicsEngine.updateProjectiles(
          projectilesRef.current,
          dt,
          currentLevel.wind,
          currentLevel.waterLevel,
          canvas.width,
          canvas.height,
          spawnWaterSplash
        );

        // Check for bomb/water balloon explosions
        for (const p of projectilesRef.current) {
          if (p.exploded) {
            if (p.type === 'bomb') {
              PhysicsEngine.applyExplosionShockwave(
                p.x,
                p.y,
                140,
                380,
                ducksRef.current,
                obstaclesRef.current,
                (duck, hitPoint) => {
                  duck.hp = 0;
                  duck.isHit = true;
                  comboCountRef.current += 1;
                  const pts = duck.points * Math.min(comboCountRef.current, 4);
                  onAddScore(pts, comboCountRef.current > 1 ? `x${comboCountRef.current}` : undefined);
                  spawnDuckHitJuice(duck, hitPoint, pts);
                },
                (obs) => {
                  sounds.playWoodHit();
                }
              );
              // Explosion smoke and sparks
              for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const spd = Math.random() * 180 + 40;
                particlesRef.current.push({
                  id: `spark_${Math.random()}`,
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(angle) * spd,
                  vy: Math.sin(angle) * spd,
                  life: 0.6,
                  maxLife: 0.6,
                  size: Math.random() * 5 + 3,
                  color: '#f97316',
                  type: 'spark',
                });
              }
            } else if (p.type === 'water_balloon') {
              spawnWaterSplash(p.x, p.y, 280);
              // Area splash shockwave pushing ducks
              PhysicsEngine.applyExplosionShockwave(
                p.x,
                p.y,
                110,
                240,
                ducksRef.current,
                obstaclesRef.current,
                (duck, hitPoint) => {
                  duck.hp -= 1;
                  if (duck.hp <= 0) {
                    duck.isHit = true;
                    comboCountRef.current += 1;
                    const pts = duck.points * Math.min(comboCountRef.current, 4);
                    onAddScore(pts);
                    spawnDuckHitJuice(duck, hitPoint, pts);
                  }
                },
                () => {}
              );
            }
          }
        }
        // Filter out exploded projectiles
        projectilesRef.current = projectilesRef.current.filter((p) => !p.exploded);

        // 2. Update Ducks
        PhysicsEngine.updateDucks(
          ducksRef.current,
          dt,
          gameTime,
          currentLevel.waterLevel,
          spawnWaterSplash
        );

        // 3. Update Obstacles
        PhysicsEngine.updateObstacles(
          obstaclesRef.current,
          dt,
          currentLevel.waterLevel
        );

        // 4. Collision Detection: Projectiles vs Ducks
        PhysicsEngine.checkDuckCollisions(
          projectilesRef.current,
          ducksRef.current,
          (duck, proj, hitPoint) => {
            duck.hp -= 1;
            duck.scaleX = 1.35;
            duck.scaleY = 0.65;

            if (duck.hp <= 0) {
              duck.isHit = true;
              duck.vx = proj.vx * 0.45 + (Math.random() - 0.5) * 80;
              duck.vy = -Math.abs(proj.vy * 0.45) - 160;
              duck.angularVelocity = (Math.random() - 0.5) * 14;

              comboCountRef.current += 1;
              const multiplier = ringMultiplierActiveRef.current * Math.min(comboCountRef.current, 4);
              const points = duck.points * multiplier;
              const comboNote = multiplier > 1 ? `${multiplier}X MULTIPLIER!` : undefined;

              onAddScore(points, comboNote);
              spawnDuckHitJuice(duck, hitPoint, points);

              const unhitDucks = ducksRef.current.filter((d) => !d.isHit);
              onDuckCleared(duck.id, unhitDucks.length);

              // Cinematic slow-mo on final duck!
              if (unhitDucks.length === 0) {
                slowMoRef.current = { factor: 0.35, timer: 0.9 };
                setTimeout(() => {
                  onAllDucksCleared();
                }, 1000);
              }
            } else {
              // Duck took 1 hit of armor
              sounds.playQuack(1.2);
              floatingTextsRef.current.push({
                id: `txt_${Math.random()}`,
                x: hitPoint.x,
                y: hitPoint.y - 15,
                vy: -50,
                text: 'ARMOR CRACK!',
                color: '#38bdf8',
                life: 0.9,
                maxLife: 0.9,
                scale: 1,
              });
            }
          }
        );

        // 5. Collision Detection: Projectiles vs Obstacles
        PhysicsEngine.checkObstacleCollisions(
          projectilesRef.current,
          obstaclesRef.current,
          (obs) => {
            sounds.playWoodHit();
            obs.hp -= 10;
            obs.isStatic = false;
            obs.vx += (Math.random() - 0.5) * 40;
            obs.vy -= 40;

            // Wood splinter particles
            for (let i = 0; i < 5; i++) {
              particlesRef.current.push({
                id: `wood_${Math.random()}`,
                x: obs.x,
                y: obs.y,
                vx: (Math.random() - 0.5) * 120,
                vy: -Math.random() * 100 - 30,
                life: 0.6,
                maxLife: 0.6,
                size: Math.random() * 5 + 3,
                color: '#a16207',
                type: 'wood',
                rotation: Math.random() * Math.PI,
                angularVelocity: (Math.random() - 0.5) * 6,
              });
            }

            // TNT explosion on contact
            if (obs.type === 'tnt') {
              obs.hp = 0;
              PhysicsEngine.applyExplosionShockwave(
                obs.x,
                obs.y,
                160,
                420,
                ducksRef.current,
                obstaclesRef.current,
                (duck, hitPoint) => {
                  duck.hp = 0;
                  duck.isHit = true;
                  comboCountRef.current += 1;
                  const pts = duck.points * Math.min(comboCountRef.current, 4);
                  onAddScore(pts, 'TNT CHAIN!');
                  spawnDuckHitJuice(duck, hitPoint, pts);
                },
                () => {}
              );
            }
          },
          (ring) => {
            // Passed through multiplier ring!
            if (ringMultiplierActiveRef.current === 1) {
              ringMultiplierActiveRef.current = 2;
              sounds.playStarDing(1);
              floatingTextsRef.current.push({
                id: `ring_${Math.random()}`,
                x: ring.x,
                y: ring.y - 25,
                vy: -50,
                text: '2X BONUS RING!',
                color: '#f59e0b',
                life: 1.2,
                maxLife: 1.2,
                scale: 1.1,
              });
            }
          }
        );

        // Clean destroyed obstacles
        obstaclesRef.current = obstaclesRef.current.filter((o) => o.hp > 0);

        // 6. Update Particles
        for (const p of particlesRef.current) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.type === 'water' || p.type === 'feather' || p.type === 'wood') {
            p.vy += 320 * dt; // gravity
          }
          if (p.angularVelocity) {
            p.rotation = (p.rotation || 0) + p.angularVelocity * dt;
          }
        }
        particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

        // 7. Update Floating Text Popups
        for (const t of floatingTextsRef.current) {
          t.y += t.vy * dt;
          t.life -= dt;
        }
        floatingTextsRef.current = floatingTextsRef.current.filter((t) => t.life > 0);

        // 8. Update Water Ripples
        for (const r of ripplesRef.current) {
          r.radius += 35 * dt;
          r.alpha = Math.max(0, 1 - r.radius / r.maxRadius);
        }
        ripplesRef.current = ripplesRef.current.filter((r) => r.alpha > 0);

        // Check out of ammo state in campaign mode
        if (mode === 'campaign') {
          const totalAmmoLeft = Object.values(ammoCounts).reduce((a, b) => a + b, 0);
          const hasInAirProjectiles = projectilesRef.current.some((p) => p.inAir);
          const remainingDucks = ducksRef.current.filter((d) => !d.isHit);

          if (totalAmmoLeft === 0 && !hasInAirProjectiles && remainingDucks.length > 0 && !isDraggingRef.current) {
            onOutOfAmmo();
          }
        }
      }

      // Screen shake calculation
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (screenShakeRef.current.intensity > 0.1) {
        shakeOffsetX = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        shakeOffsetY = (Math.random() - 0.5) * screenShakeRef.current.intensity;
        screenShakeRef.current.intensity *= screenShakeRef.current.decay;
      }

      // RENDER PASS
      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      renderer.clear();
      renderer.drawBackground(currentLevel.waterLevel, gameTime);
      renderer.drawObstacles(obstaclesRef.current);
      renderer.drawRipples(ripplesRef.current);
      renderer.drawWater(currentLevel.waterLevel);
      renderer.drawDucks(ducksRef.current);

      // Trajectory Prediction Guide while aiming
      if (isDraggingRef.current && pullPosRef.current) {
        const fork = slingshotForkRef.current;
        const pull = pullPosRef.current;
        const vx = (fork.x - pull.x) * customPower;
        const vy = (fork.y - pull.y) * customPower;

        const trajectoryDots = PhysicsEngine.simulateTrajectory(
          fork.x,
          fork.y - 15,
          vx,
          vy,
          currentLevel.wind,
          currentLevel.waterLevel,
          obstaclesRef.current
        );
        renderer.drawTrajectory(trajectoryDots);
      }

      // Slingshot rendering
      renderer.drawSlingshotBack(
        slingshotForkRef.current.x,
        slingshotForkRef.current.y,
        pullPosRef.current,
        isDraggingRef.current
      );
      renderer.drawSlingshotFront(
        slingshotForkRef.current.x,
        slingshotForkRef.current.y,
        pullPosRef.current,
        isDraggingRef.current,
        currentAmmoType
      );

      renderer.drawProjectiles(projectilesRef.current);
      renderer.drawParticles(particlesRef.current);
      renderer.drawFloatingTexts(floatingTextsRef.current);
      renderer.drawWindIndicator(currentLevel.wind);

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    currentLevel,
    isPaused,
    mode,
    currentAmmoType,
    ammoCounts,
    customPower,
    onAddScore,
    onDuckCleared,
    onAllDucksCleared,
    onOutOfAmmo,
    spawnWaterSplash,
    spawnDuckHitJuice,
  ]);

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused) return;

    // Check if user has ammo
    if (mode === 'campaign' && (ammoCounts[currentAmmoType] || 0) <= 0) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const fork = slingshotForkRef.current;
    const distToFork = Math.hypot(clickX - fork.x, clickY - fork.y);

    // If tap/click is within interactive radius of slingshot
    if (distToFork < 85) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: clickX, y: clickY };
      pullPosRef.current = { x: clickX, y: clickY };
      sounds.playStretch(0.2);
    } else {
      // If clicking elsewhere while a projectile is in air, trigger special ability!
      triggerProjectileAbility();
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    const fork = slingshotForkRef.current;
    let dx = currentX - fork.x;
    let dy = currentY - fork.y;

    // Slingshots can only be pulled backward / downwards relative to target
    // Clamp pull vector to MAX_PULL_DISTANCE
    const pullDist = Math.hypot(dx, dy);
    if (pullDist > MAX_PULL_DISTANCE) {
      dx = (dx / pullDist) * MAX_PULL_DISTANCE;
      dy = (dy / pullDist) * MAX_PULL_DISTANCE;
    }

    pullPosRef.current = { x: fork.x + dx, y: fork.y + dy };

    // Rubber stretch tension sound
    if (Math.random() < 0.15) {
      sounds.playStretch(pullDist / MAX_PULL_DISTANCE);
    }
  };

  // Pointer Up / Launch
  const handlePointerUp = () => {
    if (!isDraggingRef.current || !pullPosRef.current) {
      isDraggingRef.current = false;
      pullPosRef.current = null;
      return;
    }

    const fork = slingshotForkRef.current;
    const pull = pullPosRef.current;
    const dx = fork.x - pull.x;
    const dy = fork.y - pull.y;
    const pullDist = Math.hypot(dx, dy);

    // Only launch if pulled with minimum intent
    if (pullDist > 16) {
      sounds.playRelease();

      const vx = dx * customPower;
      const vy = dy * customPower;

      // Create new projectile
      let radius = 13;
      let mass = 1;
      let bounciness = 0.65;
      let color = '#e11d48';
      let accentColor = '#fda4af';

      if (currentAmmoType === 'water_balloon') {
        radius = 15;
        mass = 1.2;
        bounciness = 0.4;
        color = '#06b6d4';
        accentColor = '#cffafe';
      } else if (currentAmmoType === 'splitter') {
        radius = 11;
        mass = 0.8;
        bounciness = 0.55;
        color = '#eab308';
        accentColor = '#fef08a';
      } else if (currentAmmoType === 'bomb') {
        radius = 14;
        mass = 1.5;
        bounciness = 0.3;
        color = '#1e293b';
        accentColor = '#64748b';
      }

      projectilesRef.current.push({
        id: `proj_${Date.now()}`,
        type: currentAmmoType,
        x: fork.x,
        y: fork.y - 15,
        vx,
        vy,
        radius,
        mass,
        bounciness,
        color,
        accentColor,
        rotation: 0,
        inAir: true,
        inWater: false,
        canSplit: currentAmmoType === 'splitter',
        hasSplit: false,
        fuseTimer: currentAmmoType === 'bomb' ? 2.6 : undefined,
        trail: [],
      });

      activeShotsFiredRef.current += 1;
      onConsumeAmmo(currentAmmoType);
      ringMultiplierActiveRef.current = 1;
    }

    isDraggingRef.current = false;
    pullPosRef.current = null;
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={1050}
        height={540}
        className="game-canvas max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-slate-800"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};
