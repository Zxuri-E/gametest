import React, { useEffect, useMemo } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { BugFiltersBar } from './components/BugFiltersBar';
import { BugReportsTable } from './components/BugReportsTable';
import { BugDetailModal } from './components/BugDetailDrawer';
import { AutoRepairModal } from './components/AutoRepairModal';
import { useBugStore } from '../../store/useBugStore';
import { Bug, ShieldAlert } from 'lucide-react';

export const BugReportsPage: React.FC = () => {
  const {
    bugs,
    selectedBug,
    filterSeverity,
    filterCategory,
    filterStatus,
    searchQuery,
    isRepairing,
    repairResult,
    fetchBugs,
    setSelectedBug,
    setFilterSeverity,
    setFilterCategory,
    setFilterStatus,
    setSearchQuery,
    updateBugStatus,
    triggerAutoRepair,
    clearRepairResult,
  } = useBugStore();

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  const filteredBugs = useMemo(() => {
    return bugs.filter((bug) => {
      const matchSearch =
        searchQuery === '' ||
        bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.affectedMechanic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bug.suspectedSourceLocation.file.toLowerCase().includes(searchQuery.toLowerCase());

      const matchSeverity =
        filterSeverity === 'all' || bug.severity === filterSeverity;

      const matchCategory =
        filterCategory === 'all' || bug.category === filterCategory;

      const matchStatus =
        filterStatus === 'all' || bug.repairStatus === filterStatus;

      return matchSearch && matchSeverity && matchCategory && matchStatus;
    });
  }, [bugs, searchQuery, filterSeverity, filterCategory, filterStatus]);

  const openCount = bugs.filter((b) => b.repairStatus === 'open').length;

  return (
    <PageContainer
      title="Automated Bug Diagnostics & Repair"
      subtitle="Diagnostician agent anomaly detection, suspected source localization, and surgical AST patches."
      action={
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-canvas-900 px-3 py-1.5 rounded-md border border-border-default">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Active Defect Queue:</span>
          <span className="text-rose-400 font-bold">{openCount} Unresolved</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters and Search */}
        <BugFiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          severity={filterSeverity}
          onSeverityChange={setFilterSeverity}
          category={filterCategory}
          onCategoryChange={setFilterCategory}
          status={filterStatus}
          onStatusChange={setFilterStatus}
        />

        {/* Bug Reports Table */}
        <BugReportsTable
          bugs={filteredBugs}
          onSelectBug={setSelectedBug}
          onTriggerRepair={triggerAutoRepair}
        />
      </div>

      {/* Inspect Bug Detail Modal */}
      <BugDetailModal
        bug={selectedBug}
        onClose={() => setSelectedBug(null)}
        onUpdateStatus={updateBugStatus}
        onTriggerRepair={triggerAutoRepair}
        isRepairing={isRepairing}
      />

      {/* Auto Repair Result Diff Modal */}
      <AutoRepairModal
        iteration={repairResult?.iteration || null}
        onClose={clearRepairResult}
      />
    </PageContainer>
  );
};

