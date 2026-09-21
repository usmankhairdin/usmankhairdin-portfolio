import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Activity, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const SecuritySettings = () => {
  const navigate = useNavigate();
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const [activeSessions] = useState([
    {
      id: '1',
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      lastActive: '2 minutes ago',
      current: true,
      ip: '192.168.1.100'
    },
    {
      id: '2',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      lastActive: '1 hour ago',
      current: false,
      ip: '192.168.1.101'
    },
    {
      id: '3',
      device: 'iPad',
      location: 'Oakland, CA',
      lastActive: '3 days ago',
      current: false,
      ip: '10.0.1.50'
    }
  ]);

  const [loginHistory] = useState([
    {
      date: '2024-01-20 14:30',
      device: 'iPhone 14 Pro',
      location: 'San Francisco, CA',
      status: 'success',
      ip: '192.168.1.100'
    },
    {
      date: '2024-01-20 09:15',
      device: 'MacBook Pro',
      location: 'San Francisco, CA',
      status: 'success',
      ip: '192.168.1.101'
    },
    {
      date: '2024-01-19 20:45',
      device: 'Unknown Device',
      location: 'Los Angeles, CA',
      status: 'blocked',
      ip: '203.0.113.1'
    }
  ]);

  const terminateSession = (sessionId: string) => {
    console.log('Terminating session:', sessionId);
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
            <h1 className="text-2xl font-bold text-gray-900">Security</h1>
            <p className="text-gray-600">Protect your account and data</p>
          </div>
        </div>

        {/* Security Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Shield size={20} className="text-green-600" />
              <span>Security Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Strong password</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Account verification</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Shield size={20} className="text-blue-600" />
              <span>Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <div className="text-xs text-gray-500">
                Last changed: 3 months ago
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Activity size={20} className="text-blue-600" />
              <span>Login Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Login alerts</label>
                <p className="text-sm text-gray-500">Get notified of new logins to your account</p>
              </div>
              <Switch
                checked={loginAlerts}
                onCheckedChange={setLoginAlerts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Automatic session timeout</label>
                <p className="text-sm text-gray-500">Log out automatically after 30 days of inactivity</p>
              </div>
              <Switch
                checked={sessionTimeout}
                onCheckedChange={setSessionTimeout}
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Smartphone size={20} className="text-blue-600" />
              <span>Active Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{session.device}</h3>
                        {session.current && (
                          <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{session.location}</p>
                      <p className="text-xs text-gray-500">
                        Last active: {session.lastActive} • {session.ip}
                      </p>
                    </div>
                    {!session.current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => terminateSession(session.id)}
                      >
                        End Session
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="destructive" className="w-full mt-4">
              End All Other Sessions
            </Button>
          </CardContent>
        </Card>

        {/* Login History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Recent Login Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loginHistory.map((login, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{login.device}</p>
                    <p className="text-xs text-gray-500">{login.location} • {login.ip}</p>
                    <p className="text-xs text-gray-400">{login.date}</p>
                  </div>
                  <Badge 
                    variant="default" 
                    className={`text-xs ${
                      login.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {login.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Emergency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-red-600">
              <AlertTriangle size={20} />
              <span>Emergency</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">
                If you believe your account has been compromised, take immediate action:
              </p>
              <div className="space-y-2">
                <Button variant="destructive" className="w-full">
                  Secure My Account Now
                </Button>
                <Button variant="outline" className="w-full">
                  Report Security Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecuritySettings;