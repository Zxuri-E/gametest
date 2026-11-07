import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PhaserGameView } from './components/PhaserGameView';
import { GameControlsBar } from './components/GameControlsBar';
import { GameInspectorPanel } from './components/GameInspectorPanel';
import { GameMetadataCard } from './components/GameMetadataCard';
import { useProjectStore } from '../../store/useProjectStore';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Download, Terminal, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api/apiClient';

export const GameWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject, activeSpec, updateActiveSpec } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportProject = async (offline = true) => {
    if (!activeProject) return;
    setIsExporting(true);
    try {
      const exportData = await api.exportProject(activeProject.id, offline);
      // Create downloadable HTML file in browser
      const blob = new Blob([exportData.standaloneHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.fileName || `${activeProject.name.toLowerCase().replace(/\s+/g, '-')}-standalone.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export game:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer
      title="Game Workspace & Runtime Inspector"
      subtitle="Interactive 2D Phaser 3 execution environment, live physics telemetry, and entity inspector."
      action={
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={exportSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
            isLoading={isExporting}
            onClick={() => handleExportProject(true)}
            title="Exports a self-contained HTML file with embedded Phaser engine that runs 100% offline."
          >
            {exportSuccess ? 'Exported!' : 'Export Offline HTML (Embedded Engine)'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExportProject(false)}
            title="Lightweight 5KB HTML file that loads Phaser 3 from CDN."
          >
            Export CDN HTML
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => navigate('/testing')}
          >
            Verify in Testing Center
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Project Header Information */}
        <GameMetadataCard project={activeProject} />

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Phaser 3 Canvas & Playback Bar */}
          <div className="lg:col-span-2 space-y-3">
            <PhaserGameView spec={activeSpec} />
            <GameControlsBar />

            {/* Interaction Keyboard Instructions Bar */}
            <div className="p-3 rounded-lg bg-canvas-900 border border-border-default flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Controls:</span>
              </span>
              <div className="flex items-center gap-3">
                {activeSpec?.genre === 'top-down' ? (
                  <span>8-Way Navigation: <strong className="text-slate-200">W / A / S / D or Arrow Keys</strong></span>
                ) : activeSpec?.genre === 'endless-runner' ? (
                  <span>Jump / Dodge: <strong className="text-slate-200">W / Space / Up Arrow</strong></span>
                ) : (
                  <>
                    <span>Move: <strong className="text-slate-200">A / D / ← / →</strong></span>
                    <span>Variable Jump: <strong className="text-slate-200">W / Space / ↑</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Telemetry & Live Inspector */}
          <div>
            <GameInspectorPanel
              spec={activeSpec}
              onUpdateSpec={updateActiveSpec}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
