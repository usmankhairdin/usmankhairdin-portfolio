import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Heart, Star, Share2, ExternalLink, Download, Users, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const AboutSettings = () => {
  const navigate = useNavigate();

  const appInfo = {
    version: '1.2.3',
    buildNumber: '2024.01.20',
    lastUpdated: 'January 20, 2024',
    size: '47.2 MB'
  };

  const team = [
    { name: 'Shane Barone', role: 'Founder & CEO', expertise: 'Sports Technology', avatar: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face' },
    { name: 'Dr. Ashley Mandeville', role: 'COO', expertise: 'Operations & Strategy', avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face' },
    { name: 'João Hooks', role: 'Lead Developer', expertise: 'Mobile Engineering', avatar: 'https://i.pravatar.cc/150?img=3' },
    { name: 'Grace Plager', role: 'Nutrition Advisor', expertise: 'Sports Nutrition', avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face' }
  ];

  const stats = [
    { label: 'Active Athletes', value: '250K+', icon: Users },
    { label: 'Meal Posts', value: '5.2M+', icon: Heart },
    { label: 'Connected Workouts', value: '1.8M+', icon: Zap },
    { label: 'Countries', value: '45+', icon: Trophy }
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Szalty - Fuel Your Performance',
        text: 'Join me on Szalty, the app for athletes to share nutrition and fuel strategies!',
        url: 'https://szalty.com'
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText('Check out Szalty: https://szalty.com');
    }
  };

  const handleRate = () => {
    // This would open the app store rating page
    console.log('Opening app store for rating...');
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
            <h1 className="text-2xl font-bold text-gray-900">About Szalty</h1>
            <p className="text-gray-600">App information and updates</p>
          </div>
        </div>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Info size={20} className="text-blue-600" />
              <span>App Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Szalty</h2>
              <p className="text-gray-600">Fuel Your Performance</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-semibold text-gray-900">{appInfo.version}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Build</p>
                <p className="font-semibold text-gray-900">{appInfo.buildNumber}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-semibold text-gray-900">{appInfo.lastUpdated}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">App Size</p>
                <p className="font-semibold text-gray-900">{appInfo.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's New */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">What's New in v1.2.3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="bg-blue-100 text-blue-800 mt-0.5">New</Badge>
                <div>
                  <p className="font-medium text-gray-900">Photo Tagging</p>
                  <p className="text-sm text-gray-600">Tag individual photos with meal timing for better nutrition tracking</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="bg-green-100 text-green-800 mt-0.5">Improved</Badge>
                <div>
                  <p className="font-medium text-gray-900">Performance Analytics</p>
                  <p className="text-sm text-gray-600">Enhanced analytics dashboard with better insights</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge variant="default" className="bg-purple-100 text-purple-800 mt-0.5">Fixed</Badge>
                <div>
                  <p className="font-medium text-gray-900">Sync Issues</p>
                  <p className="text-sm text-gray-600">Resolved connectivity issues with Strava and Garmin</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Community Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Community Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <stat.icon size={16} className="text-blue-600" />
                  </div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Heart size={20} className="text-red-500" />
              <span>Our Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Szalty empowers athletes of all levels to optimize their performance through better nutrition. 
              We believe that sharing knowledge and experiences creates a stronger, more successful athletic community. 
              Whether you're training for your first 5K or competing at the Olympic level, proper fueling is the 
              foundation of peak performance.
            </p>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Users size={20} className="text-blue-600" />
              <span>Meet the Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {team.map((member, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.role}</p>
                    <p className="text-xs text-gray-500">{member.expertise}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Share & Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Share the Love</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleShare} className="w-full justify-start">
              <Share2 size={16} className="mr-2" />
              Share Szalty with Friends
            </Button>
            <Button onClick={handleRate} variant="outline" className="w-full justify-start">
              <Star size={16} className="mr-2" />
              Rate Us in the App Store
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink size={16} className="mr-2" />
              Follow Us on Social Media
            </Button>
          </CardContent>
        </Card>

        {/* Legal & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Legal & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-blue-600">
              <ExternalLink size={16} className="mr-2" />
              Privacy Policy
            </Button>
            <Button variant="ghost" className="w-full justify-start text-blue-600">
              <ExternalLink size={16} className="mr-2" />
              Terms of Service
            </Button>
            <Button variant="ghost" className="w-full justify-start text-blue-600">
              <ExternalLink size={16} className="mr-2" />
              Open Source Licenses
            </Button>
            <Button variant="ghost" className="w-full justify-start text-blue-600">
              <Download size={16} className="mr-2" />
              Download Your Data
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Made with ❤️ for athletes worldwide</p>
          <p className="mt-1">© 2024 Szalty Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;