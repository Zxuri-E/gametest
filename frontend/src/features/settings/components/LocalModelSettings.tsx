import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Slider } from '../../../components/ui/Slider';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { Server, Cpu } from 'lucide-react';

export const LocalModelSettings: React.FC = () => {
  const { localModel, updateLocalModel } = useSettingsStore();

  return (
    <Card
      header={
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-100">Local Model Server (Ollama / vLLM)</h3>
        </div>
      }
    >
      <div className="space-y-4 max-w-xl">
        <Input
          label="Inference Server Endpoint URL"
          value={localModel.endpoint}
          onChange={(e) => updateLocalModel({ endpoint: e.target.value })}
          helperText="Ollama default: http://localhost:11434 | vLLM: http://localhost:8000/v1"
        />

        <Slider
          label="Context Window Limit"
          valueDisplay={`${localModel.contextLength} tokens`}
          min={4096}
          max={32768}
          step={2048}
          value={localModel.contextLength}
          onChange={(e) => updateLocalModel({ contextLength: Number(e.target.value) })}
        />

        <Slider
          label="GPU Layers Offload"
          valueDisplay={`${localModel.gpuLayers} layers`}
          min={0}
          max={60}
          step={1}
          value={localModel.gpuLayers}
          onChange={(e) => updateLocalModel({ gpuLayers: Number(e.target.value) })}
        />

        <Slider
          label="Sampling Temperature"
          valueDisplay={localModel.temperature.toFixed(2)}
          min={0}
          max={1}
          step={0.05}
          value={localModel.temperature}
          onChange={(e) => updateLocalModel({ temperature: Number(e.target.value) })}
        />
      </div>
    </Card>
  );
};
