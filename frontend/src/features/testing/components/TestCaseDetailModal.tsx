import React from 'react';
import { TestCase } from '@shared/core';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, XCircle, Terminal, AlertTriangle, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestCaseDetailModalProps {
  test: TestCase | null;
  onClose: () => void;
}

export const TestCaseDetailModal: React.FC<TestCaseDetailModalProps> = ({ test, onClose }) => {
  const navigate = useNavigate();
  if (!test) return null;

  const isFailed = test.status === 'failed';

  return (
    <Modal
      isOpen={!!test}
      onClose={onClose}
      title={test.name}
      description={`Automated scenario for mechanic: ${test.mechanic}`}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-xs font-mono text-slate-400">
            Duration: <span className="text-cyan-400">{test.durationMs || 0}ms</span>
          </div>
          <div className="flex items-center gap-2">
            {isFailed && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Bug className="w-4 h-4" />}
                onClick={() => {
                  onClose();
                  navigate('/bugs');
                }}
              >
                Inspect Associated Bug Report
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Test Summary Status Banner */}
        <div className="p-3 rounded-lg bg-canvas-950 border border-border-default flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isFailed ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Verification Result: {test.status.toUpperCase()}
              </span>
              <p className="text-[11px] text-slate-400">{test.description}</p>
            </div>
          </div>
          <Badge variant={isFailed ? 'rose' : 'emerald'} size="sm">
            {test.assertions.filter((a) => a.passed).length} / {test.assertions.length} Passed
          </Badge>
        </div>

        {/* Failure Message Callout */}
        {test.errorMessage && (
          <div className="p-3.5 rounded bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 font-mono space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Assertion Failure Exception:</span>
            </div>
            <p className="text-[11px] pl-5 leading-relaxed">{test.errorMessage}</p>
          </div>
        )}

        {/* Step-by-Step Assertions List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Verification Step Assertions
          </h4>
          <div className="space-y-2">
            {test.assertions.map((assertion, index) => (
              <div
                key={assertion.id}
                className="p-3 rounded bg-canvas-950 border border-border-subtle flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 shrink-0">
                  {assertion.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">
                      Step {index + 1}: {assertion.description}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                        assertion.passed
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-rose-950 text-rose-300'
                      }`}
                    >
                      {assertion.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-canvas-900 p-2 rounded border border-border-subtle">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Expected:</span>
                      <span className="text-cyan-300">{assertion.expected}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Actual Value:</span>
                      <span className={assertion.passed ? 'text-emerald-300' : 'text-rose-400'}>
                        {assertion.actual || 'undefined'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

