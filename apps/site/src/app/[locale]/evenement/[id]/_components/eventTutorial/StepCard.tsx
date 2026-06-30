import type { TutorialStep } from '../../_helpers/eventPageData'

export default function StepCard({ step }: { step: TutorialStep }) {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm">
      <span className="bg-secondary-700 mb-4 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
        {step.number}
      </span>
      <h3 className="mb-2 text-lg font-bold text-gray-800">{step.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">
        {step.description}
      </p>
    </div>
  )
}
