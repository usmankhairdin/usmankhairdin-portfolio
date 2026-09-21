
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface TimeSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isPremium?: boolean;
}

const freePeriods = [
  { value: "24h", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "1m", label: "1 Month" }
];

const premiumPeriods = [
  { value: "24h", label: "Today" },
  { value: "7d", label: "7 Days" },
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" }
];

export const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  isPremium = false
}) => {
  const periods = isPremium ? premiumPeriods : freePeriods;

  return (
    <div className="flex items-center space-x-2 min-w-max">
      <div className="flex space-x-1 sm:space-x-2">
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-0 whitespace-nowrap touch-manipulation sm:px-4 ${
              selectedPeriod === period.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
    </div>
  );
};
