
import React, { useState } from "react";
import { BarChart3, Crown } from "lucide-react";
import { TimeSelector } from "@/components/analytics/TimeSelector";
import { MacroTrendsChart } from "@/components/analytics/MacroTrendsChart";
import { PerformanceCorrelation } from "@/components/analytics/PerformanceCorrelation";
import { GoalProgress } from "@/components/analytics/GoalProgress";
import { PremiumFeatures } from "@/components/analytics/PremiumFeatures";
import { MealTimingAnalysis } from "@/components/analytics/MealTimingAnalysis";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [isPremium] = useState(false); // This would come from user context/auth

  // Mock data for different time periods with calories added
  const mockData = {
    "24h": [
      { time: "6:00", carbs: 45, protein: 25, fat: 12, calories: 356 },
      { time: "12:00", carbs: 85, protein: 35, fat: 22, calories: 634 },
      { time: "18:00", carbs: 60, protein: 28, fat: 18, calories: 458 },
      { time: "22:00", carbs: 20, protein: 8, fat: 6, calories: 154 }
    ],
    "7d": [
      { time: "Mon", carbs: 280, protein: 120, fat: 75, calories: 2255 },
      { time: "Tue", carbs: 310, protein: 135, fat: 82, calories: 2482 },
      { time: "Wed", carbs: 265, protein: 115, fat: 70, calories: 2145 },
      { time: "Thu", carbs: 295, protein: 125, fat: 78, calories: 2358 },
      { time: "Fri", carbs: 330, protein: 140, fat: 88, calories: 2632 },
      { time: "Sat", carbs: 350, protein: 150, fat: 95, calories: 2795 },
      { time: "Sun", carbs: 305, protein: 130, fat: 80, calories: 2445 }
    ],
    "1m": [
      { time: "Week 1", carbs: 2100, protein: 900, fat: 550, calories: 16450 },
      { time: "Week 2", carbs: 2250, protein: 950, fat: 580, calories: 17430 },
      { time: "Week 3", carbs: 2180, protein: 920, fat: 560, calories: 16920 },
      { time: "Week 4", carbs: 2300, protein: 980, fat: 600, calories: 17920 }
    ],
    "3m": [
      { time: "Month 1", carbs: 8500, protein: 3600, fat: 2200, calories: 65800 },
      { time: "Month 2", carbs: 8800, protein: 3750, fat: 2300, calories: 68350 },
      { time: "Month 3", carbs: 9000, protein: 3900, fat: 2400, calories: 70200 }
    ],
    "6m": [
      { time: "Jan", carbs: 8200, protein: 3500, fat: 2200, calories: 64700 },
      { time: "Feb", carbs: 8500, protein: 3650, fat: 2300, calories: 67050 },
      { time: "Mar", carbs: 8800, protein: 3800, fat: 2400, calories: 69600 },
      { time: "Apr", carbs: 9000, protein: 3900, fat: 2500, calories: 71400 },
      { time: "May", carbs: 8700, protein: 3750, fat: 2350, calories: 68450 },
      { time: "Jun", carbs: 9200, protein: 4000, fat: 2600, calories: 73200 }
    ],
    "1y": [
      { time: "Q1", carbs: 25500, protein: 11000, fat: 6900, calories: 201750 },
      { time: "Q2", carbs: 26900, protein: 11650, fat: 7450, calories: 214950 },
      { time: "Q3", carbs: 26000, protein: 11200, fat: 7200, calories: 207200 },
      { time: "Q4", carbs: 27500, protein: 12000, fat: 7800, calories: 220700 }
    ]
  };

  const chartData = mockData[selectedPeriod as keyof typeof mockData] || mockData["7d"];

  return (
    <div className="min-h-screen bg-szalty-offWhite pb-4">
      {/* Mobile-First Header Section */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-szalty-lightGray px-4 py-4 md:px-6 md:py-6">
        <div className="space-y-4">
          {/* Title and Premium Banner */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-szalty-charcoal to-szalty-blueGray bg-clip-text text-transparent flex items-center md:text-3xl">
                <BarChart3 className="mr-2 h-6 w-6 text-szalty-blue md:h-7 md:w-7" />
                Analytics
              </h1>
              <p className="text-szalty-blueGray text-sm md:text-base">
                Track your nutrition performance
              </p>
            </div>
            
            {/* Premium upgrade banner for free users - Mobile optimized */}
            {!isPremium && (
              <div className="bg-gradient-to-r from-szalty-gold/10 to-szalty-gold/20 border border-szalty-gold/30 rounded-lg p-3 flex items-center space-x-2 sm:max-w-xs">
                <Crown className="h-4 w-4 text-szalty-gold flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-szalty-gold leading-tight">
                    Unlock advanced analytics
                  </p>
                  <p className="text-xs text-szalty-gold/80 leading-tight">
                    & nutritional coaching experts
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Time Period Selector - Mobile optimized */}
          <div className="w-full overflow-x-auto">
            <TimeSelector 
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              isPremium={isPremium}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        {/* Main Analytics - Mobile-first grid */}
        <div className="space-y-4 md:space-y-6">
          {/* Primary Widget - Macro Trends - Full width on mobile */}
          <MacroTrendsChart 
            data={chartData}
            selectedPeriod={selectedPeriod}
            isPremium={isPremium}
          />
          
          {/* Secondary widgets - Stack on mobile, grid on larger screens */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            <PerformanceCorrelation isPremium={isPremium} />
            <GoalProgress isPremium={isPremium} />
            <MealTimingAnalysis isPremium={isPremium} />
          </div>
          
          {/* Premium Features - Full width */}
          <PremiumFeatures isPremium={isPremium} />
        </div>

        {/* Premium-only sections */}
        {isPremium && (
          <div className="space-y-4 md:space-y-6">
            {/* Meal Plans Section - Mobile optimized */}
            <div className="bg-white rounded-xl border border-szalty-lightGray p-4 md:p-6">
              <h2 className="text-lg font-bold text-szalty-charcoal mb-3 md:text-xl md:mb-4">
                Curated Meal Plans
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
                {[
                  { name: "Endurance Training", creator: "Pro Triathlete", duration: "7 days" },
                  { name: "Recovery Week", creator: "Sports Nutritionist", duration: "5 days" },
                  { name: "Race Prep", creator: "Olympic Coach", duration: "14 days" }
                ].map((plan, index) => (
                  <div key={index} className="border border-szalty-lightGray rounded-lg p-3 hover:shadow-md transition-shadow md:p-4">
                    <h3 className="font-semibold text-szalty-charcoal text-sm md:text-base">{plan.name}</h3>
                    <p className="text-xs text-szalty-blueGray md:text-sm">by {plan.creator}</p>
                    <p className="text-xs text-szalty-blueGray mt-1">{plan.duration}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Apps Section - Mobile optimized */}
            <div className="bg-white rounded-xl border border-szalty-lightGray p-4 md:p-6">
              <h2 className="text-lg font-bold text-szalty-charcoal mb-3 md:text-xl md:mb-4">
                Connected Apps
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
                {[
                  { name: "Strava", status: "Connected", color: "bg-szalty-recovery/10 text-szalty-recovery" },
                  { name: "Garmin", status: "Connected", color: "bg-szalty-blue/10 text-szalty-blue" },
                  { name: "MyFitnessPal", status: "Not Connected", color: "bg-szalty-lightGray text-szalty-blueGray" },
                  { name: "TrainingPeaks", status: "Not Connected", color: "bg-szalty-lightGray text-szalty-blueGray" }
                ].map((app, index) => (
                  <div key={index} className="flex flex-col items-center p-3 border border-szalty-lightGray rounded-lg md:p-4">
                    <div className="w-6 h-6 bg-szalty-lightGray rounded mb-2 md:w-8 md:h-8"></div>
                    <span className="font-medium text-xs text-center md:text-sm">{app.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 text-center leading-tight ${app.color}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
