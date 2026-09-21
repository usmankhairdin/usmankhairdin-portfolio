
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Settings, MapPin, Award, Flame, Droplets, Zap, Heart, MessageCircle } from "lucide-react";

const profileStats = [
  { label: "Posts", value: "50" },
  { label: "Followers", value: "5" },
  { label: "Following", value: "6" }
];

const achievements = [
  { 
    name: "7-Day Streak", 
    description: "Posted meals for 7 consecutive days", 
    icon: Flame,
    iconColor: "text-szalty-recovery"
  },
  { 
    name: "Hydration Expert", 
    description: "Tracked water intake for 30 days", 
    icon: Droplets,
    iconColor: "text-szalty-blue"
  },
  { 
    name: "Protein Powerhouse", 
    description: "Consistently hit protein goals for 14 days", 
    icon: Zap,
    iconColor: "text-szalty-fat"
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="pb-20 bg-szalty-offWhite min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4 pt-2">
        <h1 className="text-xl font-bold text-szalty-charcoal">Shane Barone</h1>
        <button onClick={() => navigate('/settings')}>
          <Settings size={20} className="text-szalty-blueGray" />
        </button>
      </div>
      
      {/* Profile Section */}
      <div className="px-4 mb-6">
        <div className="flex items-start mb-4">
          <Avatar className="h-16 w-16 mr-3">
            <AvatarImage src="lovable-uploads/e7d05831-2e7d-460c-9e26-c3da3057e08c.png" alt="Shane Barone" />
          </Avatar>
          
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3 text-center">
              {profileStats.map((stat, index) => (
                <div key={index}>
                  <p className="text-lg font-bold text-szalty-charcoal">{stat.value}</p>
                  <p className="text-xs text-szalty-blueGray">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-1 mb-4">
          <h2 className="font-semibold text-base text-szalty-charcoal">Shane Barone</h2>
          <p className="text-sm text-szalty-blueGray">I'm an android triathlete</p>
          <div className="flex items-center text-szalty-blueGray">
            <MapPin size={14} className="mr-1" />
            <span className="text-xs">Estero, United States</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/profile/edit')}
          className="w-full border-szalty-lightGray text-szalty-charcoal hover:bg-szalty-lightGray text-sm"
        >
          Edit Profile
        </Button>
      </div>
      
      {/* Achievements Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Award className="text-szalty-blue mr-2" size={18} />
            <h2 className="font-semibold text-base text-szalty-charcoal">Achievements</h2>
          </div>
          <button 
            onClick={() => navigate('/achievements')}
            className="text-szalty-blue text-xs font-medium"
          >
            See All
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-szalty-lightGray">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">
                    <IconComponent size={24} className={achievement.iconColor} />
                  </div>
                  <h3 className="font-semibold text-xs text-szalty-charcoal mb-1 leading-tight">{achievement.name}</h3>
                  <p className="text-xs text-szalty-blueGray leading-tight">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="flex-1">
        <Tabs defaultValue="list" className="w-full">
          <div className="px-4 mb-4">
            <TabsList className="w-full h-12 bg-szalty-lightGray p-1">
              <TabsTrigger 
                value="list" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-szalty-blue data-[state=active]:shadow-sm"
              >
                List
              </TabsTrigger>
              <TabsTrigger 
                value="grid" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-szalty-blue data-[state=active]:shadow-sm"
              >
                Grid
              </TabsTrigger>
              <TabsTrigger 
                value="calendar" 
                className="flex-1 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-szalty-blue data-[state=active]:shadow-sm"
              >
                Calendar
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="list" className="px-4 space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-szalty-lightGray">
              <img 
                src="https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format" 
                alt="Recent meal" 
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-szalty-charcoal text-sm mb-1">Coffee</h3>
                <div className="flex items-center space-x-4 text-szalty-blueGray">
                  <div className="flex items-center space-x-1">
                    <Heart size={14} />
                    <span className="text-xs">0</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={14} />
                    <span className="text-xs">0</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="grid" className="px-4">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden border border-szalty-lightGray">
                  <img 
                    src={`https://images.unsplash.com/photo-${1547592180 + i}-85f173990554?w=400&auto=format`}
                    alt={`Post ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="px-4">
            <div className="bg-white rounded-lg shadow-sm border border-szalty-lightGray p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
