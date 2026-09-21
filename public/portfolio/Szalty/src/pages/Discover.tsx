import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users, Hash, MapPin, Activity, Filter, Star, Flame, Clock, Trophy, Plus, Crown, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { GroupCard } from "@/components/groups/GroupCard";
import { PremiumModal } from "@/components/premium/PremiumModal";

const mockFeaturedPosts = [
  {
    id: "f1",
    user: "Pro Cyclist Emma",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format",
    description: "Race day breakfast that powered my PR - 3% time improvement!",
    performance: 4.9,
    engagement: 847,
    verified: true,
    timing: "pre" as const
  },
  {
    id: "f2", 
    user: "Ironman Jake",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format",
    description: "Recovery strategy after 140.6 - back training in 2 days",
    performance: 4.7,
    engagement: 623,
    verified: true,
    timing: "post" as const
  },
  {
    id: "f3",
    user: "Ultra Runner Sarah",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format",
    description: "100-mile fueling protocol - zero stomach issues",
    performance: 4.8,
    engagement: 912,
    verified: true,
    timing: "during" as const
  }
];

const mockTrendingPosts = [
  {
    id: "1",
    user: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format",
    description: "Pre-run fuel that got me through my best 10K!",
    engagement: 234,
    timing: "pre" as const,
    performance: 4.5
  },
  {
    id: "2", 
    user: "Mike Chen",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format",
    description: "Recovery smoothie after crushing my PR",
    engagement: 189,
    timing: "post" as const,
    performance: 4.3
  },
  {
    id: "3",
    user: "Alex Rivera",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format",
    description: "Mid-workout hydration strategy for hot weather",
    engagement: 156,
    timing: "during" as const,
    performance: 4.6
  },
  {
    id: "4",
    user: "Lisa Park",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format",
    description: "Carb loading done right - 48 hours before race",
    engagement: 298,
    timing: "pre" as const,
    performance: 4.7
  }
];

const mockAthletes = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=5",
    sport: "Triathlete",
    specialty: "Ironman",
    followers: 1245,
    verified: true,
    posts: 89,
    location: "0.8 km away",
    recentActivity: "Posted 2h ago"
  },
  {
    id: "2",
    name: "James Rodriguez", 
    avatar: "https://i.pravatar.cc/150?img=6",
    sport: "Ultra Runner",
    specialty: "100 Mile",
    followers: 876,
    verified: false,
    posts: 67,
    location: "2.1 km away",
    recentActivity: "Posted 5h ago"
  },
  {
    id: "3",
    name: "Mia Chen",
    avatar: "https://i.pravatar.cc/150?img=7",
    sport: "Cyclist",
    specialty: "Road Racing",
    followers: 2034,
    verified: true,
    posts: 134,
    location: "1.3 km away",
    recentActivity: "Posted 1h ago"
  }
];

const mockPerformanceTags = [
  { name: "preworkout", count: 1234, trending: true, category: "timing", performance: 4.6 },
  { name: "recovery", count: 987, trending: true, category: "timing", performance: 4.4 },
  { name: "raceday", count: 654, trending: true, category: "performance", performance: 4.8 },
  { name: "endurancefuel", count: 543, trending: false, category: "performance", performance: 4.5 },
  { name: "proteinpacked", count: 432, trending: false, category: "nutrition", performance: 4.3 },
  { name: "hydration", count: 421, trending: true, category: "nutrition", performance: 4.7 }
];

const mockNutritionTags = [
  { name: "plantbased", count: 567, trending: false, category: "diet", performance: 4.2 },
  { name: "carbloading", count: 445, trending: true, category: "strategy", performance: 4.6 },
  { name: "realfood", count: 389, trending: false, category: "philosophy", performance: 4.4 },
  { name: "supplements", count: 334, trending: false, category: "nutrition", performance: 4.1 }
];

