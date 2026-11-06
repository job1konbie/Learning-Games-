export type DuckType = 'classic' | 'captain' | 'diver' | 'golden' | 'mega' | 'glider';

export interface Duck {
  id: string;
  type: DuckType;
  x: number;
  y: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  points: number;
  bobOffset: number;
  bobSpeed: number;
  bobAmplitude: number;
  facing: 1 | -1;
  patrolMinX?: number;
  patrolMaxX?: number;
  isHit: boolean;
  hitTime?: number;
  rotation: number;
  angularVelocity: number;
  inWater: boolean;
  scaleX: number;
  scaleY: number;
  balloonHp?: number; // For glider ducks
}

export type ProjectileType = 'standard' | 'water_balloon' | 'splitter' | 'bomb';

export interface ProjectileConfig {
  type: ProjectileType;
  name: string;
  description: string;
  radius: number;
  mass: number;
  color: string;
  accentColor: string;
  bounciness: number;
  specialAbility?: string;
}

export interface Projectile {
  id: string;
  type: ProjectileType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  bounciness: number;
  color: string;
  accentColor: string;
  rotation: number;
  inAir: boolean;
  inWater: boolean;
  canSplit?: boolean;
  hasSplit?: boolean;
  fuseTimer?: number; // for bomb
  exploded?: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

export type ObstacleType = 'crate' | 'plank' | 'tnt' | 'target_ring';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  vx: number;
  vy: number;
  angularVelocity: number;
  hp: number;
  maxHp: number;
  isStatic: boolean;
  inWater: boolean;
  points: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'water' | 'feather' | 'smoke' | 'spark' | 'wood' | 'ring_sparkle';
  rotation?: number;
  angularVelocity?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface WaterRipple {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  ducks: {
    type: DuckType;
    x: number;
    y: number;
    patrolMinX?: number;
    patrolMaxX?: number;
    speed?: number;
  }[];
  obstacles: {
    type: ObstacleType;
    x: number;
    y: number;
    width: number;
    height: number;
    isStatic?: boolean;
    hp?: number;
  }[];
  ammo: { type: ProjectileType; count: number }[];
  wind: number; // -10 to +10
  waterLevel: number;
  targetScore: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
  };
}

export interface LevelProgress {
  stars: number;
  highScore: number;
  completed: boolean;
}

export type GameMode = 'campaign' | 'arcade' | 'sandbox';
