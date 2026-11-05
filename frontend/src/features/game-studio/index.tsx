import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { PromptEditor } from './components/PromptEditor';
import { GenreSelector } from './components/GenreSelector';
import { MechanicsSelector } from './components/MechanicsSelector';
import { PhysicsConfigPanel } from './components/PhysicsConfigPanel';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import { Button } from '../../components/ui/Button';
import { Sparkles, Terminal, Info } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export const GameStudioPage: React.FC = () => {
  const {
    prompt,
    genre,
    mechanics,
    difficulty,
    dimensions,
    physics,
    isGenerating,
    generationStep,
    generationProgress,
    generationError,
    setPrompt,
    setGenre,
    toggleMechanic,
    setDifficulty,
    setDimensions,
    setPhysics,
    generateGame,
    resetGenerationState,
  } = useStudioStore();

  const [showModal, setShowModal] = useState(false);

  const handleStartGeneration = async () => {
    setShowModal(true);
    await generateGame();
  };

  return (
    <PageContainer
      title="AI Game Studio"
      subtitle="Define game specifications via natural language prompts, select mechanics, and trigger autonomous synthesis."
      action={
        <Button
          variant="primary"
          size="md"
          leftIcon={<Sparkles className="w-4 h-4" />}
          isLoading={isGenerating}
          onClick={handleStartGeneration}
        >
          {isGenerating ? 'Synthesizing Game...' : 'Synthesize 2D Game'}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Simulation Notice Banner */}
        <div className="p-3 rounded-lg bg-canvas-900 border border-border-default flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Autonomous Synthesis Engine mode: <strong className="text-cyan-400">Mock Orchestrator Active</strong>. Generates standardized <code className="text-cyan-300 font-mono">GameSpecification</code> JSON and verification plans.
            </span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[10px] uppercase bg-canvas-800 text-slate-400 px-2 py-0.5 rounded border border-border-subtle">
            Phaser 3 Engine Ready
          </span>
        </div>

        {/* Natural Language Prompt Editor */}
        <div className="p-5 rounded-lg bg-canvas-900 border border-border-default shadow-panel">
          <PromptEditor
            prompt={prompt}
            onChange={setPrompt}
            onApplyExample={(ex) => setPrompt(ex)}
          />
        </div>

        {/* Step 1: Genre Selection */}
        <GenreSelector genre={genre} onChange={setGenre} />

        {/* Step 2: Mechanics Selection */}
        <div className="p-5 rounded-lg bg-canvas-900 border border-border-default shadow-panel">
          <MechanicsSelector
            selectedMechanics={mechanics}
            onToggle={toggleMechanic}
          />
        </div>

        {/* Step 3: Physics Configuration */}
        <PhysicsConfigPanel
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          dimensions={dimensions}
          onDimensionsChange={setDimensions}
          physics={physics}
          onPhysicsChange={setPhysics}
        />

        {/* Bottom Generate Trigger */}
        <div className="p-4 rounded-lg bg-canvas-900 border border-border-default flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Clicking synthesize initiates the 5-phase agent pipeline: spec extraction, Phaser AST synthesis, Playwright test generation, and runtime verification.
          </div>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Sparkles className="w-4 h-4" />}
            isLoading={isGenerating}
            onClick={handleStartGeneration}
            className="w-full sm:w-auto shrink-0 shadow-lg"
          >
            Synthesize Game Now
          </Button>
        </div>
      </div>

      {/* Progress & Verification Modal */}
      <GenerationProgressModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetGenerationState();
        }}
        stepText={generationStep}
        progressPercent={generationProgress}
        error={generationError}
      />
    </PageContainer>
  );
};

