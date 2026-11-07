import Phaser from 'phaser';
import { VisualTheme } from '@shared/core';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  platform: string;
  platformBorder: string;
  background: string;
  hazard: string;
  collectible: string;
  portal: string;
}

export const THEME_PALETTES: Record<VisualTheme, ThemeColors> = {
  cyberpunk: {
    primary: '#06b6d4',
    secondary: '#3b82f6',
    accent: '#22d3ee',
    platform: '#1e293b',
    platformBorder: '#06b6d4',
    background: '#070a14',
    hazard: '#f43f5e',
    collectible: '#22d3ee',
    portal: '#8b5cf6',
  },
  forest: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    platform: '#2d3748',
    platformBorder: '#10b981',
    background: '#061a14',
    hazard: '#f97316',
    collectible: '#fbbf24',
    portal: '#06b6d4',
  },
  dungeon: {
    primary: '#a855f7',
    secondary: '#7c3aed',
    accent: '#c084fc',
    platform: '#1f2937',
    platformBorder: '#a855f7',
    background: '#0f0c1b',
    hazard: '#ef4444',
    collectible: '#f59e0b',
    portal: '#ec4899',
  },
  'retro-arcade': {
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    platform: '#18181b',
    platformBorder: '#f59e0b',
    background: '#09090b',
    hazard: '#e11d48',
    collectible: '#38bdf8',
    portal: '#10b981',
  },
  'neon-void': {
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    platform: '#111827',
    platformBorder: '#ec4899',
    background: '#030712',
    hazard: '#ef4444',
    collectible: '#06b6d4',
    portal: '#3b82f6',
  },
};

/**
 * Procedurally generates complete game textures directly into Phaser's TextureManager.
 * Zero external network downloads required; works offline and loads instantaneously.
 */
