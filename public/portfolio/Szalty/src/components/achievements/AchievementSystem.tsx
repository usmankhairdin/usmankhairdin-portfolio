
import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, TrendingUp, Users, Target, Flame } from "lucide-react";

interface Achievement {
  id: string;
  category: "streak" | "performance" | "social";
  title: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  icon: React.ComponentType<any>;
  color: string;
  celebrationAnimation?: boolean;
}

interface AchievementSystemProps {
  userAchievements?: Achievement[];
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  userAchievements = [] 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const defaultAchievements: Achievement[] = [
    // Streak Categories
    {
      id: "streak-7",
      category: "streak",
      title: "Week Warrior",
      description: "Log meals for 7 consecutive days",
      progress: 5,
      target: 7,
      isCompleted: false,
      icon: Calendar,
      color: "bg-szalty-blue"
    },
    {
      id: "streak-30",
      category: "streak", 
      title: "Consistency Champion",
      description: "Log meals for 30 consecutive days",
      progress: 30,
      target: 30,
      isCompleted: true,
      icon: Flame,
      color: "bg-szalty-orange"
    },
    {
      id: "streak-180",
      category: "streak",
      title: "Nutrition Master",
      description: "Log meals for 6 consecutive months",
      progress: 45,
      target: 180,
      isCompleted: false,
      icon: Award,
      color: "bg-szalty-green"
    },
    
    // Performance Goals
    {
      id: "pre-workout-consistency",
      category: "performance",
      title: "Pre-Workout Pro",
      description: "Log pre-workout meals for 20 workouts",
      progress: 15,
      target: 20,
      isCompleted: false,
      icon: TrendingUp,
      color: "bg-szalty-blue"
    },
    {
      id: "recovery-nutrition",
      category: "performance",
      title: "Recovery Expert",
      description: "Log post-workout recovery meals for 15 sessions",
      progress: 15,
      target: 15,
      isCompleted: true,
      icon: Target,
      color: "bg-szalty-green"
    },
    
    // Social Achievements
    {
      id: "follower-milestone-100",
      category: "social",
      title: "Community Builder",
      description: "Reach 100 followers",
      progress: 87,
      target: 100,
      isCompleted: false,
      icon: Users,
      color: "bg-purple-500"
    },
    {
      id: "engagement-master",
      category: "social",
      title: "Engagement Master",
      description: "Receive 500 total likes on your posts",
      progress: 342,
      target: 500,
      isCompleted: false,
      icon: Award,
      color: "bg-pink-500"
    }
  ];

  const achievements = userAchievements.length > 0 ? userAchievements : defaultAchievements;

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = achievements.length;

  const getProgressPercentage = (progress: number, target: number) => {
    return Math.min((progress / target) * 100, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "streak": return <Flame size={16} />;
      case "performance": return <TrendingUp size={16} />;
      case "social": return <Users size={16} />;
      default: return <Award size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Achievement Overview */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Award className="text-szalty-blue mr-2" size={20} />
            <h2 className="font-bold text-lg">Achievements</h2>
          </div>
          <Badge className="bg-szalty-lightBlue text-szalty-blue">
            {completedCount}/{totalCount} Completed
          </Badge>
        </div>
        
        <div className="bg-szalty-lightBlue rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-szalty-blue">Overall Progress</span>
            <span className="text-sm text-szalty-blue">{Math.round((completedCount / totalCount) * 100)}%</span>
          </div>
          <Progress 
            value={(completedCount / totalCount) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === "all" 
                ? "bg-szalty-blue text-white" 
                : "bg-szalty-gray text-szalty-darkGray"
            }`}
          >
            <Award size={16} className="mr-1" />
            All
          </button>
          <button
            onClick={() => setSelectedCategory("streak")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === "streak" 
                ? "bg-szalty-orange text-white" 
                : "bg-szalty-gray text-szalty-darkGray"
            }`}
          >
            <Flame size={16} className="mr-1" />
            Streaks
          </button>
          <button
            onClick={() => setSelectedCategory("performance")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === "performance" 
                ? "bg-szalty-green text-white" 
                : "bg-szalty-gray text-szalty-darkGray"
            }`}
          >
            <TrendingUp size={16} className="mr-1" />
            Performance
          </button>
          <button
            onClick={() => setSelectedCategory("social")}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === "social" 
                ? "bg-purple-500 text-white" 
                : "bg-szalty-gray text-szalty-darkGray"
            }`}
          >
            <Users size={16} className="mr-1" />
            Social
          </button>
        </div>
      </div>

      {/* Achievement List */}
      <div className="space-y-3">
        {filteredAchievements.map((achievement) => {
          const IconComponent = achievement.icon;
          const progressPercentage = getProgressPercentage(achievement.progress, achievement.target);
          
          return (
            <div 
              key={achievement.id} 
              className={`bg-white rounded-lg p-4 shadow-sm transition-all duration-300 ${
                achievement.isCompleted ? "ring-2 ring-szalty-green" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start">
                  <div className={`${achievement.color} rounded-lg p-2 mr-3`}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-sm">{achievement.title}</h3>
                      {achievement.isCompleted && (
                        <span className="ml-2 text-szalty-green">✓</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {getCategoryIcon(achievement.category)}
                  <span className="ml-1 text-xs text-gray-400 capitalize">
                    {achievement.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className={achievement.isCompleted ? "text-szalty-green font-medium" : "text-gray-600"}>
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={progressPercentage} 
                    className={`h-2 ${achievement.isCompleted ? "bg-szalty-green" : ""}`}
                  />
                  {achievement.isCompleted && (
                    <div className="absolute inset-0 bg-szalty-green rounded-full opacity-20 animate-pulse"></div>
                  )}
                </div>
                
                {achievement.isCompleted && (
                  <div className="mt-2 p-2 bg-szalty-lightBlue rounded-lg">
                    <p className="text-xs text-szalty-blue font-medium">🎉 Achievement Unlocked!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementSystem;
