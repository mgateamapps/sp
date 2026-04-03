'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SCENARIOS } from '@/lib/constants/assessment';
import { saveResponse, submitAssessment } from '@/lib/actions/assessment';
import type { ScenarioKey } from '@/types';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowLeft, ArrowRight, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AssessmentFormProps {
  token: string;
  attemptId: string;
  initialResponses: Partial<Record<ScenarioKey, string>>;
  campaignName: string;
}

export function AssessmentForm({
  token,
  attemptId,
  initialResponses,
  campaignName,
}: AssessmentFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>(
    initialResponses || {}
  );
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const currentScenario = SCENARIOS[currentStep];
  const isLastStep = currentStep === SCENARIOS.length - 1;
  const progress = ((currentStep + 1) / SCENARIOS.length) * 100;

  const currentResponse = responses[currentScenario.key] || '';

  const handleResponseChange = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentScenario.key]: value,
    }));
  };

  const saveCurrentResponse = async (): Promise<boolean> => {
    const text = responses[currentScenario.key]?.trim() || '';
    if (!text) return true;

    setIsSaving(true);
    const result = await saveResponse(token, attemptId, currentScenario.key, text);
    setIsSaving(false);

    if (!result.success) {
      toast.error(result.error || 'Failed to save response');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const saved = await saveCurrentResponse();
    if (saved && currentStep < SCENARIOS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = async () => {
    await saveCurrentResponse();
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const saved = await saveCurrentResponse();
    if (!saved) return;

    startTransition(async () => {
      const result = await submitAssessment(token, attemptId);

      if (!result.success) {
        toast.error(result.error || 'Failed to submit assessment');
        return;
      }

      toast.success('Assessment submitted successfully!');
      router.push(`/invite/${token}/processing`);
    });
  };

  const allScenariosAnswered = SCENARIOS.every(
    (s) => responses[s.key]?.trim().length > 0
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
        {campaignName}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-500 mb-2">
            <span>
              Scenario {currentStep + 1} of {SCENARIOS.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{currentScenario.title}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {currentScenario.description}
          </p>
          <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800">
            <p className="text-sm font-medium mb-1">Your task:</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {currentScenario.instruction}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <label
            htmlFor="response"
            className="block text-sm font-medium mb-2"
          >
            Your prompt:
          </label>
          <Textarea
            id="response"
            value={currentResponse}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Write your prompt here..."
            className="min-h-[200px] resize-y"
            disabled={isPending || isSaving}
          />
          <p className="text-xs text-neutral-500 mt-2">
            {currentResponse.length} characters
          </p>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isPending || isSaving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!allScenariosAnswered || isPending || isSaving}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Assessment
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!currentResponse.trim() || isPending || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {SCENARIOS.map((scenario, index) => (
          <button
            key={scenario.key}
            onClick={() => {
              saveCurrentResponse();
              setCurrentStep(index);
            }}
            disabled={isPending || isSaving}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentStep
                ? 'bg-primary'
                : responses[scenario.key]?.trim()
                ? 'bg-primary/40'
                : 'bg-neutral-300 dark:bg-neutral-600'
            }`}
            title={`${scenario.title}${responses[scenario.key]?.trim() ? ' (answered)' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