const mockRestaurants = [
  {
    id: "1",
    name: "Fuel Café",
    location: "Downtown Sports District",
    distance: "0.3 miles",
    posts: 45,
    avgRating: 4.8,
    athleteCount: 23,
    cuisine: "Healthy, Smoothies",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format",
    popularItem: "Pre-workout açaí bowl"
  },
  {
    id: "2",
    name: "Recovery Kitchen",
    location: "University Area", 
    distance: "0.7 miles",
    posts: 32,
    avgRating: 4.6,
    athleteCount: 18,
    cuisine: "Fresh, Protein-focused",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format",
    popularItem: "Post-workout protein bowl"
  },
  {
    id: "3",
    name: "Endurance Eats",
    location: "Marina District",
    distance: "1.2 miles", 
    posts: 28,
    avgRating: 4.7,
    athleteCount: 31,
    cuisine: "Italian, Carb-focused",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format",
    popularItem: "Carb-loading pasta"
  }
];

const mockWorkouts = [
  {
    id: "1",
    type: "Long Run",
    duration: "1:45:23",
    distance: "21.1 km",
    posts: 12,
    avgRating: 4.5,
    category: "endurance",
    nutritionFocus: "Hydration & electrolytes"
  },
  {
    id: "2",
    type: "Cycling", 
    duration: "2:15:47",
    distance: "68.3 km",
    posts: 8,
    avgRating: 4.7,
    category: "endurance",
    nutritionFocus: "Mid-ride fueling"
  },
  {
    id: "3",
    type: "Strength Training",
    duration: "1:15:32",
    distance: "N/A",
    posts: 15,
    avgRating: 4.6,
    category: "strength",
    nutritionFocus: "Post-workout protein"
  }
];

const mockGroups = [
  {
    id: "1",
    name: "Marathon Runners Club",
    description: "Training together for the next big race",
    members: 245,
    posts: 89,
    category: "Running",
    isPublic: true,
    joined: false,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format",
    recentActivity: "New post 2h ago",
    location: "City Park"
  },
  {
    id: "2", 
    name: "Triathlon Nutrition Squad",
    description: "Sharing fueling strategies for multi-sport events",
    members: 132,
    posts: 156,
    category: "Triathlon",
    isPublic: true,
    joined: true,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format",
    recentActivity: "You posted 1h ago",
    location: "Aquatic Center"
  },
  {
    id: "3",
    name: "Plant-Based Athletes",
    description: "Proving plants fuel performance",
    members: 98,
    posts: 234,
    category: "Nutrition",
    isPublic: true,
    joined: false,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format",
    recentActivity: "New member joined 30m ago",
    location: "Online"
  },
  {
    id: "4",
    name: "Early Morning Runners",
    description: "5 AM start time, no excuses",
    members: 67,
    posts: 45,
    category: "Running",
    isPublic: false,
    joined: false,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format",
    recentActivity: "Group run planned",
    location: "Riverside Trail"
  },
  {
    id: "5",
    name: "Women Athletes United",
    description: "Empowering women in sports through community and shared experiences",
    members: 189,
    posts: 127,
    category: "Community",
    isPublic: true,
    joined: false,
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&auto=format",
    recentActivity: "Weekly meetup posted",
    location: "Downtown Gym"
  }
];

