import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

interface BugFiltersBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  severity: string;
  onSeverityChange: (s: string) => void;
  category: string;
  onCategoryChange: (c: string) => void;
  status: string;
  onStatusChange: (st: string) => void;
}

export const BugFiltersBar: React.FC<BugFiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  severity,
  onSeverityChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
}) => {
  return (
    <div className="p-4 rounded-lg bg-canvas-900 border border-border-default flex flex-col md:flex-row items-center gap-3">
      <div className="flex-1 w-full">
        <Input
          placeholder="Search bugs by mechanic, file, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          className="bg-canvas-950"
        />
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
        <div className="w-36">
          <Select
            value={severity}
            onChange={(e) => onSeverityChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
        </div>

        <div className="w-36">
          <Select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'physics', label: 'Physics' },
              { value: 'collision', label: 'Collision' },
              { value: 'state', label: 'State & Memory' },
              { value: 'render', label: 'Render' },
              { value: 'game-loop', label: 'Game Loop' },
            ]}
          />
        </div>

        <div className="w-40">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Repair States' },
              { value: 'open', label: 'Open' },
              { value: 'diagnosing', label: 'Diagnosing' },
              { value: 'patch-in-progress', label: 'Patch in Progress' },
              { value: 'verified-fixed', label: 'Verified Fixed' },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

