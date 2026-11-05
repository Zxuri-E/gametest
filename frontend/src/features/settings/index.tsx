import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { GeneralSettings } from './components/GeneralSettings';
import { AppearanceSettings } from './components/AppearanceSettings';
import { AiProviderSettings } from './components/AiProviderSettings';
import { LocalModelSettings } from './components/LocalModelSettings';
import { TestingSettings } from './components/TestingSettings';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { Sliders, Palette, Bot, Server, Shield, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const { resetDefaults } = useSettingsStore();

  const settingsTabs = [
    { id: 'ai', label: 'AI Provider & Models', icon: <Bot className="w-3.5 h-3.5" /> },
    { id: 'local', label: 'Local Models', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'testing', label: 'Automated Testing', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'general', label: 'General', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-3.5 h-3.5" /> },
  ];

  return (
    <PageContainer
      title="Platform Settings & Orchestrator Config"
      subtitle="Configure AI models, inference providers, headless Playwright testing, and workspace preferences."
      action={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={resetDefaults}
        >
          Reset to Defaults
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-border-subtle pb-1">
          <Tabs
            tabs={settingsTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === 'ai' && <AiProviderSettings />}
          {activeTab === 'local' && <LocalModelSettings />}
          {activeTab === 'testing' && <TestingSettings />}
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
        </div>
      </div>
    </PageContainer>
  );
};

