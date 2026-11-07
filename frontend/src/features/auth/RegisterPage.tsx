import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { UserPlus, Lock, User, Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle, Terminal } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBootstrapRequested = searchParams.get('bootstrap') === 'true';

  const [isBootstrap, setIsBootstrap] = useState(isBootstrapRequested);
  const { register, bootstrapAdmin, isLoading, error, clearError } = useAuthStore();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    if (username.trim().length < 3) {
      setFormError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!termsAccepted) {
      setFormError('You must review and accept the Terms of Service and Privacy Policy');
      return;
    }

    let success = false;
    if (isBootstrap) {
      success = await bootstrapAdmin({
        username: username.trim(),
        password,
        displayName: displayName.trim() || undefined,
      });
    } else {
      success = await register({
        username: username.trim(),
        password,
        confirmPassword,
        termsAccepted: true,
      });
    }

    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-canvas-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 shadow-lg shadow-cyan-500/20 mb-4">
          <Terminal className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-100">
          {isBootstrap ? 'Initialize Platform Admin' : 'Create Novus Account'}
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          {isBootstrap
            ? 'One-time secure initialization of primary administrative authority'
            : 'Join the autonomous 2D game generation and testing studio'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-canvas-900 py-8 px-6 shadow-xl shadow-black/40 rounded-xl border border-border-default backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="mb-6 flex rounded-lg bg-canvas-950 p-1 border border-border-subtle">
            <button
              type="button"
              onClick={() => {
                setIsBootstrap(false);
                clearError();
                setFormError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                !isBootstrap
                  ? 'bg-canvas-800 text-cyan-400 shadow-sm border border-border-default'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Developer Account
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBootstrap(true);
                clearError();
                setFormError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                isBootstrap
                  ? 'bg-canvas-800 text-indigo-400 shadow-sm border border-border-default'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Bootstrap
            </button>
          </div>

          {isBootstrap && (
            <div className="mb-5 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/80 flex items-start gap-2.5 text-indigo-200 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
              <span>
                <strong>Bootstrap Mode:</strong> Permanently deactivated once an initial administrator account exists. No default or hardcoded credentials are ever used.
              </span>
            </div>
          )}

          {(error || formError) && (
            <div className="mb-5 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error || formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Username"
                type="text"
                autoComplete="username"
                required
                placeholder="dev_lead"
                helperText="3-30 letters, numbers, hyphens or underscores"
                leftIcon={<User className="w-4 h-4" />}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {isBootstrap && (
              <div>
                <Input
                  label="Display Name (Optional)"
                  type="text"
                  placeholder="Lead System Architect"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

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
                  autoComplete="new-password"
                  required
                  placeholder="At least 8 characters"
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

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-canvas-900 border border-border-default rounded-md text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors py-2 pl-9 pr-10"
                />
              </div>
            </div>

            {/* Terms of Service Acceptance Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={isLoading}
                  className="mt-0.5 w-4 h-4 rounded border-border-default bg-canvas-950 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <span>
                  I have read and agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-cyan-400 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and acknowledge the{' '}
                  <Link to="/privacy" target="_blank" className="text-cyan-400 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant={isBootstrap ? 'secondary' : 'primary'}
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
              leftIcon={isBootstrap ? <CheckCircle className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            >
              {isBootstrap ? 'Bootstrap Administrator' : 'Create Developer Account'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300 hover:underline">
              Sign In
            </Link>
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
