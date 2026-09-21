import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Check, X, ExternalLink, Activity, Heart, Scale, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const ConnectedAppsSettings = () => {
  const navigate = useNavigate();
  const [connectedApps, setConnectedApps] = useState([
    {
      id: 'strava',
      name: 'Strava',
      description: 'Sync workouts and training data',
      icon: Activity,
      connected: true,
      lastSync: '2 hours ago',
      permissions: ['workouts', 'achievements', 'routes'],
      color: 'bg-orange-500'
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      description: 'Import workout data and heart rate',
      icon: Heart,
      connected: false,
      lastSync: null,
      permissions: ['workouts', 'health_data', 'sleep'],
      color: 'bg-blue-600'
    },
    {
      id: 'myfitnesspal',
      name: 'MyFitnessPal',
      description: 'Sync nutrition and food database',
      icon: Scale,
      connected: true,
      lastSync: '1 day ago',
      permissions: ['nutrition', 'food_diary', 'weight'],
      color: 'bg-blue-500'
    },
    {
      id: 'applefit',
      name: 'Apple Fitness',
      description: 'Sync workouts and health metrics',
      icon: Smartphone,
      connected: false,
      lastSync: null,
      permissions: ['workouts', 'health_data', 'activity'],
      color: 'bg-gray-800'
    }
  ]);

  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncFrequency: 'hourly',
    includePrivateWorkouts: false,
    shareAchievements: true
  });

  const toggleConnection = (appId: string) => {
    setConnectedApps(prev => 
      prev.map(app => 
        app.id === appId 
          ? { ...app, connected: !app.connected, lastSync: !app.connected ? 'Just now' : null }
          : app
      )
    );
  };

  const handleSync = (appId: string) => {
    setConnectedApps(prev => 
      prev.map(app => 
        app.id === appId 
          ? { ...app, lastSync: 'Just now' }
          : app
      )
    );
  };

  const handleSyncSettingChange = (key: string, value: boolean | string) => {
    setSyncSettings(prev => ({ ...prev, [key]: value }));
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Connected Apps</h1>
            <p className="text-gray-600">Manage third-party integrations</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Link size={20} className="text-blue-600" />
              <span>Available Integrations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedApps.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${app.color} text-white`}>
                        <app.icon size={20} />
                      </div>
                      {app.connected ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <Check size={12} className="mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          <X size={12} className="mr-1" />
                          Not Connected
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{app.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    
                    {app.connected && app.lastSync && (
                      <p className="text-xs text-gray-500">
                        Last sync: {app.lastSync}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 mt-4">
                    <Button
                      variant={app.connected ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleConnection(app.id)}
                      className="w-full"
                    >
                      {app.connected ? 'Disconnect' : 'Connect'}
                    </Button>
                    
                    {app.connected && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(app.id)}
                        className="w-full"
                      >
                        Sync Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Activity size={20} className="text-blue-600" />
              <span>Sync Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Automatic sync</label>
                <p className="text-sm text-gray-500">Automatically sync data from connected apps</p>
              </div>
              <Switch
                checked={syncSettings.autoSync}
                onCheckedChange={(value) => handleSyncSettingChange('autoSync', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Include private workouts</label>
                <p className="text-sm text-gray-500">Sync workouts marked as private</p>
              </div>
              <Switch
                checked={syncSettings.includePrivateWorkouts}
                onCheckedChange={(value) => handleSyncSettingChange('includePrivateWorkouts', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Share achievements</label>
                <p className="text-sm text-gray-500">Post achievements from connected apps to Szalty</p>
              </div>
              <Switch
                checked={syncSettings.shareAchievements}
                onCheckedChange={(value) => handleSyncSettingChange('shareAchievements', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <ExternalLink size={20} className="text-blue-600" />
              <span>Data Import & Export</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Import historical data from connected apps
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Export your Szalty data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Bulk import from CSV file
              </Button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Data Sync Status</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {connectedApps.filter(app => app.connected).length} of {connectedApps.length} apps connected. 
                    Next automatic sync in 45 minutes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-blue-600">
                How to connect your fitness tracker
              </Button>
              <Button variant="ghost" className="w-full justify-start text-blue-600">
                Troubleshooting sync issues
              </Button>
              <Button variant="ghost" className="w-full justify-start text-blue-600">
                Supported apps and devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectedAppsSettings;