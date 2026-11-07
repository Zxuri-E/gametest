import React, { useEffect } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { TestExecutionSummary } from './components/TestExecutionSummary';
import { TestCaseList } from './components/TestCaseList';
import { TestCaseDetailModal } from './components/TestCaseDetailModal';
import { AgentActivityStream } from './components/AgentActivityStream';
import { TestExecutionHistory } from './components/TestExecutionHistory';
import { useTestingStore } from '../../store/useTestingStore';
import { Tabs } from '../../components/ui/Tabs';

export const TestingCenterPage: React.FC = () => {
  const {
    testCases,
    isRunningTests,
    selectedTestCase,
    agentStatuses,
    filterMechanic,
    fetchTests,
    runAllTests,
    triggerControlledDefect,
    setSelectedTestCase,
    setFilterMechanic,
  } = useTestingStore();

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const passedCount = testCases.filter((t) => t.status === 'passed').length;
  const failedCount = testCases.filter((t) => t.status === 'failed').length;

  const mechanicsFilterTabs = [
    { id: 'all', label: 'All Mechanics', badge: testCases.length },
    { id: 'player-movement', label: 'Movement' },
    { id: 'jumping', label: 'Jumping' },
    { id: 'platform-collision', label: 'Platform Collision' },
    { id: 'collectibles', label: 'Collectibles' },
    { id: 'level-completion', label: 'Completion / Reset' },
  ];

  return (
    <PageContainer
      title="Automated Testing & Verification Center"
      subtitle="Playwright browser-level test runner, state matrix assertions, and automated playtester agents."
    >
      <div className="space-y-6">
        {/* Top Metric & Control Bar */}
        <TestExecutionSummary
          total={testCases.length}
          passed={passedCount}
          failed={failedCount}
          running={isRunningTests ? 2 : 0}
          isRunning={isRunningTests}
          onRunAll={runAllTests}
          onTriggerDefect={triggerControlledDefect}
        />

        {/* Filter Tabs */}
        <div className="border-b border-border-subtle pb-1">
          <Tabs
            tabs={mechanicsFilterTabs}
            activeTab={filterMechanic}
            onChange={setFilterMechanic}
            variant="underline"
          />
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Synthesized Playwright Test Cases ({testCases.length})
            </h3>
            <TestCaseList
              testCases={testCases}
              onSelectTest={setSelectedTestCase}
              filterMechanic={filterMechanic}
            />
          </div>

          <div className="space-y-6">
            <AgentActivityStream agentStatuses={agentStatuses} />
            <TestExecutionHistory />
          </div>
        </div>
      </div>

      {/* Test Case Inspection Modal */}
      <TestCaseDetailModal
        test={selectedTestCase}
        onClose={() => setSelectedTestCase(null)}
      />
    </PageContainer>
  );
};

