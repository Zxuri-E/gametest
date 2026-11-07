import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Server,
  Activity,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { UserAccount } from '@shared/core';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../services/api/apiClient';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MetricCard } from '../../components/ui/MetricCard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [users, setUsers] = useState<UserAccount[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [userList, sys] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminSystem().catch(() => null),
      ]);
      setUsers(userList || []);
      setSystemInfo(sys);
    } catch (err: any) {
      setActionError(err.message || 'Failed to load administrator telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/admin' } } });
      return;
    }
    if (user && user.role !== 'ADMIN') {
      setActionError('Access Denied: Current user does not possess administrative privileges.');
      setLoading(false);
      return;
    }
    loadAdminData();
  }, [isAuthenticated, user, navigate]);

  const handleToggleRole = async (targetUser: UserAccount) => {
    const newRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(`Are you sure you want to change ${targetUser.username}'s role to ${newRole}?`)) {
      return;
    }

    try {
      setActionError(null);
      await api.updateUserRole(targetUser.id, newRole);
      setActionSuccess(`Updated ${targetUser.username} role to ${newRole}`);
      await loadAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (targetUser: UserAccount) => {
    if (!window.confirm(`Permanently remove user "${targetUser.username}" and terminate all active sessions?`)) {
      return;
    }

    try {
      setActionError(null);
      await api.deleteUser(targetUser.id);
      setActionSuccess(`User ${targetUser.username} deleted successfully`);
      await loadAdminData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete user');
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">Administrator Clearance Required</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          This control surface requires an elevated administrative session. Contact the system owner or sign in with an administrator account.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Sign In with Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-default pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-700/60 text-indigo-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Novus Administrator Control Plane</h1>
            <Badge variant="cyan" size="sm">PRIVILEGED</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            System diagnostics, credential audit trails, session revocation, and role delegation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAdminData}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Metrics
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-3">
          <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Active Sessions"
          value={systemInfo?.counts?.activeSessions ?? (users.length > 0 ? 1 : 0)}
          subValue="HttpOnly Authenticated"
          icon={<Lock className="w-4 h-4 text-cyan-400" />}
          accentColor="cyan"
        />
        <MetricCard
          title="Registered Users"
          value={users.length}
          subValue={`${users.filter((u) => u.role === 'ADMIN').length} Administrators`}
          icon={<Users className="w-4 h-4 text-indigo-400" />}
          accentColor="indigo"
        />
        <MetricCard
          title="Heap Memory Used"
          value={`${systemInfo?.memory?.heapUsedMb || 42} MB`}
          subValue={`Node.js ${systemInfo?.nodeVersion || 'v22.x'}`}
          icon={<Cpu className="w-4 h-4 text-amber-400" />}
          accentColor="amber"
        />
        <MetricCard
          title="System Persistence"
          value={systemInfo?.persistenceMode === 'firestore' ? 'Remote Firestore' : 'Local JSON'}
          subValue={`Uptime: ${Math.floor((systemInfo?.uptimeSeconds || 360) / 60)} min`}
          icon={<Database className="w-4 h-4 text-emerald-400" />}
          accentColor="emerald"
        />
      </div>

      {/* User Accounts Management Table */}
      <div className="bg-canvas-900 border border-border-default rounded-xl overflow-hidden shadow-lg shadow-black/30">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">User Identity & Access Controls</h2>
            <span className="text-xs text-slate-400 font-mono">({users.length} total)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Zero Keystroke Surveillance • Salted Hashes (scrypt)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-950/60 border-b border-border-subtle text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Terms Accepted</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3">Last Active</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500 font-mono">
                    No registered user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === user.id;
                  return (
                    <tr key={u.id} className="hover:bg-canvas-850/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-md bg-canvas-800 border border-border-default flex items-center justify-center font-mono font-bold text-slate-300">
                            {u.username[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200 flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/60 px-1.5 py-0.2 rounded font-mono">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">{u.displayName || u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={u.role === 'ADMIN' ? 'indigo' : 'slate'} size="sm">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {u.termsAccepted ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>v1.0.0</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-mono text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleToggleRole(u)}
                            disabled={isCurrent && u.role === 'ADMIN' && users.filter((x) => x.role === 'ADMIN').length <= 1}
                            title={u.role === 'ADMIN' ? 'Demote to USER' : 'Promote to ADMIN'}
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                          </Button>

                          {!isCurrent && (
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleDeleteUser(u)}
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
