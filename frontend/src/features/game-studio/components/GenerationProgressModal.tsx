import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface GenerationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepText: string;
  progressPercent: number;
  error: string | null;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  isOpen,
  onClose,
  stepText,
  progressPercent,
  error,
}) => {
  const navigate = useNavigate();
  const isDone = progressPercent >= 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDone || !!error ? onClose : () => {}}
      title="Autonomous AI Game Generation Pipeline"
      description="Orchestrating LLM Generator, Test Planner, and Phaser 3 Runtime Adapters"
      maxWidth="lg"
      footer={
        isDone ? (
          <Button
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => {
              onClose();
              navigate('/workspace');
            }}
          >
            Launch in Workspace
          </Button>
        ) : error ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Simulating Autonomous Synthesis Pipeline...</span>
          </div>
        )
      }
    >
      <div className="space-y-5 py-2">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-medium">{stepText}</span>
            <span className="text-cyan-400 font-semibold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-canvas-950 rounded-full overflow-hidden border border-border-default">
            <div
              className={`h-full transition-all duration-300 ${
                error
                  ? 'bg-rose-500'
                  : isDone
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Checkpoints */}
        <div className="p-3 rounded bg-canvas-950 border border-border-subtle space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            {progressPercent >= 35 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
            )}
            <span>Spec Generation & Physics Matrix Extraction</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            {progressPercent >= 65 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
            )}
            <span>Scene Hierarchy & Entity Mechanics Synthesis</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            {progressPercent >= 85 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
            )}
            <span>Playwright Automated Verification Plan Synthesis</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            {progressPercent >= 100 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-slate-600 shrink-0" />
            )}
            <span>Phaser 3 Engine Bundle Ready</span>
          </div>
        </div>

        {/* Notice of simulated operation */}
        <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <strong>Simulated Generation:</strong> The frontend is simulating the backend agent orchestrator. Once the full backend is active, this will trigger the real multi-agent generation pipeline.
          </span>
        </div>
      </div>
    </Modal>
  );
};

