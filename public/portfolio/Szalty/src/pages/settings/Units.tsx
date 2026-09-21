import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Ruler, Scale, Thermometer, Clock, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UnitsSettings = () => {
  const navigate = useNavigate();
  const [unitSystem, setUnitSystem] = useState("metric");
  const [customSettings, setCustomSettings] = useState({
    distance: "km",
    weight: "kg", 
    temperature: "celsius",
    elevation: "meters",
    pace: "min_per_km",
    energy: "kcal"
  });
  const [displaySettings, setDisplaySettings] = useState({
    showDecimals: true,
    roundValues: false,
    preferLocalFormat: true
  });
  const [timeFormat, setTimeFormat] = useState("24h");
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");

  const handleCustomSettingChange = (key: string, value: string) => {
    setCustomSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDisplaySettingChange = (key: string, value: boolean) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
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
            <h1 className="text-2xl font-bold text-gray-900">Units & Measurements</h1>
            <p className="text-gray-600">Customize display preferences</p>
          </div>
        </div>

        {/* Unit System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Ruler size={20} className="text-blue-600" />
              <span>Unit System</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={unitSystem} onValueChange={setUnitSystem}>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="metric" />
                  <label htmlFor="metric" className="flex-1">
                    <div className="font-medium text-gray-900">Metric System</div>
                    <div className="text-sm text-gray-500">Kilometers, kilograms, Celsius</div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="imperial" />
                  <label htmlFor="imperial" className="flex-1">
                    <div className="font-medium text-gray-900">Imperial System</div>
                    <div className="text-sm text-gray-500">Miles, pounds, Fahrenheit</div>
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <label htmlFor="custom" className="flex-1">
                    <div className="font-medium text-gray-900">Custom Mix</div>
                    <div className="text-sm text-gray-500">Choose units individually</div>
                  </label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Custom Unit Settings */}
        {unitSystem === "custom" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                <Scale size={20} className="text-blue-600" />
                <span>Custom Unit Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                  <Select value={customSettings.distance} onValueChange={(value) => handleCustomSettingChange('distance', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="km">Kilometers (km)</SelectItem>
                      <SelectItem value="miles">Miles (mi)</SelectItem>
                      <SelectItem value="meters">Meters (m)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <Select value={customSettings.weight} onValueChange={(value) => handleCustomSettingChange('weight', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                      <SelectItem value="grams">Grams (g)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
                  <Select value={customSettings.temperature} onValueChange={(value) => handleCustomSettingChange('temperature', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="celsius">Celsius (°C)</SelectItem>
                      <SelectItem value="fahrenheit">Fahrenheit (°F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Elevation</label>
                  <Select value={customSettings.elevation} onValueChange={(value) => handleCustomSettingChange('elevation', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meters">Meters (m)</SelectItem>
                      <SelectItem value="feet">Feet (ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pace</label>
                  <Select value={customSettings.pace} onValueChange={(value) => handleCustomSettingChange('pace', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="min_per_km">min/km</SelectItem>
                      <SelectItem value="min_per_mile">min/mile</SelectItem>
                      <SelectItem value="km_per_hour">km/h</SelectItem>
                      <SelectItem value="mph">mph</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Energy</label>
                  <Select value={customSettings.energy} onValueChange={(value) => handleCustomSettingChange('energy', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kcal">Calories (kcal)</SelectItem>
                      <SelectItem value="kj">Kilojoules (kJ)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time & Date Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Clock size={20} className="text-blue-600" />
              <span>Time & Date Format</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <Select value={timeFormat} onValueChange={setTimeFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
                  <SelectItem value="24h">24-hour (14:30)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (European)</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
                  <SelectItem value="dd-mmm-yyyy">DD-MMM-YYYY (15-Jan-2024)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Thermometer size={20} className="text-blue-600" />
              <span>Display Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Show decimal places</label>
                <p className="text-sm text-gray-500">Display 5.2 km instead of 5 km</p>
              </div>
              <Switch
                checked={displaySettings.showDecimals}
                onCheckedChange={(value) => handleDisplaySettingChange('showDecimals', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Round to nearest whole number</label>
                <p className="text-sm text-gray-500">Display 5 km instead of 5.23 km</p>
              </div>
              <Switch
                checked={displaySettings.roundValues}
                onCheckedChange={(value) => handleDisplaySettingChange('roundValues', value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Use local number format</label>
                <p className="text-sm text-gray-500">Use your region's number formatting</p>
              </div>
              <Switch
                checked={displaySettings.preferLocalFormat}
                onCheckedChange={(value) => handleDisplaySettingChange('preferLocalFormat', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">With your current settings:</p>
              <div className="space-y-1 text-sm">
                <p>• Distance: <span className="font-medium">10.2 km</span></p>
                <p>• Weight: <span className="font-medium">65.5 kg</span></p>
                <p>• Temperature: <span className="font-medium">22°C</span></p>
                <p>• Pace: <span className="font-medium">5:30 min/km</span></p>
                <p>• Time: <span className="font-medium">{timeFormat === '24h' ? '14:30' : '2:30 PM'}</span></p>
                <p>• Date: <span className="font-medium">
                  {dateFormat === 'dd/mm/yyyy' ? '15/01/2024' : 
                   dateFormat === 'mm/dd/yyyy' ? '01/15/2024' : 
                   dateFormat === 'yyyy-mm-dd' ? '2024-01-15' : '15-Jan-2024'}
                </span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnitsSettings;