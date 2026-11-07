import React, { useEffect, useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { VersionTimeline } from './components/VersionTimeline';
import { VersionDiffViewer } from './components/VersionDiffViewer';
import { GenerationAuditLogs } from './components/GenerationAuditLogs';
import { mockApi } from '../../services/mock/mockApiService';
import { api } from '@/services/api/apiClient';
import { RepairIteration } from '@shared/core';
import { History, GitBranch } from 'lucide-react';

export const ProjectHistoryPage: React.FC = () => {
  const [historyVersions, setHistoryVersions] = useState<any[]>([]);
  const [repairIterations, setRepairIterations] = useState<RepairIteration[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('0.3.0');

  useEffect(() => {
    mockApi.getProjectHistory().then((v) => {
      setHistoryVersions(v);
      if (v[0]) setSelectedVersion(v[0].version);
    });
    api.getRepairs().then(setRepairIterations);
  }, []);

  return (
    <PageContainer
      title="Project Version History & Audit Trail"
      subtitle="Complete chronological record of prompt iterations, code generation commits, and verification status."
      action={
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-canvas-900 px-3 py-1.5 rounded-md border border-border-default">
          <GitBranch className="w-4 h-4 text-cyan-400" />
          <span>Active Lineage:</span>
          <span className="text-cyan-300 font-bold">main (3 versions)</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
            Autonomous Generation Milestones
          </h3>
          <VersionTimeline
            versions={historyVersions}
            selectedVersion={selectedVersion}
            onSelectVersion={setSelectedVersion}
          />
          <GenerationAuditLogs />
        </div>

        {/* Right Column: Code & AST Diff Viewer */}
        <div className="space-y-4">
          <VersionDiffViewer
            repairIterations={repairIterations}
            selectedVersion={selectedVersion}
          />
        </div>
      </div>
    </PageContainer>
  );
};

