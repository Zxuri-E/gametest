import React, { useEffect, useRef } from 'react';
import { useWorkspaceStore } from '../../../store/useWorkspaceStore';
import { GameSpecification } from '@shared/core';

interface GameCanvasPlaceholderProps {
  spec: GameSpecification | null;
}

export const GameCanvasPlaceholder: React.FC<GameCanvasPlaceholderProps> = ({ spec }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    isRunning,
    isPaused,
    showHitboxes,
    showVectors,
    showGrid,
    incrementScore,
    updateTelemetry,
  } = useWorkspaceStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = performance.now();
    let currentFps = 60;

    // Simulation Physics State
    const player = {
      x: 100,
      y: 350,
      width: 24,
      height: 32,
      vx: 0,
      vy: 0,
      isGrounded: false,
      color: '#06b6d4',
    };

    const platforms = [
      { x: 40, y: 460, width: 720, height: 28, color: '#1e293b' },
      { x: 120, y: 360, width: 140, height: 16, color: '#334155' },
      { x: 320, y: 280, width: 160, height: 16, color: '#334155' },
      { x: 540, y: 200, width: 140, height: 16, color: '#334155' },
    ];

    let collectibles = [
      { id: 1, x: 180, y: 320, radius: 8, collected: false, pulse: 0 },
      { id: 2, x: 400, y: 240, radius: 8, collected: false, pulse: 0 },
      { id: 3, x: 600, y: 160, radius: 8, collected: false, pulse: 0 },
      { id: 4, x: 480, y: 420, radius: 8, collected: false, pulse: 0 },
    ];

    const enemy = {
      x: 350,
      y: 254,
      width: 22,
      height: 22,
      vx: 1.2,
      minX: 325,
      maxX: 455,
      color: '#f43f5e',
    };

    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    // Keyboard state
    const keys: Record<string, boolean> = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gravity = (spec?.physics.gravityY || 750) / 1000;
    const speed = (spec?.physics.playerSpeed || 280) / 1000;
    const jumpPower = (spec?.physics.jumpVelocity || 520) / 1000;

    // Simulation Loop
    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      // Calculate FPS
      frameCount++;
      if (time - fpsTimer >= 500) {
        currentFps = Math.round((frameCount * 1000) / (time - fpsTimer));
        frameCount = 0;
        fpsTimer = time;
      }

      if (isRunning && !isPaused) {
        // Handle input or autonomous patrol
        if (keys['arrowleft'] || keys['a']) {
          player.vx = -speed * 16;
        } else if (keys['arrowright'] || keys['d']) {
          player.vx = speed * 16;
        } else {
          // Autonomous demo walk if no keyboard input
          player.vx = Math.sin(time * 0.002) * 2.5;
        }

        if ((keys['arrowup'] || keys['w'] || keys[' ']) && player.isGrounded) {
          player.vy = -jumpPower * 16;
          player.isGrounded = false;
        }

        // Autonomous jump demo occasionally
        if (!keys['arrowup'] && !keys['w'] && player.isGrounded && Math.sin(time * 0.004) > 0.98) {
          player.vy = -jumpPower * 14;
          player.isGrounded = false;
        }

        // Apply Gravity
        player.vy += gravity * (dt / 16);
        player.x += player.vx;
        player.y += player.vy;

        // Platform Collisions (AABB)
        player.isGrounded = false;
        for (const p of platforms) {
          if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height <= p.y + p.height + player.vy + 2 &&
            player.vy >= 0
          ) {
            player.y = p.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        }

        // Boundary Clamps
        if (player.x < 10) player.x = 10;
        if (player.x > canvas.width - player.width - 10) player.x = canvas.width - player.width - 10;
        if (player.y > canvas.height - 40) {
          player.y = 100;
          player.vy = 0;
        }

        // Enemy Patrol
        enemy.x += enemy.vx;
        if (enemy.x > enemy.maxX || enemy.x < enemy.minX) {
          enemy.vx *= -1;
        }

        // Collectibles Collision & Particles
        collectibles.forEach((c) => {
          c.pulse += 0.05;
          if (!c.collected) {
            const dx = player.x + player.width / 2 - c.x;
            const dy = player.y + player.height / 2 - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < c.radius + player.width / 2) {
              c.collected = true;
              incrementScore(100);
              // Spawn pickup burst particles
              for (let i = 0; i < 8; i++) {
                particles.push({
                  x: c.x,
                  y: c.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  life: 1.0,
                  color: '#22d3ee',
                });
              }
            }
          }
        });

        // Respawn shards if all collected
        if (collectibles.every((c) => c.collected)) {
          collectibles.forEach((c) => (c.collected = false));
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          if (!pt) continue;
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.life -= 0.03;
          if (pt.life <= 0) particles.splice(i, 1);
        }

        // Update telemetry to store
        updateTelemetry({
          fps: currentFps,
          playerPos: {
            x: Math.round(player.x),
            y: Math.round(player.y),
            vx: Math.round(player.vx * 10) / 10,
            vy: Math.round(player.vy * 10) / 10,
          },
        });
      }

      // --- RENDER SCENE ---
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.fillStyle = spec?.backgroundColor || '#070a14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle Grid Overlay
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Platforms
      platforms.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Platform top glow border
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.x, p.y, p.width, 2);

        if (showHitboxes) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x, p.y, p.width, p.height);
        }
      });

      // Collectibles (Glowing Diamonds)
      collectibles.forEach((c) => {
        if (!c.collected) {
          ctx.save();
          ctx.translate(c.x, c.y + Math.sin(c.pulse) * 3);
          ctx.rotate(time * 0.002);
          ctx.fillStyle = '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(0, -c.radius);
          ctx.lineTo(c.radius, 0);
          ctx.lineTo(0, c.radius);
          ctx.lineTo(-c.radius, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // Enemy Patrol Drone
      ctx.fillStyle = enemy.color;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      ctx.shadowBlur = 0;

      // Player Entity
      ctx.save();
      ctx.fillStyle = player.color;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Player Visor
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x + (player.vx >= 0 ? 12 : 4), player.y + 6, 8, 4);
      ctx.restore();

      // Velocity Vectors
      if (showVectors) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y + player.height / 2);
        ctx.lineTo(
          player.x + player.width / 2 + player.vx * 15,
          player.y + player.height / 2 + player.vy * 15
        );
        ctx.stroke();
      }

      // Hitboxes
      if (showHitboxes) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
      }

      // Particles
      particles.forEach((pt) => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // On-Canvas Telemetry Overlay
      ctx.fillStyle = 'rgba(6, 8, 13, 0.75)';
      ctx.fillRect(16, 16, 190, 68);
      ctx.strokeStyle = 'rgba(40, 52, 76, 0.8)';
      ctx.strokeRect(16, 16, 190, 68);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`RUNTIME: 2D PHYSICS SIM`, 26, 32);
      ctx.fillStyle = '#10b981';
      ctx.fillText(`FPS: ${currentFps} / 60`, 26, 48);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`X:${Math.round(player.x)} Y:${Math.round(player.y)} GROUND:${player.isGrounded}`, 26, 64);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning, isPaused, showHitboxes, showVectors, showGrid, incrementScore, updateTelemetry, spec]);

  return (
    <div
      id="phaser-mount-container"
      className="relative w-full aspect-[4/3] max-h-[580px] bg-canvas-950 rounded-lg overflow-hidden border border-border-default shadow-2xl flex items-center justify-center select-none"
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full object-contain"
      />

      {/* Phaser Mount Anchor Marker */}
      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono text-slate-500 bg-canvas-900/80 px-2 py-0.5 rounded border border-border-subtle">
        Phaser 3 Mount Target: #phaser-mount-container
      </div>
    </div>
  );
};
