import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, MapPin, Save, Camera, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    username: 'sarahj_runner',
    email: 'sarah.johnson@email.com',
    bio: 'Marathon runner and nutrition enthusiast. Always looking for the perfect pre-race fuel!',
    location: 'San Francisco, CA',
    birthDate: '1992-03-15',
    sport: 'running',
    experience: 'intermediate',
    goals: 'performance'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic
    console.log('Saving account settings...', formData);
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
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your profile information</p>
          </div>
        </div>

        {/* Profile Photo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <User size={20} className="text-blue-600" />
              <span>Profile Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Camera size={16} />
                  <span>Change Photo</span>
                </Button>
                <p className="text-sm text-gray-500">
                  Upload a new profile picture. Recommended size: 400x400px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Edit3 size={20} className="text-blue-600" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="@username"
              />
              <p className="text-sm text-gray-500 mt-1">
                This is how others will find you on Szalty
              </p>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell others about yourself..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <MapPin size={20} className="text-blue-600" />
              <span>Location & Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, State/Country"
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Athletic Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Calendar size={20} className="text-blue-600" />
              <span>Athletic Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sport">Primary Sport</Label>
              <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="weightlifting">Weightlifting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="goals">Primary Goals</Label>
              <Select value={formData.goals} onValueChange={(value) => handleInputChange('goals', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance & Competition</SelectItem>
                  <SelectItem value="fitness">General Fitness</SelectItem>
                  <SelectItem value="weightloss">Weight Loss</SelectItem>
                  <SelectItem value="muscle">Muscle Building</SelectItem>
                  <SelectItem value="endurance">Endurance Training</SelectItem>
                  <SelectItem value="recovery">Recovery & Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Mail size={20} className="text-blue-600" />
              <span>Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Change Password
            </Button>
            <p className="text-sm text-gray-500">
              For security changes, you'll be redirected to a secure page
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save size={16} />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;