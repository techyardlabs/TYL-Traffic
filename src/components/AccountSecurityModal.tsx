import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Lock, 
  LogOut, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TylLogo } from './TylLogo';

interface AccountSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSecurityModal: React.FC<AccountSecurityModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusNotice, setStatusNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    if (newPassword !== confirmPassword) {
      setStatusNotice({ success: false, message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setStatusNotice({ success: false, message: 'New password must be at least 8 characters long' });
      return;
    }

    setIsUpdating(true);
    const result = await changePassword(oldPassword, newPassword);
    setIsUpdating(false);

    setStatusNotice(result);
    if (result.success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatusNotice(null), 4000);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/80 overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <TylLogo size="sm" showText={false} />
            <div>
              <h3 className="text-sm font-bold text-white">TYL Traffic • Security</h3>
              <p className="text-[11px] text-slate-400">Techyard Labs Workstation Profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Operator Identity Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{user?.username || 'admin'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30 uppercase">
                      {user?.role || 'Super Admin'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{user?.email || 'techyardlabs@gmail.com'}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>Session Active</span>
              </span>
              <span className="text-emerald-400">Authorized</span>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Update Operator Passkey
              </h4>
            </div>

            {statusNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusNotice.success 
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/60' 
                  : 'bg-red-950/40 text-red-300 border border-red-900/60'
              }`}>
                {statusNotice.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                )}
                <span>{statusNotice.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New strong password"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                {isUpdating ? 'Saving Passkey...' : 'Update Passkey'}
              </button>
            </form>
          </div>

          {/* Logout Section */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-300">Terminate Session</div>
              <div className="text-[10px] text-slate-500">Sign out of this cluster workstation</div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
