import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Terminal, Cpu, Database } from 'lucide-react';

export const GenerationAuditLogs: React.FC = () => {
  const auditLogs = [
    {
      id: 'aud-1',
      timestamp: '2026-11-05 14:30:12',
      model: 'claude-3-5-sonnet-20241022',
      inputTokens: 1420,
      outputTokens: 3840,
      durationMs: 2450,
      stage: 'Phaser AST Code Synthesis',
    },
    {
      id: 'aud-2',
      timestamp: '2026-11-05 14:30:15',
      model: 'claude-3-5-haiku-20241022',
      inputTokens: 2100,
      outputTokens: 1950,
      durationMs: 1210,
      stage: 'Playwright Test Matrix Synthesis',
    },
    {
      id: 'aud-3',
      timestamp: '2026-11-04 15:45:00',
      model: 'claude-3-5-sonnet-20241022',
      inputTokens: 890,
      outputTokens: 520,
      durationMs: 890,
      stage: 'Diagnostician AST Repair Patch',
    },
  ];

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
            LLM Generation Audit & Token Telemetry
          </h3>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-5 -my-5">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-canvas-950/80 border-b border-border-subtle text-slate-500 text-[10px] uppercase">
            <tr>
              <th className="py-2.5 px-5">Timestamp</th>
              <th className="py-2.5 px-3">Synthesis Stage</th>
              <th className="py-2.5 px-3">Model</th>
              <th className="py-2.5 px-3 text-right">Tokens</th>
              <th className="py-2.5 px-5 text-right">Latency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-canvas-850/40">
                <td className="py-2.5 px-5 text-slate-400">{log.timestamp}</td>
                <td className="py-2.5 px-3 text-slate-200 font-sans">{log.stage}</td>
                <td className="py-2.5 px-3 text-cyan-300">{log.model}</td>
                <td className="py-2.5 px-3 text-right text-slate-300">
                  {log.inputTokens + log.outputTokens}
                </td>
                <td className="py-2.5 px-5 text-right text-amber-400">{log.durationMs}ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

