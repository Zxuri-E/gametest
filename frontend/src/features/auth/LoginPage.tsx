import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LogIn, Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck, Terminal } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { login, isLoading, error, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (!username.trim()) {
      setFormError('Please enter your username');
      return;
    }
    if (!password) {
      setFormError('Please enter your password');
      return;
    }

    const success = await login({ username: username.trim(), password });
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-canvas-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 shadow-lg shadow-cyan-500/20 mb-4">
          <Terminal className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          Sign in to <span className="text-cyan-400">Novus</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Autonomous 2D Game Generation & Automated Verification Engine
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-canvas-900 py-8 px-6 shadow-xl shadow-black/40 rounded-xl border border-border-default backdrop-blur-md">
          {(error || formError) && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error || formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                required
                placeholder="developer"
                leftIcon={<User className="w-4 h-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-canvas-900 border border-border-default rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors py-2 pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>HttpOnly Secure Session</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col items-center gap-2 text-xs text-slate-400">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
                Create Account
              </Link>
            </div>
            <div>
              Platform initialization?{' '}
              <Link to="/register?bootstrap=true" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
                Initialize Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-slate-500">
          <Link to="/terms" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
