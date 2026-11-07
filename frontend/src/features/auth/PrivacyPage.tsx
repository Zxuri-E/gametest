import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Terminal, Lock, EyeOff, Server, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-canvas-950 text-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Studio</span>
          </Link>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-slate-400">NOVUS PRIVACY COMMITMENT v1.0.0</span>
          </div>
        </div>

        <div className="bg-canvas-900 border border-border-default rounded-xl p-8 shadow-xl shadow-black/40 space-y-6">
          <div className="border-b border-border-subtle pb-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>PRIVACY POLICY</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Novus Privacy Policy & Security Standard</h1>
            <p className="mt-1 text-xs text-slate-400">Effective Date: November 8, 2026 • Document Revision 1.0.0</p>
          </div>

          {/* Core Zero-Keystroke Surveillance Guarantee Box */}
          <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-700/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <EyeOff className="w-4 h-4" />
              <span>Absolute Zero-Keystroke Surveillance Guarantee</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              Novus enforces a strict engineering principle: <strong>Zero Keystroke Surveillance</strong>. The Novus platform never records, intercepts, buffers, or analyzes user keystrokes, password typing cadences, or unsubmitted form interactions. Your inputs are processed exclusively upon deliberate user form submission.
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              1. Information We Collect
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We collect only the information necessary to fulfill platform operations:
            </p>
            <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5">
              <li><strong>Account Credentials:</strong> Username and salted cryptographic password hashes (scrypt, 64-byte derived keys). Plaintext passwords are never stored or logged.</li>
              <li><strong>Project Data:</strong> Game specifications, natural-language prompts, test results, and defect logs associated with your workspace.</li>
              <li><strong>Session Identifiers:</strong> Random 256-bit cryptographically secure session tokens transmitted over HttpOnly, SameSite cookies.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              2. Data Storage & Telemetry Boundaries
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Game runtime telemetry (FPS, physics step times, collision counters) is collected purely inside your active browser session for the purpose of automated test assertion verification. No personal identity data is attached to physics telemetry.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              3. AI Model Interaction Boundaries
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prompts submitted for game generation and code snippets submitted for diagnostic repair are communicated strictly to your configured LLM endpoints. Novus does not resell, train public models upon, or publicly expose your private prompt specifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              4. Cookies and Storage Controls
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Novus does not use third-party advertising cookies or cross-site tracking beacons. Cookies are strictly confined to session authentication (<code className="text-cyan-300">novus_session</code>). You may revoke your session at any time by selecting "Sign Out".
            </p>
          </section>

          <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
            <Link to="/terms" className="text-xs text-cyan-400 hover:underline">
              ← Read Terms of Service
            </Link>
            <Button variant="secondary" size="sm" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
