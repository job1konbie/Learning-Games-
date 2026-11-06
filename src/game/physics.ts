import {
  Duck,
  Projectile,
  Obstacle,
  Particle,
  FloatingText,
  WaterRipple,
  DuckType,
  ProjectileType,
} from './types';
import { sounds } from './audio';

export const GRAVITY = 720; // px/s^2
export const MAX_PULL_DISTANCE = 110;
export const LAUNCH_POWER = 6.4;

export class PhysicsEngine {
  public static simulateTrajectory(
    startX: number,
    startY: number,
    vx: number,
    vy: number,
    wind: number,
    waterLevel: number,
    obstacles: Obstacle[],
    steps = 35,
    dt = 0.035
  ): { x: number; y: number }[] {
    const dots: { x: number; y: number }[] = [];
    let curX = startX;
    let curY = startY;
    let curVx = vx;
    let curVy = vy;

    for (let i = 0; i < steps; i++) {
      dots.push({ x: curX, y: curY });

      // Apply gravity & wind
      curVy += GRAVITY * dt;
      curVx += wind * 14 * dt;

      // Air resistance
      curVx *= 0.998;
      curVy *= 0.998;

      curX += curVx * dt;
      curY += curVy * dt;

      // Stop trajectory if hits water
      if (curY >= waterLevel + 10) {
        dots.push({ x: curX, y: waterLevel });
        break;
      }

      // Stop if collides with static obstacle
      let hit = false;
      for (const obs of obstacles) {
        if (
          curX >= obs.x - obs.width / 2 &&
          curX <= obs.x + obs.width / 2 &&
          curY >= obs.y - obs.height / 2 &&
          curY <= obs.y + obs.height / 2
        ) {
          dots.push({ x: curX, y: curY });
          hit = true;
          break;
        }
      }
      if (hit) break;
    }

    return dots;
  }

  /**
   * Update active projectiles
   */
  public static updateProjectiles(
    projectiles: Projectile[],
    dt: number,
    wind: number,
    waterLevel: number,
    canvasWidth: number,
    canvasHeight: number,
    onWaterSplash: (x: number, y: number, speed: number) => void
  ): Projectile[] {
    const alive: Projectile[] = [];

    for (const p of projectiles) {
      // Trail recording
      if (p.inAir) {
        p.trail.push({ x: p.x, y: p.y, alpha: 0.6 });
        if (p.trail.length > 8) p.trail.shift();
      }
      // Decay trail
      for (const t of p.trail) {
        t.alpha *= 0.88;
      }

      if (p.y >= waterLevel) {
        // Just entered water
        if (!p.inWater) {
          p.inWater = true;
          const entrySpeed = Math.hypot(p.vx, p.vy);
          onWaterSplash(p.x, waterLevel, entrySpeed);
        }

        // Water physics: high drag and upward buoyancy
        p.vx *= 0.92;
        p.vy *= 0.88;
        p.vy -= 220 * dt; // slight buoyancy push
        p.y += p.vy * dt;
        p.x += p.vx * dt;

        // Rotation slowly stops
        p.rotation += p.vx * 0.05 * dt;

        // Projectile sinks/settles
        if (Math.hypot(p.vx, p.vy) < 15 && p.y > waterLevel + 25) {
          p.inAir = false;
        }
      } else {
        // Normal air flight
        p.vy += GRAVITY * dt;
        p.vx += wind * 14 * dt;

        p.vx *= 0.996;
        p.vy *= 0.996;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.rotation += (p.vx * 0.08 + 2) * dt;
      }

      // Bomb fuse timer
      if (p.type === 'bomb') {
        p.fuseTimer = (p.fuseTimer || 2.5) - dt;
        if (p.fuseTimer <= 0) {
          p.exploded = true;
        }
      }

      // Boundary cleanup
      const isOffscreen =
        p.x < -100 ||
        p.x > canvasWidth + 150 ||
        p.y > canvasHeight + 100 ||
        (p.y < -300 && p.vy < 0);

      if (!isOffscreen && p.inAir && !p.exploded) {
        alive.push(p);
      }
    }

    return alive;
  }

