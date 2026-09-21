
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Clock, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MealTimingAnalysisProps {
  isPremium?: boolean;
}

export const MealTimingAnalysis: React.FC<MealTimingAnalysisProps> = ({
  isPremium = false
}) => {
  const timingData = [
    { timing: "Pre-workout", performance: 85, meals: 12 },
    { timing: "Post-workout", performance: 92, meals: 15 },
    { timing: "Breakfast", performance: 78, meals: 28 },
    { timing: "Lunch", performance: 74, meals: 25 },
    { timing: "Dinner", performance: 71, meals: 22 }
  ];

  const chartConfig = {
    performance: {
      label: "Performance Score",
      color: "hsl(214, 100%, 50%)"
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-base font-semibold sm:text-lg">
              <Clock className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
              Meal Timing
            </CardTitle>
            <p className="text-xs text-gray-600 sm:text-sm">
              Performance by timing
            </p>
          </div>
          {!isPremium && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
              <Lock className="mr-1 h-3 w-3" />
              Basic
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48 sm:h-64">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timingData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="timing"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  width={35}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="performance" 
                  fill="var(--color-performance)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {isPremium ? (
          <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200 sm:mt-4 sm:p-3">
            <p className="text-xs text-blue-800 sm:text-sm">
              <strong>Insight:</strong> Post-workout meals show highest performance correlation.
            </p>
          </div>
        ) : (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 sm:mt-4 sm:p-3">
            <p className="text-xs text-amber-800 sm:text-sm">
              <strong>Premium:</strong> Personalized timing recommendations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
