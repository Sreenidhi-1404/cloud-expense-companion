import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  HardDrive,
  Lock,
  LogOut,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Server,
  Key,
  X,
  PieChart as PieChartIcon,
  Search,
  ExternalLink
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ManagedUser {
  id: string;
  maskedEmail: string;
  provider: 'google.com' | 'password' | 'microsoft.com' | 'apple.com';
  status: 'Active' | 'Suspended' | 'Flagged';
  registeredAt: string;
  lastActive: string;
  totalExpensesLogged: number;
}

interface AdminMetrics {
  totalRegisteredUsers: number;
  activeAccounts: number;
  suspendedAccounts: number;
  systemProcessedVolume: number;
  averageTransactionSize: number;
  cloudStorageUsedBytes: number;
  receiptsStoredCount: number;
  totalSecurityAuditEvents: number;
  uptimeSeconds: number;
  systemHealth: string;
  categoryAggregates: Array<{
    category: string;
    percentage: number;
    systemTotal: number;
  }>;
}

interface AuditLogEvent {
  id: string;
  type: string;
  description: string;
  userEmail: string;
  ip: string;
  severity: 'info' | 'warning' | 'security';
  timestamp: string;
}

export const AdminDashboard: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>('admin@expensecompanion.internal');
  const [passkeyInput, setPasskeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [adminToken, setAdminToken] = useState<string>('');

  // Auto-authenticate if admin_token exists in session storage
  useEffect(() => {
    if (isOpen) {
      const savedToken = sessionStorage.getItem('admin_token');
      if (savedToken) {
        setAdminToken(savedToken);
        setIsAdminAuthenticated(true);
        fetchAdminData(savedToken);
      }
    }
  }, [isOpen]);

  // Dashboard Data
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'security' | 'storage'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: adminEmailInput,
          passkey: passkeyInput 
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid administrator credentials.');
      }

      sessionStorage.setItem('admin_token', data.token);
      setAdminToken(data.token);
      setIsAdminAuthenticated(true);
      fetchAdminData(data.token);
    } catch (err: any) {
      setAuthError(err.message || 'Administrator authorization failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch Admin Data
  const fetchAdminData = async (token = adminToken) => {
    if (!token) return;
    setDataLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [metricsRes, usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/audit-logs', { headers }),
      ]);

      if (metricsRes.ok) {
        const mData = await metricsRes.json();
        setMetrics(mData.data);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        setAuditLogs(lData.logs);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  // Toggle user status (Active <-> Suspended)
  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId, newStatus }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAdminAuthenticated(false);
    setAdminToken('');
    setPasskeyInput('');
  };

  const filteredUsers = users.filter((u) =>
    u.maskedEmail.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div id="admin-dashboard-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  Administrator Portal
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  Role: Administrator
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                System observability, security audit events, and user account management
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdminAuthenticated && (
              <>
                <button
                  onClick={() => fetchAdminData()}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Refresh metrics"
                >
                  <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleAdminLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isAdminAuthenticated ? (
          /* Authentication Gate */
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50/30 dark:bg-slate-950/30">
            <div className="max-w-md w-full bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-3xl p-7 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Administrator Portal Login
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Access requires verified administrator credentials. Normal user accounts cannot access administrative functionality.
                </p>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@expensecompanion.internal"
                    value={adminEmailInput}
                    onChange={(e) => setAdminEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Administrator Security Passkey
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="password"
                      required
                      placeholder="Enter administrator passkey..."
                      value={passkeyInput}
                      onChange={(e) => setPasskeyInput(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{authLoading ? 'Verifying Credentials...' : 'Authenticate as Administrator'}</span>
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Privacy Assurance:</span>
                Administrator accounts can inspect system health and aggregated totals, but cannot inspect individual private user transactions without judicial audit authorization.
              </div>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Dashboard Workspace */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Tab Navigation */}
            <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex space-x-2 bg-slate-50/30 dark:bg-slate-900/30">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>System Metrics & Aggregates</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Account Management ({users.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Audit & Security Logs ({auditLogs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('storage')}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'storage'
                    ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HardDrive className="w-4 h-4" />
                <span>Cloud Storage & Infrastructure</span>
              </button>
            </div>

            {/* Scrollable Tab Views */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
              {/* TAB 1: SYSTEM METRICS */}
              {activeTab === 'metrics' && metrics && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Users</span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                          {metrics.totalRegisteredUsers}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{metrics.activeAccounts} active
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">System Processed Volume</span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                          ₹{metrics.systemProcessedVolume.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Aggregated across all users</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Average Transaction Size</span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                          ₹{metrics.averageTransactionSize.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Mean expense entry size</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">System Health & Uptime</span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          {metrics.systemHealth}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Uptime: {Math.round(metrics.uptimeSeconds / 60)} minutes</span>
                    </div>
                  </div>

                  {/* Aggregated Spending Distribution (Privacy Safe) */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          System-Level Expense Category Breakdown (Aggregated)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Aggregated metrics protect user privacy: individual personal ledgers are strictly hidden.
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                        Privacy Shield Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {metrics.categoryAggregates.map((cat) => (
                        <div key={cat.category} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                          <div className="flex justify-between items-center text-xs mb-1.5 font-semibold">
                            <span>{cat.category}</span>
                            <span className="text-rose-600 dark:text-rose-400 font-bold">{cat.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden mb-2">
                            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${cat.percentage}%` }} />
                          </div>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            Volume: ₹{cat.systemTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: USER ACCOUNT MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative max-w-xs w-full">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search masked email or user ID..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <span className="text-xs text-slate-400">
                      Showing {filteredUsers.length} accounts
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">User ID</th>
                          <th className="py-3 px-4">Masked Identity</th>
                          <th className="py-3 px-4">Auth Provider</th>
                          <th className="py-3 px-4">Registration</th>
                          <th className="py-3 px-4">Account Status</th>
                          <th className="py-3 px-4 text-right">Admin Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{u.id}</td>
                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{u.maskedEmail}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 text-[10px] rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {u.provider}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400">{u.registeredAt}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  u.status === 'Active'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {u.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleToggleStatus(u.id, u.status)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                  u.status === 'Active'
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                                }`}
                              >
                                {u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT & SECURITY LOGS */}
              {activeTab === 'security' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Authentication and authorization events are audited continuously. Security checks prevent unauthorized horizontal privilege escalation between users.
                    </span>
                  </div>

                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                log.severity === 'security'
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                  : log.severity === 'warning'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              }`}
                            >
                              {log.type}
                            </span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {log.description}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                            <span>User: {log.userEmail}</span>
                            <span>IP: {log.ip}</span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DATABASE & INFRASTRUCTURE */}
              {activeTab === 'storage' && metrics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Primary Database</span>
                      <div className="mt-1 font-mono text-xs text-slate-900 dark:text-slate-100 truncate">
                        Cloud Database (Live Connected)
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                        ● Online (Secure Document Store)
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Collections Managed</span>
                      <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        5 Collections
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">users, expenses, incomes, budgets, goals</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                      <span className="text-[11px] font-bold uppercase text-slate-400">Database Engine</span>
                      <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-slate-100">
                        High-Performance BSON
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">Real-time persistence layer</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                      Database Architecture & Enterprise Storage
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      The application is powered by a resilient, full-stack architecture with schema validation and user isolation.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active Primary
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mt-2">Cloud Document Store</h5>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Collections for expenses, incomes, budgets, and savings goals with RESTful controllers.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Adapter Ready
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mt-2">Amazon Web Services (AWS)</h5>
                        <p className="text-[11px] text-slate-400 mt-1">
                          DynamoDB single-table schema + Amazon S3 pre-signed receipt uploads.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Adapter Ready
                        </span>
                        <h5 className="font-bold text-slate-900 dark:text-slate-100 mt-2">Microsoft Azure</h5>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Azure Cosmos DB SQL API + Azure Blob Storage with Hot-tier SAS tokens.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
