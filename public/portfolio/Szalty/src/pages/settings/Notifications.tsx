
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Users, TrendingUp, Activity, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NotificationsSettings = () => {
  const navigate = useNavigate();
  const [masterToggle, setMasterToggle] = useState(true);
  const [socialSettings, setSocialSettings] = useState({
    likes: true,
    comments: true,
    followers: true,
    followRequests: true,
    achievements: true,
    streaks: true
  });
  const [contentSettings, setContentSettings] = useState({
    followingPosts: true,
    weeklyInsights: true,
    monthlyReports: false,
    trending: true,
    featured: false
  });
  const [workoutSettings, setWorkoutSettings] = useState({
    reminders: true,
    fuelSuggestions: false,
    mealReminders: true,
    recoveryAlerts: false,
    syncNotifications: true
  });
  const [frequencySettings, setFrequencySettings] = useState({
    instant: true,
    dailySummary: true,
    weeklyDigest: true,
    quietHours: true
  });

  const settingsGroups = [
    {
      title: "Master Control",
      icon: Bell,
      items: [
        {
          key: "master",
          label: "All Notifications",
          description: "Turn all notifications on or off",
          value: masterToggle,
          onChange: setMasterToggle
        }
      ]
    },
    {
      title: "Social Interactions",
      icon: Users,
      items: [
        {
          key: "likes",
          label: "New likes on my posts",
          value: socialSettings.likes,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, likes: value }))
        },
        {
          key: "comments",
          label: "Comments on my posts",
          value: socialSettings.comments,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, comments: value }))
        },
        {
          key: "followers",
          label: "New followers",
          value: socialSettings.followers,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, followers: value }))
        },
        {
          key: "followRequests",
          label: "Follow requests (private accounts)",
          value: socialSettings.followRequests,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, followRequests: value }))
        },
        {
          key: "achievements",
          label: "Achievement unlocked",
          value: socialSettings.achievements,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, achievements: value }))
        },
        {
          key: "streaks",
          label: "Streak milestones",
          value: socialSettings.streaks,
          onChange: (value: boolean) => setSocialSettings(prev => ({ ...prev, streaks: value }))
        }
      ]
    },
    {
      title: "Content Updates",
      icon: TrendingUp,
      items: [
        {
          key: "followingPosts",
          label: "New posts from people I follow",
          value: contentSettings.followingPosts,
          onChange: (value: boolean) => setContentSettings(prev => ({ ...prev, followingPosts: value }))
        },
        {
          key: "weeklyInsights",
          label: "Weekly nutrition insights",
          value: contentSettings.weeklyInsights,
          onChange: (value: boolean) => setContentSettings(prev => ({ ...prev, weeklyInsights: value }))
        },
        {
          key: "monthlyReports",
          label: "Monthly performance reports",
          value: contentSettings.monthlyReports,
          onChange: (value: boolean) => setContentSettings(prev => ({ ...prev, monthlyReports: value }))
        },
        {
          key: "trending",
          label: "Trending content recommendations",
          value: contentSettings.trending,
          onChange: (value: boolean) => setContentSettings(prev => ({ ...prev, trending: value }))
        },
        {
          key: "featured",
          label: "Featured athlete content",
          value: contentSettings.featured,
          onChange: (value: boolean) => setContentSettings(prev => ({ ...prev, featured: value }))
        }
      ]
    },
    {
      title: "Workout Integration",
      icon: Activity,
      items: [
        {
          key: "reminders",
          label: "Workout completion reminders",
          value: workoutSettings.reminders,
          onChange: (value: boolean) => setWorkoutSettings(prev => ({ ...prev, reminders: value }))
        },
        {
          key: "fuelSuggestions",
          label: "Post-workout fuel suggestions",
          value: workoutSettings.fuelSuggestions,
          onChange: (value: boolean) => setWorkoutSettings(prev => ({ ...prev, fuelSuggestions: value }))
        },
        {
          key: "mealReminders",
          label: "Pre-workout meal reminders",
          value: workoutSettings.mealReminders,
          onChange: (value: boolean) => setWorkoutSettings(prev => ({ ...prev, mealReminders: value }))
        },
        {
          key: "recoveryAlerts",
          label: "Recovery nutrition alerts",
          value: workoutSettings.recoveryAlerts,
          onChange: (value: boolean) => setWorkoutSettings(prev => ({ ...prev, recoveryAlerts: value }))
        },
        {
          key: "syncNotifications",
          label: "Connected app sync notifications",
          value: workoutSettings.syncNotifications,
          onChange: (value: boolean) => setWorkoutSettings(prev => ({ ...prev, syncNotifications: value }))
        }
      ]
    },
    {
      title: "Frequency Settings",
      icon: Clock,
      items: [
        {
          key: "instant",
          label: "Instant notifications",
          value: frequencySettings.instant,
          onChange: (value: boolean) => setFrequencySettings(prev => ({ ...prev, instant: value }))
        },
        {
          key: "dailySummary",
          label: "Daily summary (evening digest)",
          value: frequencySettings.dailySummary,
          onChange: (value: boolean) => setFrequencySettings(prev => ({ ...prev, dailySummary: value }))
        },
        {
          key: "weeklyDigest",
          label: "Weekly digest (Sunday recap)",
          value: frequencySettings.weeklyDigest,
          onChange: (value: boolean) => setFrequencySettings(prev => ({ ...prev, weeklyDigest: value }))
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Manage your notification preferences</p>
          </div>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <group.icon size={20} className="text-blue-600" />
                <span>{group.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.items.map((item, itemIndex) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.label}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                  <Switch
                    checked={item.value}
                    onCheckedChange={item.onChange}
                    disabled={!masterToggle && item.key !== 'master'}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Clock size={20} className="text-blue-600" />
              <span>Quiet Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Enable quiet hours</h3>
                <p className="text-sm text-gray-500">No notifications during set hours</p>
              </div>
              <Switch
                checked={frequencySettings.quietHours}
                onCheckedChange={(value) => setFrequencySettings(prev => ({ ...prev, quietHours: value }))}
              />
            </div>
            {frequencySettings.quietHours && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start time</label>
                  <Select defaultValue="22:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                      <SelectItem value="23:00">11:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End time</label>
                  <Select defaultValue="07:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsSettings;
