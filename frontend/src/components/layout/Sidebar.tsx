import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Gamepad2,
  CheckCircle2,
  Bug,
  History,
  Settings,
  Terminal,
  Cpu,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProjectStore } from '../../store/useProjectStore';

export const Sidebar: React.FC = () => {
  const { activeProject } = useProjectStore();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/studio', label: 'Game Studio', icon: Sparkles },
    { to: '/workspace', label: 'Game Workspace', icon: Gamepad2 },
    { to: '/testing', label: 'Testing Center', icon: CheckCircle2 },
    { to: '/bugs', label: 'Bug Reports', icon: Bug, badge: activeProject?.openBugsCount },
    { to: '/history', label: 'Project History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-canvas-900 border-r border-border-default flex flex-col shrink-0 select-none">
      {/* Brand & App Title */}
      <div className="h-14 px-4 border-b border-border-subtle flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-sm shadow-cyan-500/20">
          <Terminal className="w-4 h-4 text-slate-950 font-bold" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-slate-100 tracking-tight">Kinesis</span>
            <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1 py-0.2 rounded">
              2D Studio
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Autonomous Game Engine</span>
        </div>
      </div>

      {/* Active Project Banner */}
      <div className="p-3 mx-3 my-3 rounded-md bg-canvas-850/80 border border-border-subtle">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Active Target</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v{activeProject?.currentVersion || '0.3.0'}
          </span>
        </div>
        <p className="mt-1 text-xs font-medium text-slate-200 truncate">
          {activeProject?.name || 'Neon Vault Runner'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-3 py-1 font-semibold">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors group',
                  isActive
                    ? 'bg-canvas-800 text-cyan-400 border border-border-default shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-canvas-850/60'
                )
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 font-semibold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status / Telemetry Footer */}
      <div className="p-3 border-t border-border-subtle bg-canvas-950/40 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Orchestrator</span>
          </span>
          <span className="text-emerald-400 font-mono font-medium">ONLINE</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
          <span>Engine: Phaser 3.80</span>
          <span>Harness: Playwright</span>
        </div>
      </div>
    </aside>
  );
};

