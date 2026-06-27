import type { CalcStep } from '../../types/calculations';

interface CalcStepExplanationProps {
  steps: CalcStep[];
  title: string;
}

export function CalcStepExplanation({ steps, title }: CalcStepExplanationProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📋 {title} — Passo a Passo
      </h3>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="border-l-3 border-primary pl-4 py-2">
            <p className="text-sm text-gray-600 mb-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full mr-2">
                {index + 1}
              </span>
              {step.descricao}
            </p>
            <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded">
              {step.formula}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
