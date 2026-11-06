import { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: '1. Pond Primer',
    subtitle: 'Learn the slingshot trajectory and hit 3 calm ducks',
    waterLevel: 440,
    wind: 0,
    ducks: [
      { type: 'classic', x: 580, y: 440 },
      { type: 'classic', x: 720, y: 440 },
      { type: 'classic', x: 860, y: 440 },
    ],
    obstacles: [],
    ammo: [
      { type: 'standard', count: 3 },
      { type: 'water_balloon', count: 1 },
    ],
    targetScore: {
      oneStar: 300,
      twoStar: 500,
      threeStar: 750,
    },
  },
  {
    id: 2,
    title: '2. Rippling Creek',
    subtitle: 'Hit moving ducks and the Captain perched on a wooden log',
    waterLevel: 440,
    wind: 1.5,
    ducks: [
      { type: 'classic', x: 560, y: 440, patrolMinX: 520, patrolMaxX: 640, speed: 40 },
      { type: 'captain', x: 740, y: 410 }, // perched on raft
      { type: 'classic', x: 900, y: 440, patrolMinX: 840, patrolMaxX: 960, speed: 50 },
    ],
    obstacles: [
      { type: 'plank', x: 740, y: 435, width: 110, height: 18, isStatic: false, hp: 40 },
    ],
    ammo: [
      { type: 'standard', count: 3 },
      { type: 'water_balloon', count: 1 },
    ],
    targetScore: {
      oneStar: 450,
      twoStar: 700,
      threeStar: 1000,
    },
  },
  {
    id: 3,
    title: '3. Carnival Shelf',
    subtitle: 'Topple the wooden struts to drop the ducks into the pond',
    waterLevel: 440,
    wind: -1,
    ducks: [
      { type: 'classic', x: 620, y: 440 },
      { type: 'captain', x: 760, y: 350 },
      { type: 'classic', x: 890, y: 350 },
    ],
    obstacles: [
      { type: 'crate', x: 760, y: 410, width: 44, height: 44, isStatic: false, hp: 30 },
      { type: 'crate', x: 890, y: 410, width: 44, height: 44, isStatic: false, hp: 30 },
      { type: 'plank', x: 825, y: 380, width: 180, height: 14, isStatic: false, hp: 25 },
    ],
    ammo: [
      { type: 'standard', count: 2 },
      { type: 'splitter', count: 2 },
    ],
    targetScore: {
      oneStar: 500,
      twoStar: 800,
      threeStar: 1100,
    },
  },
  {
    id: 4,
    title: "4. Pirate's Cove",
    subtitle: 'Ignite the TNT barrel to blast pirate barricades',
    waterLevel: 440,
    wind: 2,
    ducks: [
      { type: 'captain', x: 680, y: 440 },
      { type: 'captain', x: 880, y: 340 },
      { type: 'golden', x: 920, y: 440 },
    ],
    obstacles: [
      { type: 'crate', x: 800, y: 410, width: 44, height: 44, isStatic: false, hp: 30 },
      { type: 'tnt', x: 800, y: 360, width: 42, height: 42, isStatic: false, hp: 10 },
      { type: 'plank', x: 880, y: 380, width: 120, height: 14, isStatic: false, hp: 25 },
      { type: 'crate', x: 880, y: 410, width: 44, height: 44, isStatic: false, hp: 30 },
    ],
    ammo: [
      { type: 'standard', count: 2 },
      { type: 'bomb', count: 1 },
      { type: 'water_balloon', count: 1 },
    ],
    targetScore: {
      oneStar: 1200,
      twoStar: 1800,
      threeStar: 2400,
    },
  },
  {
    id: 5,
    title: '5. Fast Divers Lagoon',
    subtitle: 'Nimble diver ducks and floating target multiplier rings',
    waterLevel: 440,
    wind: 0,
    ducks: [
      { type: 'diver', x: 600, y: 440, patrolMinX: 530, patrolMaxX: 680, speed: 75 },
      { type: 'diver', x: 780, y: 440, patrolMinX: 710, patrolMaxX: 860, speed: 90 },
      { type: 'golden', x: 920, y: 440, patrolMinX: 880, patrolMaxX: 960, speed: 45 },
    ],
    obstacles: [
      { type: 'target_ring', x: 670, y: 260, width: 60, height: 60, isStatic: true, hp: 999 },
      { type: 'target_ring', x: 840, y: 240, width: 60, height: 60, isStatic: true, hp: 999 },
    ],
    ammo: [
      { type: 'standard', count: 2 },
      { type: 'splitter', count: 2 },
      { type: 'water_balloon', count: 1 },
    ],
    targetScore: {
      oneStar: 1200,
      twoStar: 2000,
      threeStar: 2800,
    },
  },
  {
    id: 6,
    title: '6. The Tower of Quacks',
    subtitle: 'Demolish the 3-story crate skyscraper guarding the flock',
    waterLevel: 440,
    wind: -2,
    ducks: [
      { type: 'classic', x: 640, y: 440 },
      { type: 'captain', x: 780, y: 310 },
      { type: 'captain', x: 780, y: 220 },
      { type: 'golden', x: 780, y: 140 },
    ],
    obstacles: [
      // Base crates
      { type: 'crate', x: 750, y: 410, width: 44, height: 44, isStatic: false, hp: 35 },
      { type: 'crate', x: 810, y: 410, width: 44, height: 44, isStatic: false, hp: 35 },
      // Floor 1
      { type: 'plank', x: 780, y: 380, width: 120, height: 14, isStatic: false, hp: 25 },
      { type: 'crate', x: 780, y: 345, width: 44, height: 44, isStatic: false, hp: 30 },
      // Floor 2
      { type: 'plank', x: 780, y: 315, width: 100, height: 14, isStatic: false, hp: 25 },
      { type: 'crate', x: 780, y: 280, width: 40, height: 40, isStatic: false, hp: 30 },
      // Floor 3
      { type: 'plank', x: 780, y: 250, width: 80, height: 14, isStatic: false, hp: 25 },
      { type: 'crate', x: 780, y: 215, width: 36, height: 36, isStatic: false, hp: 25 },
      { type: 'plank', x: 780, y: 190, width: 60, height: 12, isStatic: false, hp: 20 },
    ],
    ammo: [
      { type: 'bomb', count: 1 },
      { type: 'standard', count: 2 },
      { type: 'water_balloon', count: 2 },
    ],
    targetScore: {
      oneStar: 1500,
      twoStar: 2400,
      threeStar: 3200,
    },
  },
  {
    id: 7,
    title: '7. Windy Bay Patrol',
    subtitle: 'Compensate for strong winds and moving air currents',
    waterLevel: 440,
    wind: 5.5,
    ducks: [
      { type: 'diver', x: 580, y: 440, patrolMinX: 520, patrolMaxX: 660, speed: 60 },
      { type: 'glider', x: 720, y: 220, patrolMinX: 680, patrolMaxX: 840, speed: 45 },
      { type: 'captain', x: 880, y: 440 },
      { type: 'golden', x: 940, y: 440 },
    ],
    obstacles: [
      { type: 'target_ring', x: 620, y: 280, width: 60, height: 60, isStatic: true, hp: 999 },
      { type: 'crate', x: 880, y: 410, width: 44, height: 44, isStatic: false, hp: 35 },
      { type: 'tnt', x: 930, y: 410, width: 42, height: 42, isStatic: false, hp: 10 },
    ],
    ammo: [
      { type: 'standard', count: 3 },
      { type: 'splitter', count: 2 },
      { type: 'bomb', count: 1 },
    ],
    targetScore: {
      oneStar: 1600,
      twoStar: 2500,
      threeStar: 3400,
    },
  },
  {
    id: 8,
    title: '8. Balloon Flotilla',
    subtitle: 'Pop floating glider ducks drifting gracefully through the sky',
    waterLevel: 440,
    wind: -3,
    ducks: [
      { type: 'glider', x: 600, y: 180, patrolMinX: 520, patrolMaxX: 700, speed: 40 },
      { type: 'glider', x: 760, y: 260, patrolMinX: 700, patrolMaxX: 860, speed: 50 },
      { type: 'glider', x: 890, y: 160, patrolMinX: 820, patrolMaxX: 960, speed: 35 },
      { type: 'classic', x: 700, y: 440 },
      { type: 'golden', x: 860, y: 440 },
    ],
    obstacles: [
      { type: 'plank', x: 780, y: 435, width: 120, height: 16, isStatic: false, hp: 30 },
    ],
    ammo: [
      { type: 'splitter', count: 3 },
      { type: 'standard', count: 2 },
    ],
    targetScore: {
      oneStar: 1800,
      twoStar: 2800,
      threeStar: 3800,
    },
  },
  {
    id: 9,
    title: '9. Carnival Dominoes',
    subtitle: 'Trigger the chain reaction across multiple elevated stages',
    waterLevel: 440,
    wind: 1,
    ducks: [
      { type: 'classic', x: 570, y: 440 },
      { type: 'captain', x: 690, y: 350 },
      { type: 'diver', x: 820, y: 440, patrolMinX: 770, patrolMaxX: 890, speed: 70 },
      { type: 'golden', x: 930, y: 270 },
    ],
    obstacles: [
      // Stage 1
      { type: 'crate', x: 690, y: 410, width: 44, height: 44, isStatic: false, hp: 30 },
      { type: 'plank', x: 690, y: 380, width: 90, height: 14, isStatic: false, hp: 25 },
      // Stage 2
      { type: 'tnt', x: 760, y: 410, width: 42, height: 42, isStatic: false, hp: 10 },
      // Stage 3
      { type: 'crate', x: 930, y: 410, width: 44, height: 44, isStatic: false, hp: 35 },
      { type: 'crate', x: 930, y: 360, width: 44, height: 44, isStatic: false, hp: 35 },
      { type: 'plank', x: 930, y: 330, width: 100, height: 14, isStatic: false, hp: 25 },
      { type: 'crate', x: 930, y: 295, width: 36, height: 36, isStatic: false, hp: 25 },
    ],
    ammo: [
      { type: 'bomb', count: 2 },
      { type: 'water_balloon', count: 2 },
      { type: 'standard', count: 2 },
    ],
    targetScore: {
      oneStar: 2000,
      twoStar: 3200,
      threeStar: 4400,
    },
  },
  {
    id: 10,
    title: '10. The Mega Quacken',
    subtitle: 'Defeat the colossal boss duck and his personal pirate fleet',
    waterLevel: 440,
    wind: 2.5,
    ducks: [
      { type: 'mega', x: 880, y: 420 }, // Boss duck!
      { type: 'captain', x: 640, y: 440, patrolMinX: 580, patrolMaxX: 700, speed: 50 },
      { type: 'diver', x: 750, y: 440, patrolMinX: 700, patrolMaxX: 810, speed: 65 },
      { type: 'glider', x: 820, y: 180, patrolMinX: 760, patrolMaxX: 920, speed: 40 },
    ],
    obstacles: [
      { type: 'crate', x: 800, y: 410, width: 44, height: 44, isStatic: false, hp: 40 },
      { type: 'plank', x: 800, y: 380, width: 80, height: 16, isStatic: false, hp: 30 },
      { type: 'tnt', x: 800, y: 345, width: 42, height: 42, isStatic: false, hp: 10 },
      { type: 'target_ring', x: 720, y: 220, width: 60, height: 60, isStatic: true, hp: 999 },
    ],
    ammo: [
      { type: 'bomb', count: 2 },
      { type: 'splitter', count: 2 },
      { type: 'water_balloon', count: 2 },
      { type: 'standard', count: 2 },
    ],
    targetScore: {
      oneStar: 2800,
      twoStar: 4500,
      threeStar: 6000,
    },
  },
];
