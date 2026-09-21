
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, BarChart3, Activity, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const PrivacySettings = () => {
  const navigate = useNavigate();
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [defaultPostPrivacy, setDefaultPostPrivacy] = useState("public");
  const [contentVisibility, setContentVisibility] = useState({
    achievements: true,
    workoutData: true,
    nutritionalData: true,
    locationTags: false,
    mealTiming: true,
    followerCounts: true,
    performanceRatings: true,
    connectedApps: false
  });
  const [activityVisibility, setActivityVisibility] = useState({
    workoutAchievements: true,
    nutritionStreaks: true,
    performanceAnalytics: false
  });
  const [dataPrivacy, setDataPrivacy] = useState({
    allowDataExport: true,
    analyticsSharing: false,
    researchParticipation: false
  });

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
            <h1 className="text-2xl font-bold text-gray-900">Privacy & Visibility</h1>
            <p className="text-gray-600">Control who can see your content</p>
          </div>
        </div>

        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Eye size={20} className="text-blue-600" />
              <span>Profile Visibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={profileVisibility} onValueChange={setProfileVisibility}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <label htmlFor="private" className="flex-1">
                    <div className="font-medium text-gray-900">Private</div>
                    <div className="text-sm text-gray-500">Only approved followers can see your posts</div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <label htmlFor="public" className="flex-1">
                    <div className="font-medium text-gray-900">Fully Public</div>
                    <div className="text-sm text-gray-500">Everyone can see all your content</div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Default Post Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Shield size={20} className="text-blue-600" />
              <span>Default Post Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={defaultPostPrivacy} onValueChange={setDefaultPostPrivacy}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="post-public" />
                  <label htmlFor="post-public" className="flex-1">
                    <div className="font-medium text-gray-900">Public posts (default)</div>
                    <div className="text-sm text-gray-500">Everyone can see your posts</div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followers-only" id="post-followers" />
                  <label htmlFor="post-followers" className="flex-1">
                    <div className="font-medium text-gray-900">Followers only</div>
                    <div className="text-sm text-gray-500">Only your followers can see posts</div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="post-private" />
                  <label htmlFor="post-private" className="flex-1">
                    <div className="font-medium text-gray-900">Private (only me)</div>
                    <div className="text-sm text-gray-500">Only you can see your posts</div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Content Visibility Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <BarChart3 size={20} className="text-blue-600" />
              <span>Content Visibility Controls</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'achievements', label: 'Show achievements/badges' },
              { key: 'workoutData', label: 'Show workout data on posts' },
              { key: 'nutritionalData', label: 'Show nutritional data on posts' },
              { key: 'locationTags', label: 'Show location tags' },
              { key: 'mealTiming', label: 'Show meal timing tags' },
              { key: 'followerCounts', label: 'Show follower/following counts' },
              { key: 'performanceRatings', label: 'Show performance ratings' },
              { key: 'connectedApps', label: 'Show connected apps (Strava, etc.)' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="font-medium text-gray-900">{item.label}</label>
                <Switch
                  checked={contentVisibility[item.key as keyof typeof contentVisibility]}
                  onCheckedChange={(value) => 
                    setContentVisibility(prev => ({ ...prev, [item.key]: value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activity Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Activity size={20} className="text-blue-600" />
              <span>Activity Visibility</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'workoutAchievements', label: 'Show workout achievements' },
              { key: 'nutritionStreaks', label: 'Show nutrition streaks' },
              { key: 'performanceAnalytics', label: 'Show performance analytics preview' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <label className="font-medium text-gray-900">{item.label}</label>
                <Switch
                  checked={activityVisibility[item.key as keyof typeof activityVisibility]}
                  onCheckedChange={(value) => 
                    setActivityVisibility(prev => ({ ...prev, [item.key]: value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Lock size={20} className="text-blue-600" />
              <span>Data Privacy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'allowDataExport', label: 'Allow data export', description: 'Download your data anytime' },
              { key: 'analyticsSharing', label: 'Analytics data sharing (anonymized)', description: 'Help improve the app' },
              { key: 'researchParticipation', label: 'Research participation (opt-in)', description: 'Contribute to sports science research' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="font-medium text-gray-900">{item.label}</label>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch
                  checked={dataPrivacy[item.key as keyof typeof dataPrivacy]}
                  onCheckedChange={(value) => 
                    setDataPrivacy(prev => ({ ...prev, [item.key]: value }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacySettings;