  /**
   * Update ducks (swimming, bobbing in waves, or tumbling when hit)
   */
  public static updateDucks(
    ducks: Duck[],
    dt: number,
    time: number,
    waterLevel: number,
    onWaterSplash: (x: number, y: number, speed: number) => void
  ) {
    for (const duck of ducks) {
      if (duck.isHit) {
        // Hit physics: tumble into the air / water
        duck.vy += GRAVITY * 0.9 * dt;
        duck.x += duck.vx * dt;
        duck.y += duck.vy * dt;
        duck.rotation += duck.angularVelocity * dt;

        if (duck.y >= waterLevel && !duck.inWater) {
          duck.inWater = true;
          onWaterSplash(duck.x, waterLevel, Math.hypot(duck.vx, duck.vy));
        }

        if (duck.inWater) {
          duck.vx *= 0.94;
          duck.vy *= 0.88;
          duck.vy -= 180 * dt; // buoyancy
        }

        // Squash and stretch decay
        duck.scaleX += (1 - duck.scaleX) * 0.15;
        duck.scaleY += (1 - duck.scaleY) * 0.15;
      } else {
        // Normal swimming behavior
        if (duck.patrolMinX !== undefined && duck.patrolMaxX !== undefined) {
          duck.x += duck.vx * dt;
          if (duck.x <= duck.patrolMinX) {
            duck.vx = Math.abs(duck.vx);
            duck.facing = 1;
          } else if (duck.x >= duck.patrolMaxX) {
            duck.vx = -Math.abs(duck.vx);
            duck.facing = -1;
          }
        }

        // Water surface bobbing & gentle wave tilting
        if (duck.type !== 'glider') {
          const wave = Math.sin(time * duck.bobSpeed + duck.bobOffset) * duck.bobAmplitude;
          duck.y = duck.baseY + wave;
          duck.rotation = Math.cos(time * duck.bobSpeed + duck.bobOffset) * 0.08;
        } else {
          // Glider duck drifts gently with balloon sway
          duck.y = duck.baseY + Math.sin(time * 2 + duck.bobOffset) * 12;
          duck.rotation = Math.sin(time * 2.5) * 0.06;
        }
      }
    }
  }

  /**
   * Check projectile collisions with Ducks
   */
  public static checkDuckCollisions(
    projectiles: Projectile[],
    ducks: Duck[],
    onHitDuck: (duck: Duck, proj: Projectile, hitPoint: { x: number; y: number }) => void
  ) {
    for (const p of projectiles) {
      if (!p.inAir || p.exploded) continue;

      for (const duck of ducks) {
        if (duck.isHit) continue;

        // Collision radius
        const dist = Math.hypot(p.x - duck.x, p.y - (duck.y - duck.radius * 0.2));
        const collideDist = p.radius + duck.radius * 0.85;

        if (dist <= collideDist) {
          onHitDuck(duck, p, { x: (p.x + duck.x) / 2, y: (p.y + duck.y) / 2 });

          // Projectile bounce or detonation
          if (p.type === 'bomb') {
            p.exploded = true;
          } else if (p.type === 'water_balloon') {
            p.exploded = true;
          } else {
            // Deflect projectile
            const nx = (p.x - duck.x) / dist;
            const ny = (p.y - duck.y) / dist;
            p.vx = (nx * 120 + p.vx * 0.3) * p.bounciness;
            p.vy = (ny * 120 + p.vy * 0.3) * p.bounciness;
          }
          break;
        }
      }
    }
  }

  /**
   * Check projectile collisions with Obstacles
   */
  public static checkObstacleCollisions(
    projectiles: Projectile[],
    obstacles: Obstacle[],
    onHitObstacle: (obs: Obstacle, proj: Projectile) => void,
    onTriggerRing: (obs: Obstacle, proj: Projectile) => void
  ) {
    for (const p of projectiles) {
      if (!p.inAir || p.exploded) continue;

      for (const obs of obstacles) {
        if (obs.type === 'target_ring') {
          // Ring pass-through test
          const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
          if (dist < obs.width / 2) {
            onTriggerRing(obs, p);
          }
          continue;
        }

        // AABB check
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;

        const closestX = Math.max(obs.x - halfW, Math.min(p.x, obs.x + halfW));
        const closestY = Math.max(obs.y - halfH, Math.min(p.y, obs.y + halfH));

        const dist = Math.hypot(p.x - closestX, p.y - closestY);

        if (dist < p.radius) {
          onHitObstacle(obs, p);

          if (p.type === 'bomb') {
            p.exploded = true;
          } else if (p.type === 'water_balloon') {
            p.exploded = true;
          } else {
            // Bounce
            if (Math.abs(p.x - closestX) > Math.abs(p.y - closestY)) {
              p.vx = -p.vx * p.bounciness;
            } else {
              p.vy = -p.vy * p.bounciness;
            }
          }
          break;
        }
      }
    }
  }

