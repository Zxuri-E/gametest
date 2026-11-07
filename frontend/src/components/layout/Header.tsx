import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RotateCw,
  FolderGit2,
  Server,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
} from 'lucide-react';
import { useProjectStore } from '../../store/useProjectStore';
import { useTestingStore } from '../../store/useTestingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { projects, activeProject, selectProject } = useProjectStore();
  const { runAllTests, isRunningTests } = useTestingStore();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const statusVariant = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'emerald';
      case 'testing':
        return 'amber';
      case 'error':
        return 'rose';
      case 'generating':
        return 'cyan';
      default:
        return 'slate';
    }
  };

  return (
    <header className="h-14 px-6 bg-canvas-900 border-b border-border-default flex items-center justify-between shrink-0 z-20">
      {/* Left: Project Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-slate-400" />
          <select
            value={activeProject?.id || ''}
            onChange={(e) => selectProject(e.target.value)}
            className="bg-canvas-800 border border-border-default rounded text-xs font-medium text-slate-100 py-1.5 px-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-canvas-900">
                {p.name} (v{p.currentVersion})
              </option>
            ))}
          </select>
        </div>

        {activeProject && (
          <Badge variant={statusVariant(activeProject.status)} size="sm" dot>
            {activeProject.status.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Right: Runtime Indicator & User Account & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Mock/Live Mode Pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-canvas-800/80 border border-border-subtle">
          <Server className="w-3 h-3 text-cyan-400" />
          <span>RUNTIME:</span>
          <span className="text-cyan-300 font-semibold">ACTIVE</span>
        </div>

        {/* Quick Test Execution Button */}
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />}
          onClick={() => {
            navigate('/testing');
            runAllTests();
          }}
          disabled={isRunningTests}
        >
          {isRunningTests ? 'Verifying...' : 'Run Verification'}
        </Button>

        {/* Studio Generate Shortcut Button */}
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Sparkles className="w-3.5 h-3.5" />}
          onClick={() => navigate('/studio')}
        >
          Generate Game
        </Button>

        {/* Auth Section */}
        <div className="pl-2 border-l border-border-subtle flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-canvas-800 border border-border-default px-2.5 py-1 rounded-md text-xs">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">{user.username}</span>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="ml-1 inline-flex items-center gap-1 bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-1.5 py-0.5 rounded text-[10px] font-mono hover:bg-indigo-900 transition-colors"
                    title="Open Administrator Dashboard"
                  >
                    <Shield className="w-2.5 h-2.5" />
                    <span>ADMIN</span>
                  </button>
                )}
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-canvas-800 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogIn className="w-3.5 h-3.5 text-cyan-400" />}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
