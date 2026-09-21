import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Save, MapPin, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: 'Shane Barone',
    username: 'shane_barone',
    bio: "I'm an android triathlete",
    location: 'Estero, United States',
    website: '',
    sport: 'triathlon',
    experience: 'advanced',
    goals: 'performance',
    profileImage: 'lovable-uploads/e7d05831-2e7d-460c-9e26-c3da3057e08c.png'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Handle save logic
    console.log('Saving profile...', formData);
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-szalty-offWhite p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-szalty-blueGray"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-szalty-charcoal">Edit Profile</h1>
              <p className="text-szalty-blueGray">Update your profile information</p>
            </div>
          </div>
          <Button onClick={handleSave} className="bg-szalty-blue hover:bg-szalty-blue/90">
            <Save size={16} className="mr-2" />
            Save
          </Button>
        </div>

        {/* Profile Photo */}
        <Card className="border-szalty-lightGray">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-szalty-charcoal">
              <Camera size={20} className="text-szalty-blue" />
              <span>Profile Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.profileImage} />
                <AvatarFallback className="bg-szalty-lightGray text-szalty-charcoal">SB</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" className="flex items-center space-x-2 border-szalty-lightGray">
                  <Camera size={16} />
                  <span>Change Photo</span>
                </Button>
                <p className="text-sm text-szalty-blueGray">
                  Recommended: Square image, at least 400x400px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-szalty-lightGray">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-szalty-charcoal">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-szalty-charcoal">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="border-szalty-lightGray focus:border-szalty-blue"
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <Label htmlFor="username" className="text-szalty-charcoal">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="border-szalty-lightGray focus:border-szalty-blue"
                placeholder="@username"
              />
              <p className="text-sm text-szalty-blueGray mt-1">
                This is how others will find you on Szalty
              </p>
            </div>
            
            <div>
              <Label htmlFor="bio" className="text-szalty-charcoal">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="border-szalty-lightGray focus:border-szalty-blue min-h-[80px]"
                placeholder="Tell others about yourself..."
              />
              <p className="text-sm text-szalty-blueGray mt-1">
                {formData.bio.length}/150 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Location & Links */}
        <Card className="border-szalty-lightGray">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-szalty-charcoal">
              <MapPin size={20} className="text-szalty-blue" />
              <span>Location & Links</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="location" className="text-szalty-charcoal">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="border-szalty-lightGray focus:border-szalty-blue"
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <Label htmlFor="website" className="text-szalty-charcoal">Website</Label>
              <div className="flex items-center space-x-2">
                <LinkIcon size={16} className="text-szalty-blueGray" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="border-szalty-lightGray focus:border-szalty-blue"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Athletic Profile */}
        <Card className="border-szalty-lightGray">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-szalty-charcoal">
              Athletic Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sport" className="text-szalty-charcoal">Primary Sport</Label>
              <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                <SelectTrigger className="border-szalty-lightGray focus:border-szalty-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="cycling">Cycling</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="triathlon">Triathlon</SelectItem>
                  <SelectItem value="crossfit">CrossFit</SelectItem>
                  <SelectItem value="weightlifting">Weightlifting</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experience" className="text-szalty-charcoal">Experience Level</Label>
              <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                <SelectTrigger className="border-szalty-lightGray focus:border-szalty-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                  <SelectItem value="expert">Expert (5+ years)</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="goals" className="text-szalty-charcoal">Primary Goals</Label>
              <Select value={formData.goals} onValueChange={(value) => handleInputChange('goals', value)}>
                <SelectTrigger className="border-szalty-lightGray focus:border-szalty-blue">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance">Performance & Competition</SelectItem>
                  <SelectItem value="fitness">General Fitness</SelectItem>
                  <SelectItem value="weightloss">Weight Loss</SelectItem>
                  <SelectItem value="muscle">Muscle Building</SelectItem>
                  <SelectItem value="endurance">Endurance Training</SelectItem>
                  <SelectItem value="recovery">Recovery & Health</SelectItem>
                  <SelectItem value="lifestyle">Healthy Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 border-szalty-lightGray text-szalty-charcoal hover:bg-szalty-lightGray"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="flex-1 bg-szalty-blue hover:bg-szalty-blue/90"
          >
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;