  /**
   * Update moving/falling obstacles (toppled crates, logs)
   */
  public static updateObstacles(
    obstacles: Obstacle[],
    dt: number,
    waterLevel: number
  ) {
    for (const obs of obstacles) {
      if (obs.isStatic) continue;

      // Gravity if not resting in water
      if (obs.y < waterLevel - obs.height / 2) {
        obs.vy += GRAVITY * 0.8 * dt;
      } else {
        // Buoyancy in water
        obs.inWater = true;
        obs.vy *= 0.9;
        obs.vx *= 0.92;
        obs.angularVelocity *= 0.9;

        // Gentle float at water line
        const targetY = waterLevel - obs.height * 0.3;
        obs.vy += (targetY - obs.y) * 8 * dt;
      }

      obs.x += obs.vx * dt;
      obs.y += obs.vy * dt;
      obs.rotation += obs.angularVelocity * dt;
    }
  }

  /**
   * Split projectile into 3 child pebbles
   */
  public static splitProjectile(parent: Projectile): Projectile[] {
    sounds.playSplit();
    const children: Projectile[] = [];
    const spreadAngles = [-0.25, 0, 0.25]; // Radians

    const currentSpeed = Math.hypot(parent.vx, parent.vy);
    const baseAngle = Math.atan2(parent.vy, parent.vx);

    for (let i = 0; i < 3; i++) {
      const angle = baseAngle + spreadAngles[i];
      const speed = currentSpeed * (i === 1 ? 1.05 : 0.95);

      children.push({
        id: `${parent.id}_split_${i}_${Date.now()}`,
        type: 'splitter',
        x: parent.x,
        y: parent.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 8,
        mass: 0.6,
        bounciness: 0.55,
        color: '#eab308',
        accentColor: '#fef08a',
        rotation: parent.rotation,
        inAir: true,
        inWater: false,
        canSplit: false,
        hasSplit: true,
        trail: [],
      });
    }

    return children;
  }

  /**
   * Trigger explosive shockwave (TNT barrel or Bomb projectile)
   */
  public static applyExplosionShockwave(
    epicenterX: number,
    epicenterY: number,
    radius: number,
    force: number,
    ducks: Duck[],
    obstacles: Obstacle[],
    onHitDuck: (duck: Duck, hitPoint: { x: number; y: number }) => void,
    onHitObstacle: (obs: Obstacle) => void
  ) {
    sounds.playExplosion();

    // Damage/blast ducks
    for (const duck of ducks) {
      if (duck.isHit) continue;
      const dist = Math.hypot(duck.x - epicenterX, duck.y - epicenterY);
      if (dist < radius) {
        const angle = Math.atan2(duck.y - epicenterY, duck.x - epicenterX);
        const impulse = (1 - dist / radius) * force;
        duck.vx += Math.cos(angle) * impulse;
        duck.vy += Math.sin(angle) * impulse - 180;
        duck.angularVelocity = (Math.random() - 0.5) * 12;
        onHitDuck(duck, { x: duck.x, y: duck.y });
      }
    }

    // Damage/topple obstacles
    for (const obs of obstacles) {
      if (obs.type === 'target_ring') continue;
      const dist = Math.hypot(obs.x - epicenterX, obs.y - epicenterY);
      if (dist < radius) {
        const angle = Math.atan2(obs.y - epicenterY, obs.x - epicenterX);
        const impulse = (1 - dist / radius) * force * 0.7;
        obs.isStatic = false;
        obs.vx += Math.cos(angle) * impulse;
        obs.vy += Math.sin(angle) * impulse - 140;
        obs.angularVelocity += (Math.random() - 0.5) * 8;
        obs.hp -= 25;
        onHitObstacle(obs);
      }
    }
  }
}
