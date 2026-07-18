import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
}

const steps = ['Select Date', 'Select Time', 'Your Details', 'Payment']

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 mb-10">
      {steps.map((label, i) => {
        const stepNum = i + 1
        const isActive = currentStep === stepNum
        const isCompleted = currentStep > stepNum

        return (
          <div key={label} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 flex items-center justify-center text-sm font-body font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#C9A96E] border-[#C9A96E] text-white'
                    : isActive
                    ? 'border-[#C9A96E] text-[#C9A96E]'
                    : 'border-[#DDD6CC] text-[#9B9590]'
                }`}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span
                className={`font-body text-[10px] md:text-xs mt-2 whitespace-nowrap transition-colors duration-300 ${
                  isCompleted ? 'text-[#C9A96E]' : isActive ? 'text-[#2C2C2C]' : 'text-[#9B9590]'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 md:w-16 h-0.5 transition-colors duration-300 mb-5 ${
                  isCompleted ? 'bg-[#C9A96E]' : 'bg-[#DDD6CC]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
