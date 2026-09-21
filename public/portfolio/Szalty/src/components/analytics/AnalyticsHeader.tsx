
import React from 'react';
import { Filter } from 'lucide-react';

interface AnalyticsHeaderProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

const periods = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "6m", label: "6 Months" },
  { value: "1y", label: "1 Year" }
];

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  selectedPeriod,
  onPeriodChange
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your nutrition and fitness progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <Filter size={18} className="text-gray-400" />
          <select 
            value={selectedPeriod} 
            onChange={(e) => onPeriodChange(e.target.value)}
            className="text-sm border border-gray-300 rounded-xl px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
