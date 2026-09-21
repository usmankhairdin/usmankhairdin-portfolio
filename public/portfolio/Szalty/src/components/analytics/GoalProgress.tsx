
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Award, Target, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GoalProgressProps {
  isPremium?: boolean;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  isPremium = false
}) => {
  const goals = [
    {
      name: "Calories",
      current: 2450,
      target: 2800,
      unit: "kcal",
      progress: 87
    },
    {
      name: "Protein",
      current: 156,
      target: 180,
      unit: "g",
      progress: 87
    },
    {
      name: "Hydration",
      current: 2.1,
      target: 3.0,
      unit: "L",
      progress: 70
    }
  ];

  const streaks = [
    { name: "Nutrition Logging", days: 12, icon: Target },
    { name: "Goal Achievement", days: 5, icon: Award },
    { name: "Workout Fuel", days: 8, icon: Flame }
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-semibold sm:text-lg">
          <Award className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
          Goals & Streaks
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-gray-900 text-sm">Today's Goals</h4>
            {goals.map((goal, index) => (
              <div key={index} className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium sm:text-sm">{goal.name}</span>
                  <span className="text-xs text-gray-600 sm:text-sm">
                    {goal.current}/{goal.target} {goal.unit}
                  </span>
                </div>
                <Progress value={goal.progress} className="h-1.5 sm:h-2" />
              </div>
            ))}
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">Streaks</h4>
            {streaks.map((streak, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 min-w-0">
                  <streak.icon className="h-3 w-3 text-orange-500 flex-shrink-0 sm:h-4 sm:w-4" />
                  <span className="text-xs font-medium truncate sm:text-sm">{streak.name}</span>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">
                  {streak.days}d
                </Badge>
              </div>
            ))}
          </div>

          {!isPremium && (
            <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 sm:p-3">
              <p className="text-xs text-amber-800 sm:text-sm">
                <strong>Premium:</strong> Custom goals and long-term trends.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
