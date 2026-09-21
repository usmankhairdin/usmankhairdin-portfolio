import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Star, Target, Zap, Calendar, Award, Lock, Heart, MessageSquare, Users, Camera, Clock, TrendingUp, Flame, Droplets, Apple, Coffee, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const Achievements = () => {
  const navigate = useNavigate();
  
  const [achievements] = useState([
    // Earned Achievements
    {
      id: 'first-post',
      title: 'First Fuel',
      description: 'Share your first meal post',
      icon: Star,
      category: 'social',
      points: 50,
      earned: true,
      earnedDate: '2024-01-15',
      rarity: 'common'
    },
    {
      id: 'week-streak',
      title: 'Weekly Warrior',
      description: 'Post meals for 7 consecutive days',
      icon: Calendar,
      category: 'consistency',
      points: 200,
      earned: true,
      earnedDate: '2024-01-20',
      rarity: 'uncommon'
    },
    {
      id: 'nutrition-tracking',
      title: 'Macro Master',
      description: 'Track nutrition for 10 posts',
      icon: Target,
      category: 'nutrition',
      points: 150,
      earned: true,
      earnedDate: '2024-01-18',
      rarity: 'common'
    },
    
    // Available Achievements
    {
      id: 'month-streak',
      title: 'Monthly Legend',
      description: 'Post meals for 30 consecutive days',
      icon: Trophy,
      category: 'consistency',
      points: 500,
      earned: false,
      progress: 23,
      maxProgress: 30,
      rarity: 'rare'
    },
    {
      id: 'workout-sync',
      title: 'Performance Pro',
      description: 'Link 25 workouts to meal posts',
      icon: Zap,
      category: 'fitness',
      points: 300,
      earned: false,
      progress: 12,
      maxProgress: 25,
      rarity: 'uncommon'
    },
    {
      id: 'community-star',
      title: 'Community Champion',
      description: 'Receive 100 likes on your posts',
      icon: Award,
      category: 'social',
      points: 250,
      earned: false,
      progress: 67,
      maxProgress: 100,
      rarity: 'uncommon'
    },
    {
      id: 'perfect-week',
      title: 'Perfect Nutrition Week',
      description: 'Hit all macro goals for 7 days straight',
      icon: Target,
      category: 'nutrition',
      points: 400,
      earned: false,
      progress: 0,
      maxProgress: 7,
      rarity: 'rare'
    },
    {
      id: 'elite-athlete',
      title: 'Elite Athlete',
      description: 'Complete 100 workout-meal combinations',
      icon: Trophy,
      category: 'fitness',
      points: 1000,
      earned: false,
      progress: 8,
      maxProgress: 100,
      rarity: 'legendary'
    },
    {
      id: 'social-butterfly',
      title: 'Social Butterfly',
      description: 'Comment on 50 other users\' posts',
      icon: MessageSquare,
      category: 'social',
      points: 200,
      earned: false,
      progress: 18,
      maxProgress: 50,
      rarity: 'uncommon'
    },
    {
      id: 'photographer',
      title: 'Food Photographer',
      description: 'Upload posts with multiple photos 25 times',
      icon: Camera,
      category: 'social',
      points: 180,
      earned: false,
      progress: 7,
      maxProgress: 25,
      rarity: 'uncommon'
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Post breakfast meals for 14 consecutive days',
      icon: Sun,
      category: 'consistency',
      points: 220,
      earned: false,
      progress: 0,
      maxProgress: 14,
      rarity: 'uncommon'
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Post late evening meals 10 times',
      icon: Moon,
      category: 'consistency',
      points: 150,
      earned: false,
      progress: 3,
      maxProgress: 10,
      rarity: 'common'
    },
    {
      id: 'hydration-hero',
      title: 'Hydration Hero',
      description: 'Track water intake for 30 consecutive days',
      icon: Droplets,
      category: 'nutrition',
      points: 350,
      earned: false,
      progress: 12,
      maxProgress: 30,
      rarity: 'rare'
    },
    {
      id: 'pre-workout-pro',
      title: 'Pre-Workout Pro',
      description: 'Post 50 pre-workout meals',
      icon: Zap,
      category: 'fitness',
      points: 250,
      earned: false,
      progress: 28,
      maxProgress: 50,
      rarity: 'uncommon'
    },
    {
      id: 'recovery-master',
      title: 'Recovery Master',
      description: 'Post 40 post-workout meals',
      icon: Heart,
      category: 'fitness',
      points: 240,
      earned: false,
      progress: 15,
      maxProgress: 40,
      rarity: 'uncommon'
    },
    {
      id: 'follower-magnet',
      title: 'Follower Magnet',
      description: 'Gain 50 followers',
      icon: Users,
      category: 'social',
      points: 400,
      earned: false,
      progress: 23,
      maxProgress: 50,
      rarity: 'rare'
    },
    {
      id: 'trendsetter',
      title: 'Trendsetter',
      description: 'Use trending hashtags in 20 posts',
      icon: TrendingUp,
      category: 'social',
      points: 180,
      earned: false,
      progress: 6,
      maxProgress: 20,
      rarity: 'common'
    },
    {
      id: 'caffeine-addict',
      title: 'Caffeine Connoisseur',
      description: 'Post 25 coffee or tea related meals',
      icon: Coffee,
      category: 'nutrition',
      points: 120,
      earned: false,
      progress: 11,
      maxProgress: 25,
      rarity: 'common'
    },
    {
      id: 'fruit-lover',
      title: 'Fruit Fanatic',
      description: 'Include fruits in 30 meal posts',
      icon: Apple,
      category: 'nutrition',
      points: 200,
      earned: false,
      progress: 14,
      maxProgress: 30,
      rarity: 'uncommon'
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Post meals within 30 minutes of workouts 15 times',
      icon: Clock,
      category: 'fitness',
      points: 300,
      earned: false,
      progress: 4,
      maxProgress: 15,
      rarity: 'rare'
    },
    {
      id: 'consistency-king',
      title: 'Consistency King',
      description: 'Post meals for 100 consecutive days',
      icon: Calendar,
      category: 'consistency',
      points: 800,
      earned: false,
      progress: 23,
      maxProgress: 100,
      rarity: 'legendary'
    },
    {
      id: 'macro-perfectionist',
      title: 'Macro Perfectionist',
      description: 'Hit exact macro targets (±5g) for 20 days',
      icon: Target,
      category: 'nutrition',
      points: 450,
      earned: false,
      progress: 3,
      maxProgress: 20,
      rarity: 'rare'
    },
    {
      id: 'calorie-tracker',
      title: 'Calorie Counter',
      description: 'Track calories for 100 meal posts',
      icon: Target,
      category: 'nutrition',
      points: 250,
      earned: false,
      progress: 45,
      maxProgress: 100,
      rarity: 'uncommon'
    },
    {
      id: 'weekend-warrior',
      title: 'Weekend Warrior',
      description: 'Post workout meals on weekends for 8 weeks',
      icon: Trophy,
      category: 'fitness',
      points: 280,
      earned: false,
      progress: 2,
      maxProgress: 8,
      rarity: 'uncommon'
    },
    {
      id: 'meal-prep-master',
      title: 'Meal Prep Master',
      description: 'Post meal prep content 20 times',
      icon: Calendar,
      category: 'nutrition',
      points: 220,
      earned: false,
      progress: 0,
      maxProgress: 20,
      rarity: 'uncommon'
    },
    {
      id: 'motivation-machine',
      title: 'Motivation Machine',
      description: 'Receive 500 total likes across all posts',
      icon: Heart,
      category: 'social',
      points: 600,
      earned: false,
      progress: 287,
      maxProgress: 500,
      rarity: 'rare'
    },
    {
      id: 'century-club',
      title: 'Century Club',
      description: 'Create 100 total meal posts',
      icon: Star,
      category: 'social',
      points: 500,
      earned: false,
      progress: 67,
      maxProgress: 100,
      rarity: 'rare'
    },
    {
      id: 'protein-champion',
      title: 'Protein Champion',
      description: 'Meet protein goals for 25 consecutive days',
      icon: Zap,
      category: 'nutrition',
      points: 350,
      earned: false,
      progress: 8,
      maxProgress: 25,
      rarity: 'rare'
    },
    {
      id: 'variety-seeker',
      title: 'Variety Seeker',
      description: 'Post 50 different types of foods',
      icon: Apple,
      category: 'nutrition',
      points: 300,
      earned: false,
      progress: 32,
      maxProgress: 50,
      rarity: 'uncommon'
    },
    {
      id: 'community-helper',
      title: 'Community Helper',
      description: 'Help 25 users by answering their questions',
      icon: Users,
      category: 'social',
      points: 350,
      earned: false,
      progress: 0,
      maxProgress: 25,
      rarity: 'rare'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'social', name: 'Social', icon: Star },
    { id: 'consistency', name: 'Consistency', icon: Calendar },
    { id: 'nutrition', name: 'Nutrition', icon: Target },
    { id: 'fitness', name: 'Fitness', icon: Zap }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const earnedAchievements = filteredAchievements.filter(a => a.earned);
  const availableAchievements = filteredAchievements.filter(a => !a.earned);

  const totalPoints = earnedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'legendary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AchievementCard = ({ achievement }) => (
    <Card className={`${achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-lg ${achievement.earned ? 'bg-green-100' : 'bg-gray-100'}`}>
            <achievement.icon 
              size={24} 
              className={achievement.earned ? 'text-green-600' : 'text-gray-400'} 
            />
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge variant="default" className={getRarityColor(achievement.rarity)}>
              {achievement.rarity}
            </Badge>
            <span className="text-sm font-medium text-gray-600">
              {achievement.points} pts
            </span>
          </div>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-1">{achievement.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
        
        {achievement.earned ? (
          <div className="flex items-center space-x-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              ✓ Earned
            </Badge>
            <span className="text-xs text-gray-500">
              {achievement.earnedDate}
            </span>
          </div>
        ) : (
          <>
            {achievement.progress !== undefined && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-2"
                />
              </div>
            )}
            {achievement.progress === 0 && (
              <div className="flex items-center space-x-2">
                <Lock size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Not started</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
            <p className="text-gray-600">Track your progress and unlock rewards</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{earnedAchievements.length}</p>
              <p className="text-sm text-gray-600">Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{availableAchievements.length}</p>
              <p className="text-sm text-gray-600">Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{totalPoints}</p>
              <p className="text-sm text-gray-600">Points</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon size={16} />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements Tabs */}
        <Tabs defaultValue="earned" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="earned">Earned ({earnedAchievements.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableAchievements.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned" className="space-y-4">
            {earnedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {earnedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-600">Start posting meals to earn your first achievement!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="available" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Achievements;