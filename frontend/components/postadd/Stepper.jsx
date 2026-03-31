import { Check } from 'lucide-react';

export default function Stepper({ currentStep }) {
  const steps = [
    { num: 1, label: 'Choose Category' },
    { num: 2, label: 'Select Subcategory' },
    { num: 3, label: 'Post Details' }
  ];

  return (
    <div className="w-full py-6 mb-8 px-4 sm:px-0">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        <div className="absolute left-0 top-1/2 -z-10 w-full h-[2px] bg-gray-200 -translate-y-1/2"></div>
        <div 
          className="absolute left-0 top-1/2 -z-10 h-[2px] bg-[#046BD2] -translate-y-1/2 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-[#046BD2] text-white shadow-md' 
                    : isCurrent 
                      ? 'bg-[#046BD2] text-white shadow-md ring-4 ring-blue-100' 
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : step.num}
              </div>
              <span 
                className={`absolute top-12 mt-1 text-xs sm:text-sm font-medium whitespace-nowrap ${
                  isCurrent || isCompleted ? 'text-[#046BD2]' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
