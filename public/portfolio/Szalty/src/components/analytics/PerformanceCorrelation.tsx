
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Star, TrendingUp, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceCorrelationProps {
  isPremium?: boolean;
}

export const PerformanceCorrelation: React.FC<PerformanceCorrelationProps> = ({
  isPremium = false
}) => {
  const correlations = [
    {
      meal: "High-carb pre-workout",
      score: 92,
      impact: "Best performance",
      color: "text-green-600"
    },
    {
      meal: "Protein-rich post-workout", 
      score: 88,
      impact: "Faster recovery",
      color: "text-green-600"
    },
    {
      meal: "Balanced breakfast",
      score: 76,
      impact: "Sustained energy",
      color: "text-blue-600"
    }
  ];

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-base font-semibold sm:text-lg">
              <Target className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
              Performance
            </CardTitle>
            <p className="text-xs text-gray-600 sm:text-sm">
              Nutrition impact
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
        <div className="space-y-3 sm:space-y-4">
          {correlations.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 min-w-0">
                  <Star className={`h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4 ${item.color}`} />
                  <span className="font-medium text-xs sm:text-sm truncate">{item.meal}</span>
                </div>
                <span className={`text-xs font-semibold flex-shrink-0 sm:text-sm ${item.color}`}>
                  {item.score}%
                </span>
              </div>
              <Progress value={item.score} className="h-1.5 sm:h-2" />
              <p className="text-xs text-gray-500">{item.impact}</p>
            </div>
          ))}
        </div>

        {isPremium ? (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200 sm:mt-4">
            <div className="flex items-center space-x-2 text-green-800">
              <TrendingUp className="h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs font-medium sm:text-sm">
                Workouts improve 23% with optimized pre-workout nutrition
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 sm:mt-4">
            <p className="text-xs text-amber-800 sm:text-sm">
              <strong>Premium:</strong> Detailed analysis and optimization suggestions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
