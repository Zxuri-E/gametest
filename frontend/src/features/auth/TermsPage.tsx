import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Terminal, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const TermsPage: React.FC = () => {
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
            <span className="text-xs font-mono text-slate-400">NOVUS LEGAL AGREEMENT v1.0.0</span>
          </div>
        </div>

        <div className="bg-canvas-900 border border-border-default rounded-xl p-8 shadow-xl shadow-black/40 space-y-6">
          <div className="border-b border-border-subtle pb-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded-md mb-3">
              <FileText className="w-3.5 h-3.5" />
              <span>TERMS OF SERVICE</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">Novus Platform Terms of Service</h1>
            <p className="mt-1 text-xs text-slate-400">Effective Date: November 8, 2026 • Document Revision 1.0.0</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              1. Platform Purpose & Scope
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Novus is an AI-powered 2D game generation, deterministic synthesis, and autonomous verification platform. By accessing or using the Novus platform, you agree to abide by these Terms of Service. If you do not agree to these terms, you may not register, access, or utilize the platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              2. User Accounts & Responsibilities
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Users must provide accurate information when registering an account. You are solely responsible for maintaining the confidentiality of your session credentials and for any activities conducted through your account. Novus utilizes cryptographically secured, salted hashes (scrypt) to store credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              3. AI Generation & Code Ownership
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Game specifications, Phaser 3 scenes, and synthetic test suites generated via the Novus platform based on your natural-language prompts are owned by you. You may export standalone HTML builds, modify runtime parameters, and distribute generated games freely under your own license.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              4. Prohibited Uses & Safety Bounds
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Users may not utilize the platform to generate malicious payloads, execute denial-of-service simulations against unauthorized targets, or bypass sandbox constraints. Automated testing drivers are restricted strictly to canvas and local game runtime endpoints.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              5. Disclaimer of Warranties & System Availability
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Novus is provided "as is" and "as available" without warranties of any kind. While automated repair pipelines strive to correct identified defects, no guarantee is made that all algorithmic bugs will be resolved autonomously.
            </p>
          </section>

          <div className="pt-6 border-t border-border-subtle flex items-center justify-between">
            <Link to="/privacy" className="text-xs text-cyan-400 hover:underline">
              Read Privacy Policy →
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
