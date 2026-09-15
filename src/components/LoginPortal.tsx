import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Zap, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  ArrowRight,
  Server,
  Activity,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TylLogo } from './TylLogo';

export const LoginPortal: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both your authorized username and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(username.trim(), password, rememberMe);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication denied. Please verify your credentials.');
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage(null);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans select-none">
      {/* Background Decorative Gradients & Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Cyber Grid Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand & Platform Emblem */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shadow-indigo-950/40">
            <TylLogo size="xl" showText={false} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <span>TYL Traffic</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO v4.2
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Techyard Labs • Enterprise Traffic Orchestration
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-medium">Cluster Mesh Ready</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono">Empowered by Innovation</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Lock className="h-4 w-4 text-indigo-400" />
              <span>Operator Authorization</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">SEC-ID: #AUTH-01</span>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Identifier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Username or Email</span>
                <span className="text-[10px] text-slate-500 font-normal">Registered Operator</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="auth-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or techyardlabs@gmail.com"
                  autoComplete="username"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Access Passkey
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/40 h-3.5 w-3.5"
                />
                <span>Persist session on this device</span>
              </label>

              <span className="text-[11px] text-indigo-400/80 font-mono">7-Day Token</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-auth-submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-indigo-200" />
                  <span>Authorize &amp; Enter Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick-Access Credentials helper badge */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-amber-400" />
                <span>Default Initial Credentials:</span>
              </span>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'Spark@Admin2025!')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline text-[11px]"
              >
                Auto-fill
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
              <div className="flex items-center justify-between">
                <span>User: <strong className="text-white">admin</strong> (or <strong className="text-white">techyardlabs@gmail.com</strong>)</span>
                <button
                  type="button"
                  onClick={() => handleCopy('admin', 'user')}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {copiedKey === 'user' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span>Pass: <strong className="text-amber-300">Spark@Admin2025!</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('Spark@Admin2025!', 'pass')}
                  className="text-slate-500 hover:text-slate-300"
                >
                  {copiedKey === 'pass' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              To customize the credentials in production, set <code className="text-indigo-300">ADMIN_USERNAME</code> and <code className="text-indigo-300">ADMIN_PASSWORD</code> in your environment variables, or change them inside the dashboard under your account profile.
            </p>
          </div>

        </div>

        {/* Security Footer Details */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>Encrypted Session</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-indigo-500/70" />
            <span>Brute-Force Shield Active</span>
          </div>
        </div>

      </div>
    </div>
  );
};
