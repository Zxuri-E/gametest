import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, PlayCircle } from 'lucide-react';
import { TestCase } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface RecentTestsCardProps {
  tests: TestCase[];
}

export const RecentTestsCard: React.FC<RecentTestsCardProps> = ({ tests }) => {
  const navigate = useNavigate();

  return (
    <Card
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">Recent Verification Tests</h3>
          </div>
          <Button
            variant="ghost"
            size="xs"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/testing')}
          >
            Open Suite
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {tests.slice(0, 5).map((test) => {
          const isPassed = test.status === 'passed';
          return (
            <div
              key={test.id}
              onClick={() => navigate('/testing')}
              className="flex items-center justify-between p-2.5 rounded bg-canvas-850/50 border border-border-subtle hover:border-border-hover cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <div className="truncate">
                  <p className="text-xs font-medium text-slate-200 truncate">{test.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{test.mechanic}</p>
                </div>
              </div>
              <div className="text-right shrink-0 font-mono text-[11px]">
                <span className={isPassed ? 'text-emerald-400' : 'text-rose-400'}>
                  {test.durationMs ? `${test.durationMs}ms` : 'pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

