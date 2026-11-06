import { Duck, Projectile, Obstacle, Particle, FloatingText, WaterRipple, ProjectileType } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private waterTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Draw atmospheric carnival pond backdrop
   */
  public drawBackground(waterLevel: number, time: number) {
    const ctx = this.ctx;
    this.waterTime = time;

    // Sky gradient: rich atmospheric sunset dusk over carnival pond
    const skyGrad = ctx.createLinearGradient(0, 0, 0, waterLevel);
    skyGrad.addColorStop(0, '#0f2038');
    skyGrad.addColorStop(0.5, '#1e3a5f');
    skyGrad.addColorStop(1, '#2c5378');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, waterLevel);

    // Distant carnival tent silhouette & ambient warm lights
    ctx.save();
    ctx.fillStyle = 'rgba(23, 42, 69, 0.6)';
    ctx.beginPath();
    // Carnival tent peaks in background
    ctx.moveTo(0, waterLevel);
    ctx.lineTo(120, waterLevel - 60);
    ctx.lineTo(240, waterLevel);
    ctx.lineTo(380, waterLevel - 110);
    ctx.lineTo(430, waterLevel - 140);
    ctx.lineTo(480, waterLevel - 110);
    ctx.lineTo(620, waterLevel);
    ctx.lineTo(760, waterLevel - 80);
    ctx.lineTo(900, waterLevel);
    ctx.lineTo(1050, waterLevel - 120);
    ctx.lineTo(1200, waterLevel);
    ctx.lineTo(this.width, waterLevel);
    ctx.fill();

    // Festive carnival bunting / pennant flags strung across the sky
    const drawBunting = (yOffset: number, sag: number) => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, yOffset);
      const segments = 12;
      const segWidth = this.width / segments;
      for (let i = 0; i <= segments; i++) {
        const x = i * segWidth;
        const midX = x - segWidth / 2;
        const dip = Math.sin((i / segments) * Math.PI) * sag + 15;
        if (i > 0) {
          ctx.quadraticCurveTo(midX, yOffset + dip, x, yOffset);
        }
      }
      ctx.stroke();

      // Flags
      const flagColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#34d399', '#a855f7'];
      for (let i = 0; i < segments; i++) {
        const x = i * segWidth + segWidth / 2;
        const y = yOffset + Math.sin(((i + 0.5) / segments) * Math.PI) * sag + 12;
        const color = flagColors[i % flagColors.length];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 9, y - 4);
        ctx.lineTo(x + 9, y - 4);
        ctx.lineTo(x, y + 14);
        ctx.closePath();
        ctx.fill();
      }
    };

    drawBunting(50, 20);
    drawBunting(90, 15);
    ctx.restore();

    // Slingshot pier / wooden launch pad on the left
    this.drawSlingshotPier(waterLevel);
  }

  /**
   * Draw the wooden pier structure holding the slingshot
   */
  private drawSlingshotPier(waterLevel: number) {
    const ctx = this.ctx;
    ctx.save();

    // Wooden deck
    const pierX = 0;
    const pierWidth = 240;
    const pierTop = waterLevel - 20;

    // Deck planks
    ctx.fillStyle = '#451a03'; // dark mahogany
    ctx.fillRect(pierX, pierTop, pierWidth, 24);

    ctx.fillStyle = '#78350f'; // wood surface
    ctx.fillRect(pierX, pierTop, pierWidth, 14);

    // Plank gaps
    ctx.strokeStyle = '#291102';
    ctx.lineWidth = 2;
    for (let x = 30; x < pierWidth; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, pierTop);
      ctx.lineTo(x, pierTop + 14);
      ctx.stroke();
    }

    // Wooden pilings / stilts down into water
    const drawPiling = (px: number) => {
      const grad = ctx.createLinearGradient(px, pierTop, px + 22, pierTop);
      grad.addColorStop(0, '#59290a');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#3b1803');
      ctx.fillStyle = grad;
      ctx.fillRect(px, pierTop + 14, 22, this.height - pierTop);

      // Support bolt rivets
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(px + 11, pierTop + 24, 3, 0, Math.PI * 2);
      ctx.arc(px + 11, pierTop + 50, 3, 0, Math.PI * 2);
      ctx.fill();
    };

    drawPiling(40);
    drawPiling(120);
    drawPiling(200);

    ctx.restore();
  }

  /**
   * Draw dynamic water surface with waves and aquatic depth
   */
  public drawWater(waterLevel: number) {
    const ctx = this.ctx;
    ctx.save();

    // Water depth gradient
    const waterGrad = ctx.createLinearGradient(0, waterLevel, 0, this.height);
    waterGrad.addColorStop(0, '#0284c7'); // vibrant cyan blue
    waterGrad.addColorStop(0.3, '#0369a1');
    waterGrad.addColorStop(1, '#082f49'); // deep ocean bottom
    ctx.fillStyle = waterGrad;

    // Wave crest outline
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    ctx.lineTo(0, waterLevel);

    const step = 20;
    for (let x = 0; x <= this.width; x += step) {
      const wave1 = Math.sin(x * 0.015 + this.waterTime * 2.5) * 4;
      const wave2 = Math.sin(x * 0.035 - this.waterTime * 1.8) * 2;
      const y = waterLevel + wave1 + wave2;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(this.width, this.height);
    ctx.closePath();
    ctx.fill();

    // Translucent light foam highlight along water line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2.5;
    for (let x = 0; x <= this.width; x += step) {
      const wave1 = Math.sin(x * 0.015 + this.waterTime * 2.5) * 4;
      const wave2 = Math.sin(x * 0.035 - this.waterTime * 1.8) * 2;
      const y = waterLevel + wave1 + wave2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Water surface sparkles / subtle bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    for (let i = 0; i < 6; i++) {
      const sparkleX = ((i * 190 + this.waterTime * 20) % this.width);
      const sparkleY = waterLevel + 12 + Math.sin(sparkleX * 0.05 + this.waterTime) * 6;
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw water ripples expanding outward
   */
  public drawRipples(ripples: WaterRipple[]) {
    const ctx = this.ctx;
    ctx.save();
    for (const r of ripples) {
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.7})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Draw the Slingshot fork and back band
   */
  public drawSlingshotBack(
    forkX: number,
    forkY: number,
    pullPos: { x: number; y: number } | null,
    isAiming: boolean
  ) {
    const ctx = this.ctx;
    ctx.save();

    const leftTipX = forkX - 22;
    const leftTipY = forkY - 45;
    const rightTipX = forkX + 22;
    const rightTipY = forkY - 45;

    // Back band (from left tip to pull position)
    ctx.strokeStyle = '#854d0e'; // dark leather rubber
    ctx.lineCap = 'round';

    if (isAiming && pullPos) {
      const tension = Math.hypot(forkX - pullPos.x, forkY - pullPos.y);
      const bandWidth = Math.max(3, 7 - tension * 0.025);
      ctx.lineWidth = bandWidth;

      ctx.beginPath();
      ctx.moveTo(leftTipX, leftTipY);
      ctx.lineTo(pullPos.x - 6, pullPos.y);
      ctx.stroke();
    } else {
      // Idle resting band
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(leftTipX, leftTipY);
      ctx.quadraticCurveTo(forkX, forkY - 20, rightTipX, rightTipY);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw the Slingshot front fork, front band, leather pouch, and loaded projectile
   */
  public drawSlingshotFront(
    forkX: number,
    forkY: number,
    pullPos: { x: number; y: number } | null,
    isAiming: boolean,
    currentProjectileType: ProjectileType
  ) {
    const ctx = this.ctx;
    ctx.save();

    const leftTipX = forkX - 22;
    const leftTipY = forkY - 45;
    const rightTipX = forkX + 22;
    const rightTipY = forkY - 45;

    // Draw front band (from right tip to pull position)
    if (isAiming && pullPos) {
      ctx.strokeStyle = '#a16207'; // lighter rubber front highlight
      ctx.lineCap = 'round';
      const tension = Math.hypot(forkX - pullPos.x, forkY - pullPos.y);
      const bandWidth = Math.max(3, 7 - tension * 0.025);
      ctx.lineWidth = bandWidth;

      ctx.beginPath();
      ctx.moveTo(rightTipX, rightTipY);
      ctx.lineTo(pullPos.x + 6, pullPos.y);
      ctx.stroke();

      // Leather Pouch holding projectile
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.ellipse(pullPos.x, pullPos.y, 14, 8, Math.atan2(pullPos.y - forkY, pullPos.x - forkX), 0, Math.PI * 2);
      ctx.fill();

      // Draw loaded projectile in pouch
      this.drawLoadedProjectile(pullPos.x, pullPos.y, currentProjectileType);
    }

    // Wooden Slingshot Y-Fork
    const woodGrad = ctx.createLinearGradient(forkX - 25, forkY - 50, forkX + 25, forkY + 50);
    woodGrad.addColorStop(0, '#92400e');
    woodGrad.addColorStop(0.5, '#b45309');
    woodGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = woodGrad;
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;

    // Slingshot handle and fork arms
    ctx.beginPath();
    // Base handle
    ctx.moveTo(forkX - 10, forkY + 60);
    ctx.lineTo(forkX + 10, forkY + 60);
    ctx.lineTo(forkX + 9, forkY + 5);
    // Right arm
    ctx.lineTo(rightTipX + 7, rightTipY);
    ctx.arc(rightTipX, rightTipY, 7, 0, Math.PI, true);
    ctx.lineTo(forkX + 4, forkY - 12);
    // V notch
    ctx.lineTo(forkX - 4, forkY - 12);
    // Left arm
    ctx.lineTo(leftTipX, leftTipY + 7);
    ctx.arc(leftTipX, leftTipY, 7, Math.PI, 0, true);
    ctx.lineTo(forkX - 9, forkY + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Metallic reinforcement rings at arm tips
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(leftTipX, leftTipY, 5, 0, Math.PI * 2);
    ctx.arc(rightTipX, rightTipY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // If not aiming, show projectile sitting ready in the slingshot notch
    if (!isAiming) {
      this.drawLoadedProjectile(forkX, forkY - 26, currentProjectileType);
    }

    ctx.restore();
  }

  /**
   * Draw the loaded projectile inside the pouch
   */
  private drawLoadedProjectile(x: number, y: number, type: ProjectileType) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    if (type === 'standard') {
      // Classic red & white carnival sphere
      const rad = 13;
      const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, rad);
      grad.addColorStop(0, '#fda4af');
      grad.addColorStop(0.4, '#e11d48');
      grad.addColorStop(1, '#881337');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();

      // White star / carnival stripe
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'water_balloon') {
      // Translucent wobbling aqua balloon
      const rad = 14;
      const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, rad);
      grad.addColorStop(0, '#a5f3fc');
      grad.addColorStop(0.6, '#06b6d4');
      grad.addColorStop(1, '#0e7490');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, rad, rad * 1.15, 0, 0, Math.PI * 2);
      ctx.fill();
      // Balloon knot
      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.moveTo(-3, rad * 1.1);
      ctx.lineTo(3, rad * 1.1);
      ctx.lineTo(0, rad * 1.35);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'splitter') {
      // Triple cluster of bouncy pebbles
      const miniRad = 7;
      const offsets = [
        { dx: 0, dy: -6 },
        { dx: -6, dy: 5 },
        { dx: 6, dy: 5 },
      ];
      for (const off of offsets) {
        const grad = ctx.createRadialGradient(off.dx - 2, off.dy - 2, 1, off.dx, off.dy, miniRad);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, '#eab308');
        grad.addColorStop(1, '#854d0e');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(off.dx, off.dy, miniRad, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type === 'bomb') {
      // Iron bomb with spark fuse
      const rad = 14;
      const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, rad);
      grad.addColorStop(0, '#64748b');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();

      // Cap & fuse
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -rad - 4, 8, 4);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -rad - 4);
      ctx.quadraticCurveTo(6, -rad - 12, 12, -rad - 10);
      ctx.stroke();

      // Spark
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(12, -rad - 10, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw Trajectory Guide dots forecasting the flight path
   */
  public drawTrajectory(dots: { x: number; y: number }[]) {
    const ctx = this.ctx;
    ctx.save();

    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i];
      const progress = i / dots.length;
      const radius = Math.max(1.8, 4.5 * (1 - progress * 0.6));
      const alpha = 0.85 * (1 - progress * 0.7);

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Impact ring on the very last dot
      if (i === dots.length - 1 && dots.length > 5) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Inner crosshair
        ctx.beginPath();
        ctx.moveTo(dot.x - 14, dot.y);
        ctx.lineTo(dot.x + 14, dot.y);
        ctx.moveTo(dot.x, dot.y - 14);
        ctx.lineTo(dot.x, dot.y + 14);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Draw in-flight projectiles with motion blur trail
   */
  public drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;

    for (const p of projectiles) {
      ctx.save();

      // Motion trail
      for (const t of p.trail) {
        ctx.fillStyle = `${p.color}${Math.floor(t.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.55 * t.alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.type === 'standard') {
        const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, p.radius);
        grad.addColorStop(0, '#fda4af');
        grad.addColorStop(0.5, '#e11d48');
        grad.addColorStop(1, '#881337');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // White carnival star ring
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'water_balloon') {
        const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, p.radius);
        grad.addColorStop(0, '#cffafe');
        grad.addColorStop(0.6, '#06b6d4');
        grad.addColorStop(1, '#0e7490');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.radius * 1.1, p.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'splitter') {
        const grad = ctx.createRadialGradient(-2, -2, 1, 0, 0, p.radius);
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, '#eab308');
        grad.addColorStop(1, '#854d0e');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'bomb') {
        const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, p.radius);
        grad.addColorStop(0, '#64748b');
        grad.addColorStop(0.5, '#1e293b');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing red danger indicator
        const pulse = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Draw Rubber Duckies with rich vector details
   */
  public drawDucks(ducks: Duck[]) {
    const ctx = this.ctx;

    for (const duck of ducks) {
      ctx.save();
      ctx.translate(duck.x, duck.y);
      ctx.scale(duck.scaleX * duck.facing, duck.scaleY);
      ctx.rotate(duck.rotation);

      // If glider duck, draw helium balloon above it
      if (duck.type === 'glider' && (!duck.balloonHp || duck.balloonHp > 0)) {
        this.drawBalloon(0, -duck.radius - 55);
      }

      // Base body color definitions based on duck type
      let bodyGrad: CanvasGradient;
      let billColor = '#ea580c'; // deep orange
      let eyeWhite = '#ffffff';

      if (duck.type === 'golden') {
        bodyGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, duck.radius);
        bodyGrad.addColorStop(0, '#fffbeb');
        bodyGrad.addColorStop(0.3, '#fef08a');
        bodyGrad.addColorStop(0.7, '#f59e0b');
        bodyGrad.addColorStop(1, '#b45309');
        billColor = '#d97706';
      } else if (duck.type === 'mega') {
        bodyGrad = ctx.createRadialGradient(-10, -10, 4, 0, 0, duck.radius);
        bodyGrad.addColorStop(0, '#fef9c3');
        bodyGrad.addColorStop(0.4, '#fde047');
        bodyGrad.addColorStop(0.8, '#eab308');
        bodyGrad.addColorStop(1, '#ca8a04');
      } else {
        // Classic / Captain / Diver / Glider
        bodyGrad = ctx.createRadialGradient(-6, -6, 2, 0, 0, duck.radius);
        bodyGrad.addColorStop(0, '#fef9c3');
        bodyGrad.addColorStop(0.4, '#facc15');
        bodyGrad.addColorStop(0.8, '#eab308');
        bodyGrad.addColorStop(1, '#ca8a04');
      }

      // 1. Duck Tail Feather flick
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-duck.radius * 0.7, 0);
      ctx.quadraticCurveTo(-duck.radius * 1.3, -duck.radius * 0.6, -duck.radius * 1.25, -duck.radius * 0.9);
      ctx.quadraticCurveTo(-duck.radius * 0.8, -duck.radius * 0.4, -duck.radius * 0.4, -duck.radius * 0.2);
      ctx.fill();

      // 2. Plump Duck Body
      ctx.beginPath();
      ctx.ellipse(0, 0, duck.radius, duck.radius * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wing outline / feather definition
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-duck.radius * 0.1, -duck.radius * 0.05, duck.radius * 0.45, 0.4, 2.7);
      ctx.stroke();

      // 3. Cute Round Duck Head
      const headX = duck.radius * 0.55;
      const headY = -duck.radius * 0.55;
      const headRadius = duck.radius * 0.52;

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // 4. Duck Bill / Beak
      ctx.fillStyle = billColor;
      ctx.beginPath();
      ctx.moveTo(headX + headRadius * 0.65, headY - headRadius * 0.15);
      ctx.quadraticCurveTo(headX + headRadius * 1.45, headY + headRadius * 0.1, headX + headRadius * 0.6, headY + headRadius * 0.4);
      ctx.closePath();
      ctx.fill();
      // Bill mouth line
      ctx.strokeStyle = '#9a3412';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + headRadius * 0.7, headY + headRadius * 0.1);
      ctx.lineTo(headX + headRadius * 1.35, headY + headRadius * 0.15);
      ctx.stroke();

      // 5. Duck Eye
      const eyeX = headX + headRadius * 0.25;
      const eyeY = headY - headRadius * 0.2;
      const eyeRadius = headRadius * 0.24;

      if (duck.isHit) {
        // Comic X eyes when knocked out
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        const xRad = eyeRadius * 0.9;
        ctx.beginPath();
        ctx.moveTo(eyeX - xRad, eyeY - xRad);
        ctx.lineTo(eyeX + xRad, eyeY + xRad);
        ctx.moveTo(eyeX + xRad, eyeY - xRad);
        ctx.lineTo(eyeX - xRad, eyeY + xRad);
        ctx.stroke();
      } else {
        // Expressive big glossy cartoon eye
        ctx.fillStyle = eyeWhite;
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eyeX + 1, eyeY, eyeRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // White twinkle / light catch
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeX + 0.5, eyeY - 1, eyeRadius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Accessories per duck type
      if (duck.type === 'captain') {
        // Pirate Captain Bicorne Hat
        this.drawPirateHat(headX, headY - headRadius * 0.8, headRadius);
      } else if (duck.type === 'diver') {
        // Aqua Snorkel and Mask
        this.drawSnorkel(headX, headY, headRadius);
      } else if (duck.type === 'golden') {
        // Golden Royal Crown with rubies
        this.drawCrown(headX, headY - headRadius * 0.8, headRadius);
      } else if (duck.type === 'mega') {
        // Giant King Crown
        this.drawCrown(headX, headY - headRadius * 0.8, headRadius * 1.2);
        // Boss HP Bar above duck
        this.drawHpBar(duck, 0, -duck.radius - 22);
      }

      // Water float wake below duck if in water
      if (duck.inWater && !duck.isHit) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, duck.radius * 0.6, duck.radius * 1.1, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Draw Pirate Hat accessory
   */
  private drawPirateHat(x: number, y: number, headRadius: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Dark bicorne felt
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(-headRadius * 1.1, 0);
    ctx.quadraticCurveTo(0, -headRadius * 0.9, headRadius * 1.1, 0);
    ctx.quadraticCurveTo(0, -headRadius * 0.2, -headRadius * 1.1, 0);
    ctx.fill();

    // Gold trim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Jolly Roger / Cute duck skull emblem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -headRadius * 0.45, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw Diver Snorkel accessory
   */
  private drawSnorkel(x: number, y: number, headRadius: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Aqua dive goggles
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headRadius * 0.25, -headRadius * 0.2, headRadius * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Snorkel pipe going up
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(headRadius * 0.5, headRadius * 0.1);
    ctx.lineTo(headRadius * 0.8, -headRadius * 0.9);
    ctx.lineTo(headRadius * 0.8, -headRadius * 1.2);
    ctx.stroke();

    // Snorkel top valve
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(headRadius * 0.8, -headRadius * 1.25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw Royal Golden Crown accessory
   */
  private drawCrown(x: number, y: number, headRadius: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-headRadius * 0.6, 0);
    ctx.lineTo(-headRadius * 0.7, -headRadius * 0.65);
    ctx.lineTo(-headRadius * 0.2, -headRadius * 0.35);
    ctx.lineTo(0, -headRadius * 0.75);
    ctx.lineTo(headRadius * 0.2, -headRadius * 0.35);
    ctx.lineTo(headRadius * 0.7, -headRadius * 0.65);
    ctx.lineTo(headRadius * 0.6, 0);
    ctx.closePath();
    ctx.fill();

    // Crown jewels (rubies)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, -headRadius * 0.6, 2.5, 0, Math.PI * 2);
    ctx.arc(-headRadius * 0.5, -headRadius * 0.5, 2, 0, Math.PI * 2);
    ctx.arc(headRadius * 0.5, -headRadius * 0.5, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Glider Helium Balloon
   */
  private drawBalloon(x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // String down to duck
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(0, 55);
    ctx.stroke();

    // Balloon body
    const grad = ctx.createRadialGradient(-6, -6, 4, 0, 0, 22);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.7, '#e11d48');
    grad.addColorStop(1, '#9f1239');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Balloon knot
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.moveTo(-4, 25);
    ctx.lineTo(4, 25);
    ctx.lineTo(0, 29);
    ctx.closePath();
    ctx.fill();

    // Gloss sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(-7, -8, 5, 8, -0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw Boss HP Bar
   */
  private drawHpBar(duck: Duck, x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    const w = 55;
    const h = 7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    const hpRatio = Math.max(0, duck.hp / duck.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(-w / 2 + 1, -h / 2 + 1, (w - 2) * hpRatio, h - 2);

    ctx.restore();
  }

  /**
   * Draw Obstacles (Wooden crates, planks, TNT barrels, and Target Rings)
   */
  public drawObstacles(obstacles: Obstacle[]) {
    const ctx = this.ctx;

    for (const obs of obstacles) {
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.rotate(obs.rotation);

      if (obs.type === 'crate') {
        // Wooden Crate
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;

        ctx.fillStyle = '#854d0e';
        ctx.fillRect(-halfW, -halfH, obs.width, obs.height);

        // Inner wood border & cross struts
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-halfW, -halfH, obs.width, obs.height);

        ctx.fillStyle = '#a16207';
        ctx.fillRect(-halfW + 4, -halfH + 4, obs.width - 8, obs.height - 8);

        // Cross braces
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-halfW + 4, -halfH + 4);
        ctx.lineTo(halfW - 4, halfH - 4);
        ctx.moveTo(halfW - 4, -halfH + 4);
        ctx.lineTo(-halfW + 4, halfH - 4);
        ctx.stroke();

        // Corner rivets
        ctx.fillStyle = '#1c1917';
        for (const dx of [-halfW + 3, halfW - 3]) {
          for (const dy of [-halfH + 3, halfH - 3]) {
            ctx.beginPath();
            ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (obs.type === 'plank') {
        // Wooden Plank / Beam
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;

        const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
        grad.addColorStop(0, '#b45309');
        grad.addColorStop(0.5, '#78350f');
        grad.addColorStop(1, '#451a03');

        ctx.fillStyle = grad;
        ctx.fillRect(-halfW, -halfH, obs.width, obs.height);
        ctx.strokeStyle = '#291102';
        ctx.lineWidth = 2;
        ctx.strokeRect(-halfW, -halfH, obs.width, obs.height);

        // Wood grain lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-halfW + 10, 0);
        ctx.lineTo(halfW - 10, 0);
        ctx.stroke();
      } else if (obs.type === 'tnt') {
        // Explosive TNT Barrel
        const halfW = obs.width / 2;
        const halfH = obs.height / 2;

        ctx.fillStyle = '#dc2626'; // Red TNT
        ctx.fillRect(-halfW, -halfH, obs.width, obs.height);
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-halfW, -halfH, obs.width, obs.height);

        // Black metal bands
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-halfW, -halfH + 6, obs.width, 5);
        ctx.fillRect(-halfW, halfH - 11, obs.width, 5);

        // "TNT" Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('TNT', 0, 0);
      } else if (obs.type === 'target_ring') {
        // Carnival brass bonus ring
        const rad = obs.width / 2;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bonus banner in center
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2X', 0, 0);
      }

      ctx.restore();
    }
  }

  /**
   * Draw Particle Systems (water drops, feathers, wood splinters, sparks)
   */
  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      const alpha = Math.max(0, p.life / p.maxLife);

      if (p.type === 'water') {
        ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'feather') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = `rgba(250, 204, 21, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'wood') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = `rgba(161, 98, 7, ${alpha})`;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.type === 'spark') {
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke') {
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Draw Animated Score Popups & Comic Quack messages
   */
  public drawFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;

    for (const t of texts) {
      ctx.save();
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      ctx.font = '800 18px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, 0, 0);

      // Fill
      ctx.fillStyle = t.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }
  }

  /**
   * Draw Wind indicator in top-right corner of canvas
   */
  public drawWindIndicator(wind: number) {
    if (Math.abs(wind) < 0.1) return;

    const ctx = this.ctx;
    ctx.save();

    const x = this.width - 90;
    const y = 35;
    const isRight = wind > 0;
    const magnitude = Math.min(Math.abs(wind), 10);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.roundRect(x - 55, y - 18, 110, 36, 18);
    ctx.fill();

    // Wind Arrow
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    const arrowLen = 14 + magnitude * 2.5;
    const startX = isRight ? x - arrowLen / 2 : x + arrowLen / 2;
    const endX = isRight ? x + arrowLen / 2 : x - arrowLen / 2;

    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();

    // Arrow tip
    const tipDir = isRight ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(endX, y);
    ctx.lineTo(endX - 7 * tipDir, y - 5);
    ctx.lineTo(endX - 7 * tipDir, y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'center';
    ctx.fillText(`${magnitude.toFixed(1)} kt`, x, y + 14);

    ctx.restore();
  }
}
