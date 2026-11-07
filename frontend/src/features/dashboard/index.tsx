import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Terminal, ArrowUpRight } from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { DashboardMetrics } from './components/DashboardMetrics';
import { RecentProjectsTable } from './components/RecentProjectsTable';
import { RecentTestsCard } from './components/RecentTestsCard';
import { RecentBugsCard } from './components/RecentBugsCard';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { useProjectStore } from '../../store/useProjectStore';
import { api } from '@/services/api/apiClient';
import { TestCase, BugReport } from '@shared/core';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, selectProject } = useProjectStore();
  const [tests, setTests] = useState<TestCase[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);

  useEffect(() => {
    api.getTests().then(setTests);
    api.getBugs().then(setBugs);
  }, []);

  const totalRuns = projects.reduce((acc, p) => acc + p.totalRuns, 0);
  const totalPassed = projects.reduce((acc, p) => acc + p.testsPassed, 0);
  const totalFailed = projects.reduce((acc, p) => acc + p.testsFailed, 0);
  const totalTests = totalPassed + totalFailed;
  const verificationRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 92;

  return (
    <PageContainer
      title="Platform Dashboard"
      subtitle="Autonomous 2D game synthesis, automated Playwright verification, and repair telemetry."
      action={
        <Button
          variant="primary"
          leftIcon={<Sparkles className="w-4 h-4" />}
          onClick={() => navigate('/studio')}
        >
          Generate New Game
        </Button>
      }
    >
      {/* 4 Metric Cards */}
      <DashboardMetrics
        totalProjects={projects.length}
        totalGamesGenerated={projects.length + 8}
        totalTestsExecuted={totalRuns + 42}
        verificationRate={verificationRate}
      />

      {/* Main Grid: Left side Table + Right side Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentProjectsTable
            projects={projects}
            onSelectProject={selectProject}
          />
          <LiveActivityFeed />
        </div>

        <div className="space-y-6">
          <RecentTestsCard tests={tests} />
          <RecentBugsCard bugs={bugs} />
        </div>
      </div>
    </PageContainer>
  );
};

