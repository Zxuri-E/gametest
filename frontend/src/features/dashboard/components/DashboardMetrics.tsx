import React from 'react';
import { Gamepad2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MetricCard } from '../../../components/ui/MetricCard';

export interface DashboardMetricsProps {
  totalProjects: number;
  totalGamesGenerated: number;
  totalTestsExecuted: number;
  verificationRate: number;
}

export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalProjects,
  totalGamesGenerated,
  totalTestsExecuted,
  verificationRate,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Active Projects"
        value={totalProjects}
        subValue="in workspace"
        icon={<Gamepad2 className="w-4 h-4" />}
        accentColor="indigo"
      />
      <MetricCard
        title="Games Generated"
        value={totalGamesGenerated}
        subValue="autonomous builds"
        icon={<Sparkles className="w-4 h-4" />}
        trend={{ value: '+4 this week', isPositive: true }}
        accentColor="cyan"
      />
      <MetricCard
        title="Tests Executed"
        value={totalTestsExecuted}
        subValue="automated assertions"
        icon={<CheckCircle2 className="w-4 h-4" />}
        accentColor="emerald"
      />
      <MetricCard
        title="Verification Rate"
        value={`${verificationRate}%`}
        subValue="test suite pass"
        icon={<ShieldCheck className="w-4 h-4" />}
        trend={{ value: '+12.5%', isPositive: true }}
        accentColor="emerald"
      />
    </div>
  );
};