const Discover = () => {
  const [activeTab, setActiveTab] = useState("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const getTimingColor = (timing: "pre" | "during" | "post") => {
    switch (timing) {
      case "pre": 
        return "bg-szalty-blue text-white";
      case "during": 
        return "bg-szalty-yellow text-black";
      case "post": 
        return "bg-szalty-orange text-white";
      default:
        return "bg-szalty-blue text-white";
    }
  };

  const getTimingText = (timing: "pre" | "during" | "post") => {
    switch (timing) {
      case "pre": 
        return "Pre-Workout";
      case "during": 
        return "During";
      case "post": 
        return "Post-Workout";
      default:
        return "Pre-Workout";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "timing": return "bg-szalty-blue/10 text-szalty-blue";
      case "performance": return "bg-szalty-orange/10 text-szalty-orange";
      case "nutrition": return "bg-green-100 text-green-700";
      case "diet": return "bg-purple-100 text-purple-700";
      case "strategy": return "bg-szalty-yellow/10 text-szalty-darkGray";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Explore</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search users, tags, restaurants..." 
            className="pl-10 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">📍 Near me</Badge>
              <Badge variant="outline">⭐ Verified athletes</Badge>
              <Badge variant="outline">🔥 Trending</Badge>
              <Badge variant="outline">🏃 My sports</Badge>
            </div>
          </div>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-6 bg-szalty-gray grid grid-cols-6">
          <TabsTrigger value="trending" className="text-xs">
            <TrendingUp size={14} className="mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs">
            <Users size={14} className="mr-1" />
            Athletes
          </TabsTrigger>
          <TabsTrigger value="groups" className="text-xs">
            Groups
          </TabsTrigger>
          <TabsTrigger value="tags" className="text-xs">
            Tags
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="text-xs">
            Places
          </TabsTrigger>
          <TabsTrigger value="workouts" className="text-xs">
            <Activity size={14} className="mr-1" />
            Workouts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending" className="space-y-6">
          {/* Featured Content Hero Section */}
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1 flex items-center">
                <Trophy className="mr-2 text-szalty-orange" size={18} />
                Featured This Week
              </h3>
              <p className="text-sm text-gray-600">Top performing meals from verified athletes</p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-3">
                {mockFeaturedPosts.map(post => (
                  <Card key={post.id} className="min-w-[280px] bg-gradient-to-r from-szalty-blue/5 to-szalty-orange/5 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <img 
                        src={post.image} 
                        alt="Featured post"
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="font-medium text-sm">{post.user}</span>
                          {post.verified && <Star className="ml-1 text-szalty-orange" size={12} fill="currentColor" />}
                        </div>
                        <div className="flex items-center text-xs text-szalty-orange font-medium">
                          <Trophy size={10} className="mr-1" />
                          {post.performance}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{post.description}</p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTimingColor(post.timing)}`}>
                          {getTimingText(post.timing)}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">{post.engagement} ❤️</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Insights Widget */}
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1 flex items-center">
                <Flame className="mr-2 text-szalty-orange" size={18} />
                Top Performing Meals
              </h3>
              <p className="text-sm text-gray-600">See what fueled their best workouts</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockTrendingPosts.slice(0, 4).map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={post.image} 
                    alt="Top performing meal"
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center text-xs text-szalty-orange font-medium">
                        <Trophy size={10} className="mr-1" />
                        {post.performance}/5
                      </div>
                      <span className="text-xs text-gray-500 font-medium">{post.engagement} ❤️</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{post.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Trending Posts Grid */}
          <div>
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1 flex items-center">
                <TrendingUp className="mr-2 text-szalty-blue" size={18} />
                Trending This Week
              </h3>
              <p className="text-sm text-gray-600">Most popular posts in the community</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockTrendingPosts.map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <img 
                    src={post.image} 
                    alt="Trending post"
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTimingColor(post.timing)}`}>
                        {getTimingText(post.timing)}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">{post.engagement} ❤️</span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1 leading-relaxed">{post.description}</p>
                    <p className="text-xs font-medium text-szalty-darkGray">@{post.user}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-1 flex items-center">
              <Star className="mr-2 text-szalty-orange" size={18} />
              Athletes Near You
            </h3>
            <p className="text-sm text-gray-600">Connect with athletes in your area</p>
          </div>
          
          <div className="space-y-3">
            {mockAthletes.map(athlete => (
              <Card key={athlete.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <img src={athlete.avatar} alt={athlete.name} />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <p className="font-medium text-base">{athlete.name}</p>
                        {athlete.verified && <Star className="ml-2 text-szalty-orange" size={12} fill="currentColor" />}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-szalty-blue text-white hover:bg-szalty-blue/90 px-4 py-1.5 rounded-lg font-medium text-xs"
                      >
                        Follow
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{athlete.sport} • {athlete.specialty}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span className="font-medium">{athlete.followers.toLocaleString()}</span>
                      <span className="mx-1">followers</span>
                      <span className="mx-1">•</span>
                      <span className="font-medium">{athlete.posts}</span>
                      <span className="mx-1">posts</span>
                      <span className="mx-1">•</span>
                      <span>{athlete.location}</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center">
                      <Clock size={10} className="mr-1" />
                      {athlete.recentActivity}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg flex items-center">
                  <Users className="mr-2 text-szalty-blue" size={18} />
                  Groups
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Find and join communities that match your interests
                </p>
              </div>
            </div>
            
            {/* Create Group Button */}
            <div className="flex justify-center">
              <Button 
                className="bg-szalty-blue text-white hover:bg-szalty-blue/90 px-6 py-2"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus size={16} className="mr-2" />
                Create New Group
              </Button>
            </div>
          </div>
          
          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockGroups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group} 
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          {/* Empty State for when no groups match search */}
          {mockGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No groups found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Try adjusting your search or create a new group
              </p>
              <Button 
                className="bg-szalty-blue text-white"
                onClick={() => setShowCreateGroup(true)}
              >
                <Plus size={14} className="mr-1" />
                Create Your First Group
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="tags" className="mt-2">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Flame className="mr-2 text-szalty-orange" size={16} />
                Performance Tags
              </h3>
              <div className="space-y-3">
                {mockPerformanceTags.map(tag => (
                  <Card key={tag.name} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="font-medium">#{tag.name}</span>
                            {tag.trending && <Badge className="text-xs bg-szalty-orange text-white">🔥 Trending</Badge>}
                            <Badge className={`text-xs ${getCategoryColor(tag.category)}`}>
                              {tag.category}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                            <span>{tag.count.toLocaleString()} posts</span>
                            <span>•</span>
                            <div className="flex items-center text-szalty-orange">
                              <Trophy size={12} className="mr-1" />
                              {tag.performance} avg rating
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-3 flex-shrink-0">
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Hash className="mr-2 text-szalty-blue" size={16} />
                Nutrition Tags
              </h3>
              <div className="space-y-3">
                {mockNutritionTags.map(tag => (
                  <Card key={tag.name} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-2">
                            <span className="font-medium">#{tag.name}</span>
                            {tag.trending && <Badge className="text-xs bg-szalty-orange text-white">🔥 Trending</Badge>}
                            <Badge className={`text-xs ${getCategoryColor(tag.category)}`}>
                              {tag.category}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 flex-wrap gap-2">
                            <span>{tag.count.toLocaleString()} posts</span>
                            <span>•</span>
                            <div className="flex items-center text-szalty-orange">
                              <Trophy size={12} className="mr-1" />
                              {tag.performance} avg rating
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-3 flex-shrink-0">
                        Follow
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="restaurants" className="space-y-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <MapPin className="mr-2 text-szalty-blue" size={16} />
              Popular with Athletes
            </h3>
          </div>
          {mockRestaurants.map(restaurant => (
            <Card key={restaurant.id} className="overflow-hidden">
              <div className="flex">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-20 h-20 object-cover"
                />
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{restaurant.name}</h4>
                    <div className="flex items-center">
                      <span className="text-szalty-orange">⭐</span>
                      <span className="text-sm ml-1">{restaurant.avgRating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{restaurant.cuisine}</p>
                  <p className="text-sm text-gray-500 mb-2">{restaurant.location} • {restaurant.distance}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      <span>{restaurant.athleteCount} athletes</span>
                      <span className="mx-1">•</span>
                      <span>{restaurant.posts} posts</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-szalty-blue">View Posts</Button>
                  </div>
                  <p className="text-xs text-szalty-blue mt-1">Popular: {restaurant.popularItem}</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="workouts" className="space-y-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Activity className="mr-2 text-szalty-blue" size={16} />
              Popular Workouts & Nutrition
            </h3>
          </div>
          {mockWorkouts.map(workout => (
            <Card key={workout.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-szalty-blue/10 rounded-full flex items-center justify-center mr-3">
                    <Activity className="text-szalty-blue" size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium">{workout.type}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{workout.duration}</span>
                      {workout.distance !== "N/A" && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{workout.distance}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-szalty-orange">⭐</span>
                  <span className="text-sm ml-1">{workout.avgRating}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-szalty-darkGray mb-1">Nutrition Focus:</p>
                <p className="text-sm text-gray-600">{workout.nutritionFocus}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{workout.posts} nutrition posts linked</span>
                <Button variant="outline" size="sm" className="text-szalty-blue">View Nutrition</Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      
      <CreateGroupModal 
        open={showCreateGroup} 
        onOpenChange={setShowCreateGroup} 
      />
      
      <PremiumModal 
        open={showPremiumModal} 
        onOpenChange={setShowPremiumModal} 
      />
    </div>
  );
};

export default Discover;
