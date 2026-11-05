import React from 'react';
import { AgentStatus } from '@shared/core';
import { Card } from '../../../components/ui/Card';
import { Bot, Cpu, CheckCircle2, AlertCircle, Wrench } from 'lucide-react';

interface AgentActivityStreamProps {
  agentStatuses: AgentStatus[];
}

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({ agentStatuses }) => {
  const getAgentIcon = (role: AgentStatus['role']) => {
    switch (role) {
      case 'generator':
        return <Bot className="w-4 h-4 text-cyan-400" />;
      case 'test-planner':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'playtester':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'diagnostician':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case 'repair':
        return <Wrench className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
            Autonomous Verification Agents
          </h3>
        </div>
      }
    >
      <div className="space-y-3">
        {agentStatuses.map((agent) => (
          <div
            key={agent.role}
            className="p-3 rounded bg-canvas-950 border border-border-subtle font-mono text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-slate-200">
                {getAgentIcon(agent.role)}
                <span className="capitalize">{agent.role.replace('-', ' ')}</span>
              </div>
              <span
                className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-semibold ${
                  agent.state === 'analyzing'
                    ? 'bg-amber-950 text-amber-300 animate-pulse'
                    : agent.state === 'synthesizing'
                    ? 'bg-cyan-950 text-cyan-300 animate-pulse'
                    : 'bg-canvas-850 text-slate-400'
                }`}
              >
                {agent.state}
              </span>
            </div>

            {agent.lastMessage && (
              <p className="text-[11px] text-slate-400 font-sans leading-normal">
                {agent.lastMessage}
              </p>
            )}

            {agent.progressPercentage !== undefined && (
              <div className="w-full h-1 bg-canvas-850 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${agent.progressPercentage}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