export function generateProceduralTextures(scene: Phaser.Scene, theme: VisualTheme = 'cyberpunk'): void {
  const textures = scene.textures;
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.cyberpunk;

  // Helper to create canvas texture
  const createTexture = (
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  ) => {
    if (textures.exists(key)) return;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawFn(ctx, width, height);
      textures.addCanvas(key, canvas);
    }
  };

  // 1. Player - Idle (28x36)
  createTexture('player_idle', 28, 36, (ctx, w, h) => {
    // Body / Suit
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(4, 8, w - 8, h - 12, 4);
    ctx.fill();

    // Helmet / Visor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(6, 4, w - 12, 12, 3);
    ctx.fill();

    ctx.fillStyle = palette.accent;
    ctx.fillRect(8, 7, w - 16, 5);

    // Neon Core / Chest light
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2, 22, 3, 0, Math.PI * 2);
    ctx.fill();

    // Feet / Boots
    ctx.fillStyle = '#334155';
    ctx.fillRect(5, h - 5, 8, 5);
    ctx.fillRect(w - 13, h - 5, 8, 5);
  });

  // 2. Player - Run Frame 1 (28x36)
  createTexture('player_run_1', 28, 36, (ctx, w, h) => {
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(4, 7, w - 8, h - 13, 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(7, 3, w - 12, 12, 3);
    ctx.fill();

    ctx.fillStyle = palette.accent;
    ctx.fillRect(10, 6, w - 16, 5);

    // Stride legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, h - 7, 8, 6);
    ctx.fillRect(w - 10, h - 4, 8, 4);
  });

  // 3. Player - Run Frame 2 (28x36)
  createTexture('player_run_2', 28, 36, (ctx, w, h) => {
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(4, 7, w - 8, h - 13, 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(5, 3, w - 12, 12, 3);
    ctx.fill();

    ctx.fillStyle = palette.accent;
    ctx.fillRect(8, 6, w - 16, 5);

    // Alternate stride legs
    ctx.fillStyle = '#334155';
    ctx.fillRect(6, h - 4, 8, 4);
    ctx.fillRect(w - 14, h - 7, 8, 6);
  });

  // 4. Player - Jump / In-air (28x36)
  createTexture('player_jump', 28, 36, (ctx, w, h) => {
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(4, 5, w - 8, h - 14, 4);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(6, 2, w - 12, 11, 3);
    ctx.fill();

    ctx.fillStyle = palette.accent;
    ctx.fillRect(8, 5, w - 16, 4);

    // Thruster trail glow underneath boots
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(8, h - 2, 4, 0, Math.PI * 2);
    ctx.arc(w - 8, h - 2, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // 5. Enemy - Patrol Drone (24x24)
  createTexture('enemy_patrol', 24, 24, (ctx, w, h) => {
    // Body sphere
    ctx.fillStyle = palette.hazard;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 9, 0, Math.PI * 2);
    ctx.fill();

    // Eye / Scanner
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w / 2 + 1, h / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Antenna & Wings
    ctx.strokeStyle = palette.hazard;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(2, h / 2);
    ctx.lineTo(w - 2, h / 2);
    ctx.moveTo(w / 2, 2);
    ctx.lineTo(w / 2, 5);
    ctx.stroke();
  });

  // 6. Collectible - Data Shard / Coin (18x18)
  createTexture('collectible_gem', 18, 18, (ctx, w, h) => {
    ctx.fillStyle = palette.collectible;
    ctx.beginPath();
    ctx.moveTo(w / 2, 1);
    ctx.lineTo(w - 2, h / 2);
    ctx.lineTo(w / 2, h - 1);
    ctx.lineTo(2, h / 2);
    ctx.closePath();
    ctx.fill();

    // Inner facet
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w - 5, h / 2);
    ctx.lineTo(w / 2, h - 4);
    ctx.lineTo(5, h / 2);
    ctx.closePath();
    ctx.fill();
  });

  // 7. Collectible - Gold Coin (18x18)
  createTexture('collectible_coin', 18, 18, (ctx, w, h) => {
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ca8a04';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', w / 2, h / 2);
  });

  // 8. Platform Solid Tile Texture (32x32)
  createTexture('tile_platform', 32, 32, (ctx, w, h) => {
    ctx.fillStyle = palette.platform;
    ctx.fillRect(0, 0, w, h);

    // Glowing top boundary
    ctx.fillStyle = palette.platformBorder;
    ctx.fillRect(0, 0, w, 3);

    // Subtle tech pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeRect(1, 4, w - 2, h - 5);
  });

  // 9. Hazard Spike (24x20)
  createTexture('hazard_spike', 24, 20, (ctx, w, h) => {
    ctx.fillStyle = palette.hazard;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Red glow core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w / 2, 4);
    ctx.lineTo(w - 6, h - 2);
    ctx.lineTo(6, h - 2);
    ctx.closePath();
    ctx.fill();
  });

  // 10. Finish Portal / Beacon (36x48)
  createTexture('finish_portal', 36, 48, (ctx, w, h) => {
    // Outer arch
    ctx.strokeStyle = palette.portal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 14, 21, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Swirling portal vortex
    const grad = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, 14);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, palette.portal);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, 12, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // 11. Particle Spark (8x8)
  createTexture('particle_spark', 8, 8, (ctx, w, h) => {
    ctx.fillStyle = palette.accent;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 12. Player - Slide / Duck Frame (32x20)
  createTexture('player_slide', 32, 20, (ctx, w, h) => {
    ctx.fillStyle = palette.primary;
    ctx.beginPath();
    ctx.roundRect(2, 6, w - 4, h - 8, 4);
    ctx.fill();

    // Helmet sliding forward
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(w - 14, 4, 12, 10, 3);
    ctx.fill();

    ctx.fillStyle = palette.accent;
    ctx.fillRect(w - 12, 7, 8, 4);

    // Friction sparks behind
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(4, h - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // 13. Dungeon Stone Wall (32x32)
  createTexture('dungeon_wall', 32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#3b3355';
    ctx.lineWidth = 1;
    // Brick pattern
    ctx.strokeRect(1, 1, 14, 14);
    ctx.strokeRect(17, 1, 14, 14);
    ctx.strokeRect(1, 17, 30, 14);

    // Subtle edge highlight
    ctx.fillStyle = palette.platformBorder;
    ctx.fillRect(0, 0, w, 2);
  });

  // 14. Dungeon Floor Flagstone (32x32)
  createTexture('dungeon_floor', 32, 32, (ctx, w, h) => {
    ctx.fillStyle = '#0c0a17';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1a162b';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    ctx.strokeRect(8, 8, w - 16, h - 16);
  });

  // 15. Relic Dungeon Key (24x24)
  createTexture('relic_key', 24, 24, (ctx, _w, _h) => {
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;

    // Key bow (circle)
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f0c1b';
    ctx.beginPath();
    ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Key shaft and bit
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(13, 6, 8, 4);
    ctx.fillRect(19, 10, 3, 4);
  });

  // 16. Energy Barrier Obstacle (28x40)
  createTexture('energy_barrier', 28, 40, (ctx, w, h) => {
    // Emitter bases
    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 0, w - 8, 6);
    ctx.fillRect(4, h - 6, w - 8, 6);

    // Laser beam
    const beamGrad = ctx.createLinearGradient(0, 6, 0, h - 6);
    beamGrad.addColorStop(0, '#f43f5e');
    beamGrad.addColorStop(0.5, '#ffffff');
    beamGrad.addColorStop(1, '#f43f5e');

    ctx.fillStyle = beamGrad;
    ctx.fillRect(w / 2 - 3, 6, 6, h - 12);
  });

  // 17. Runner Highway Ground (64x40)
  createTexture('runner_ground', 64, 40, (ctx, w, h) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Top border neon curb
    ctx.fillStyle = palette.platformBorder;
    ctx.fillRect(0, 0, w, 3);

    // Center dash line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(16, 18, 32, 4);
  });
}

