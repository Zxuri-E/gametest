import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, ArrowRight, Loader2, Gamepad2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useStudioStore } from '../../../store/useStudioStore';

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
  const { genre, theme } = useStudioStore();
  const isDone = progressPercent >= 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isDone || !!error ? onClose : () => {}}
      title="Autonomous AI Game Generation Pipeline"
      description="Orchestrating Live LLM Generator, Kinematic Reachability Solver, and Phaser 3 Runtime"
      maxWidth="lg"
      footer={
        isDone ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400 font-mono">
              Status: <strong className="text-emerald-400">Specification Validated</strong>
            </span>
            <Button
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => {
                onClose();
                navigate('/workspace');
              }}
              className="shadow-lg shadow-cyan-500/20"
            >
              Open in Workspace (Ready to Play)
            </Button>
          </div>
        ) : error ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>Generating Specification with Live Coding LLM...</span>
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
        <div className="p-3.5 rounded-lg bg-canvas-950 border border-border-subtle space-y-2 text-xs font-mono">
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
            <span>Scene Hierarchy & Kinematic Reachability Validation</span>
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
            <span>Phaser 3 Runtime Bundle Initialized</span>
          </div>
        </div>

        {/* Live Generation Summary Card */}
        {isDone && (
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>
                Game synthesized: <strong className="text-white capitalize">{genre}</strong> (Theme:{' '}
                <strong className="text-white">{theme}</strong>)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
              100% Validated
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};
