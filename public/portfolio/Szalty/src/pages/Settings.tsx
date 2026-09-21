
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Shield, 
  Ruler, 
  Link, 
  Palette, 
  User, 
  CreditCard, 
  Lock, 
  HelpCircle, 
  Info, 
  LogOut,
  ChevronRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Personal Settings",
      items: [
        {
          title: "Account Settings",
          description: "Profile information, email, password",
          icon: User,
          action: () => navigate('/settings/account'),
          hasSubPage: false
        },
        {
          title: "Notifications",
          description: "Manage your notification preferences",
          icon: Bell,
          action: () => navigate('/settings/notifications'),
          hasSubPage: true
        },
        {
          title: "Privacy & Visibility",
          description: "Control who can see your content",
          icon: Shield,
          action: () => navigate('/settings/privacy'),
          hasSubPage: true
        }
      ]
    },
    {
      title: "App Preferences",
      items: [
        {
          title: "Units & Measurements",
          description: "Metric vs Imperial, display preferences",
          icon: Ruler,
          action: () => navigate('/settings/units'),
          hasSubPage: true
        },
        {
          title: "Connected Apps",
          description: "Strava, Garmin, MyFitnessPal integrations",
          icon: Link,
          action: () => navigate('/settings/connected-apps'),
          hasSubPage: true
        },
        {
          title: "Appearance",
          description: "Display theme",
          icon: Palette,
          action: () => navigate('/settings/appearance'),
          hasSubPage: true
        }
      ]
    },
    {
      title: "Account & Billing",
      items: [
        {
          title: "Subscription & Billing",
          description: "Manage your premium subscription",
          icon: CreditCard,
          action: () => navigate('/settings/billing'),
          hasSubPage: false,
          isPremium: true
        },
        {
          title: "Security",
          description: "Password and login security",
          icon: Lock,
          action: () => navigate('/settings/security'),
          hasSubPage: false
        }
      ]
    },
    {
      title: "Help & Support",
      items: [
        {
          title: "Help & Support",
          description: "FAQ, contact support, report issues",
          icon: HelpCircle,
          action: () => navigate('/settings/help'),
          hasSubPage: false
        },
        {
          title: "App Information",
          description: "Version, what's new, share app",
          icon: Info,
          action: () => navigate('/settings/about'),
          hasSubPage: false
        }
      ]
    }
  ];

  const handleSignOut = () => {
    // Handle sign out logic
    console.log('Signing out...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your Szalty experience</p>
        </div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {group.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <button
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <item.icon size={20} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          {item.isPremium && (
                            <Star size={16} className="text-yellow-500 fill-current" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    {item.hasSubPage && (
                      <ChevronRight size={20} className="text-gray-400" />
                    )}
                  </button>
                  {itemIndex < group.items.length - 1 && (
                    <Separator className="ml-16" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Sign Out */}
        <Card>
          <CardContent className="p-0">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-4 p-4 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut size={20} className="text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          Szalty v1.2.3 • Made for athletes
        </div>
      </div>
    </div>
  );
};

export default Settings;
