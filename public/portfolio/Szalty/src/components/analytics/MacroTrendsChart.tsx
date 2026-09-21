
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MacroTrendsChartProps {
  data: any[];
  selectedPeriod: string;
  isPremium?: boolean;
}

export const MacroTrendsChart: React.FC<MacroTrendsChartProps> = ({
  data,
  selectedPeriod,
  isPremium = false
}) => {
  const chartConfig = {
    carbs: {
      label: "Carbohydrates",
      color: "hsl(214, 100%, 50%)"
    },
    protein: {
      label: "Protein", 
      color: "hsl(0, 84%, 60%)"
    },
    fat: {
      label: "Fat",
      color: "hsl(142, 76%, 36%)"
    },
    calories: {
      label: "Calories",
      color: "hsl(45, 93%, 47%)"
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center text-lg font-bold sm:text-xl">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            Macro Trends
          </CardTitle>
          <p className="text-sm text-gray-600">
            Track macronutrient patterns and calories
          </p>
        </div>
        {!isPremium && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 self-start">
            <Lock className="mr-1 h-3 w-3" />
            Limited
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64 sm:h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => selectedPeriod === '24h' ? `${value}` : `${value}g`}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="carbs" 
                  stroke="var(--color-carbs)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="protein" 
                  stroke="var(--color-protein)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fat" 
                  stroke="var(--color-fat)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="calories" 
                  stroke="var(--color-calories)" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        {!isPremium && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Upgrade to Premium</strong> for advanced chart types and custom date ranges.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
