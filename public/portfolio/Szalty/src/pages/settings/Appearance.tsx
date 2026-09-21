import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Monitor, Sun, Moon, Type, Layout, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

const AppearanceSettings = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState("system");
  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showAnimations: true,
    reducedMotion: false,
    highContrast: false,
    colorBlindMode: false
  });
  const [feedSettings, setFeedSettings] = useState({
    imageQuality: "high",
    autoPlayVideos: true,
    showCalorieColors: true,
    largeImages: false
  });

  const handleDisplaySettingChange = (key: string, value: boolean) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFeedSettingChange = (key: string, value: boolean | string) => {
    setFeedSettings(prev => ({ ...prev, [key]: value }));
  };

  const accentColors = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { id: 'red', name: 'Red', color: 'bg-red-500' },
    { id: 'pink', name: 'Pink', color: 'bg-pink-500' },
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
            <h1 className="text-2xl font-bold text-gray-900">Appearance</h1>
            <p className="text-gray-600">Customize the look and feel</p>
          </div>
        </div>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Monitor size={20} className="text-blue-600" />
              <span>Theme</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={theme} onValueChange={setTheme}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <label htmlFor="light" className="flex items-center space-x-3 flex-1">
                    <Sun size={20} className="text-yellow-500" />
                    <div>
                      <div className="font-medium text-gray-900">Light Mode</div>
                      <div className="text-sm text-gray-500">Clean, bright interface</div>
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <label htmlFor="dark" className="flex items-center space-x-3 flex-1">
                    <Moon size={20} className="text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Dark Mode</div>
                      <div className="text-sm text-gray-500">Easy on the eyes, great for night use</div>
                    </div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <label htmlFor="system" className="flex items-center space-x-3 flex-1">
                    <Monitor size={20} className="text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">System Default</div>
                      <div className="text-sm text-gray-500">Matches your device settings</div>
                    </div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppearanceSettings;