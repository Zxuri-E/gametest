import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { Bot, Key, ShieldCheck, Lock } from 'lucide-react';

export const AiProviderSettings: React.FC = () => {
  const { aiProvider, updateAiProvider } = useSettingsStore();
  const [anthropicKey, setAnthropicKey] = useState('••••••••••••••••••••••••••••••••');
  const [openAiKey, setOpenAiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('••••••••••••••••••••••••••••••••');

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">AI Provider & Orchestrator Models</h3>
        </div>
      }
    >
      <div className="space-y-5 max-w-2xl">
        {/* Active Provider Selector */}
        <Select
          label="Default Active AI Provider"
          value={aiProvider.activeProvider}
          onChange={(e) => updateAiProvider({ activeProvider: e.target.value as any })}
          options={[
            { value: 'anthropic', label: 'Anthropic Claude (Recommended for AST Code Synthesis)' },
            { value: 'openai', label: 'OpenAI GPT-4o / o1' },
            { value: 'gemini', label: 'Google Gemini 1.5 Pro / Flash' },
            { value: 'local', label: 'Local LLM (Ollama / vLLM / llama.cpp)' },
          ]}
        />

        {/* Specialized Agent Model Roles */}
        <div className="pt-2 space-y-3">
          <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">
            Specialized Agent Model Assignments
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Generator Agent (Phaser 3 AST)"
              value={aiProvider.generatorModel}
              onChange={(e) => updateAiProvider({ generatorModel: e.target.value })}
              options={[
                { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
                { value: 'local-qwen-2.5-coder-32b', label: 'Local: Qwen 2.5 Coder 32B' },
              ]}
            />

            <Select
              label="Test Planner Agent (Playwright)"
              value={aiProvider.testerModel}
              onChange={(e) => updateAiProvider({ testerModel: e.target.value })}
              options={[
                { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
              ]}
            />

            <Select
              label="Diagnostician Agent (Root Cause)"
              value={aiProvider.diagnosticianModel}
              onChange={(e) => updateAiProvider({ diagnosticianModel: e.target.value })}
              options={[
                { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                { value: 'gpt-4o', label: 'GPT-4o' },
              ]}
            />

            <Select
              label="Repair Agent (AST Diff Patching)"
              value={aiProvider.repairModel}
              onChange={(e) => updateAiProvider({ repairModel: e.target.value })}
              options={[
                { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
                { value: 'gpt-4o', label: 'GPT-4o' },
              ]}
            />
          </div>
        </div>

        {/* API Credentials Management */}
        <div className="pt-3 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block font-mono">
              Provider Credentials (Secure Local Environment)
            </label>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              Masked & Never Logged
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label="Anthropic API Key"
                  type="password"
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                />
              </div>
              <div className="pt-5 shrink-0">
                <Badge variant="emerald" size="sm">CONFIGURED</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label="OpenAI API Key"
                  type="password"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-proj-..."
                />
              </div>
              <div className="pt-5 shrink-0">
                <Badge variant="slate" size="sm">OPTIONAL</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  label="Google Gemini API Key"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                />
              </div>
              <div className="pt-5 shrink-0">
                <Badge variant="emerald" size="sm">CONFIGURED</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
