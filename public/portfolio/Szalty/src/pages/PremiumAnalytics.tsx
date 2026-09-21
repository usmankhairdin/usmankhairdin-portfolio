import React, { useState } from "react";
import { BarChart3, Crown, Users, Star, TrendingUp, Calendar, Zap, Target, Activity, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';

const PremiumAnalytics = () => {
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  // Advanced analytics data
  const performanceData = [
    { date: "Mon", performance: 85, energy: 78, recovery: 82, nutrition: 90 },
    { date: "Tue", performance: 88, energy: 82, recovery: 79, nutrition: 85 },
    { date: "Wed", performance: 92, energy: 87, recovery: 88, nutrition: 95 },
    { date: "Thu", performance: 89, energy: 84, recovery: 86, nutrition: 88 },
    { date: "Fri", performance: 94, energy: 91, recovery: 90, nutrition: 92 },
    { date: "Sat", performance: 87, energy: 83, recovery: 85, nutrition: 89 },
    { date: "Sun", performance: 91, energy: 88, recovery: 87, nutrition: 93 }
  ];

  const correlationData = [
    { nutrient: "Protein", correlation: 0.85, impact: "High" },
    { nutrient: "Carbs", correlation: 0.72, impact: "Medium" },
    { nutrient: "Hydration", correlation: 0.91, impact: "High" },
    { nutrient: "Sleep", correlation: 0.78, impact: "Medium" }
  ];

  const coachesData = [
    {
      id: 1,
      name: "Dr. Sarah Mitchell",
      specialty: "Endurance Performance",
      rating: 4.9,
      clients: 23,
      experience: "8 years",
      price: "$29/month",
      image: "https://i.pravatar.cc/150?img=1",
      includedInPro: false
    },
    {
      id: 2,
      name: "Marcus Thompson",
      specialty: "Strength & Power",
      rating: 4.8,
      clients: 18,
      experience: "6 years", 
      price: "Included in Pro",
      image: "https://i.pravatar.cc/150?img=2",
      includedInPro: true
    },
    {
      id: 3,
      name: "Dr. Emily Chen",
      specialty: "Plant-Based Performance",
      rating: 4.9,
      clients: 31,
      experience: "10 years",
      price: "$18/month",
      image: "https://i.pravatar.cc/150?img=3",
      includedInPro: false
    }
  ];

  return (
    <div className="min-h-screen bg-szalty-offWhite pb-4">
      {/* Premium Preview Banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-szalty-charcoal to-szalty-blueGray bg-clip-text text-transparent flex items-center md:text-3xl">
              <Crown className="mr-3 h-6 w-6 text-amber-500 md:h-7 md:w-7" />
              Szalty Pro Preview
            </h1>
            <p className="text-szalty-blueGray text-sm md:text-base mt-1">
              See what you get with Szalty Pro: unlimited data history, advanced analytics, coach & creator access
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className="bg-amber-100 text-amber-800 hidden sm:flex">
              <Crown className="mr-1 h-3 w-3" />
              Preview Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Upgrade CTA Section */}
      <div className="py-6 bg-gradient-to-r from-szalty-blue/5 to-szalty-orange/5 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-szalty-blue/20 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Unlock Szalty Pro</h2>
                <p className="text-gray-600 mb-3">Get unlimited data history, advanced insights, and coach subscriptions</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4 text-szalty-blue" />
                    Unlimited data history
                  </span>
                  <span className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-szalty-orange" />
                    Access to nutrition coaches
                  </span>
                  <span className="flex items-center">
                    <BarChart3 className="mr-1 h-4 w-4 text-szalty-blue" />
                    Advanced analytics
                  </span>
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                {/* Pricing Toggle */}
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-sm ${!isAnnual ? 'font-medium text-szalty-blue' : 'text-gray-600'}`}>
                    Monthly
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setIsAnnual(!isAnnual)}
                      className={`w-14 h-7 rounded-full p-1 transition-colors duration-200 ${
                        isAnnual ? 'bg-szalty-blue' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                          isAnnual ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <span className={`text-sm ${isAnnual ? 'font-medium text-szalty-blue' : 'text-gray-600'}`}>
                    Annual
                  </span>
                  {isAnnual && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Save 17%</Badge>
                  )}
                </div>
                <div className="text-center">
                  <span className="text-3xl font-bold text-szalty-blue">
                    ${isAnnual ? '99' : '9.99'}
                  </span>
                  <span className="text-gray-600">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
                <Button className="bg-szalty-blue text-white hover:bg-szalty-blue/90 px-8 py-3">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Szalty Pro
                </Button>
                <p className="text-xs text-gray-500 text-center">7-day free trial</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Analytics View */}
      <div className="space-y-8">
        {/* Date Range Selector - Premium Feature */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 text-szalty-blue" size={20} />
              Custom Date Range Selection
              <Badge className="ml-2 bg-szalty-blue text-white text-xs">Premium</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" className="border-szalty-blue text-szalty-blue">Last 3 months</Button>
              <Button variant="outline" size="sm" className="border-szalty-blue text-szalty-blue">Last 6 months</Button>
              <Button variant="outline" size="sm" className="border-szalty-blue text-szalty-blue">Last year</Button>
              <Button variant="outline" size="sm" className="border-szalty-blue text-szalty-blue">All time</Button>
              <Button variant="outline" size="sm" className="border-szalty-blue text-szalty-blue">Custom range</Button>
            </div>
            <p className="text-sm text-gray-600">Premium users get unlimited access to historical data beyond 30 days</p>
          </CardContent>
        </Card>

        {/* Advanced Performance Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 text-szalty-blue" size={20} />
              Multi-Factor Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="performance" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="energy" stackId="2" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                <Area type="monotone" dataKey="recovery" stackId="3" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="nutrition" stackId="4" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <Activity className="text-szalty-blue mb-2" size={24} />
                <p className="text-sm text-gray-600">Recovery Score</p>
                <p className="text-2xl font-bold text-szalty-blue">87%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <Zap className="text-szalty-orange mb-2" size={24} />
                <p className="text-sm text-gray-600">Hydration Rate</p>
                <p className="text-2xl font-bold text-szalty-orange">94%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <Target className="text-szalty-blue mb-2" size={24} />
                <p className="text-sm text-gray-600">Macro Balance</p>
                <p className="text-2xl font-bold text-szalty-blue">91%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex flex-col items-center">
                <TrendingUp className="text-szalty-orange mb-2" size={24} />
                <p className="text-sm text-gray-600">Energy Index</p>
                <p className="text-2xl font-bold text-szalty-orange">89%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nutrition-Performance Correlations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="mr-2 text-szalty-orange" size={20} />
              Nutrition-Performance Correlations
              <Badge className="ml-2 bg-szalty-blue text-white text-xs">AI Insights</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correlationData.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-szalty-blue bg-gradient-to-r from-blue-50/30 to-transparent">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{item.nutrient}</h3>
                      <Badge className={`text-xs ${
                        item.impact === 'High' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {item.impact} Impact
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold text-szalty-blue">{item.correlation}</div>
                      <div className="text-sm text-gray-600">correlation score</div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-szalty-blue h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${item.correlation * 100}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Available Coaches with Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Star className="mr-2 text-szalty-orange" size={20} />
                Nutritional Coaching Experts
              </CardTitle>
              <Badge className="bg-szalty-orange text-white">Premium Feature</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coachesData.map((coach) => (
                <Card key={coach.id} className="hover:shadow-md transition-shadow relative">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-4 blur-sm">
                      <img 
                        src={coach.image} 
                        alt="Coach"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium">Coach Name</h3>
                        <p className="text-sm text-gray-600">{coach.specialty}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <Star className="text-yellow-500 mr-1" size={12} fill="currentColor" />
                          <span className="font-medium">{coach.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">{coach.experience}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className={`font-bold text-lg ${coach.includedInPro ? 'text-green-600' : 'text-szalty-blue'}`}>
                          {coach.price}
                        </span>
                        <p className="text-xs text-gray-600">
                          {coach.includedInPro ? 'Included in Pro' : 'Monthly subscription'}
                        </p>
                      </div>
                      <Button className="w-full bg-szalty-blue text-white hover:bg-szalty-blue/90">
                        Subscribe to Coach
                      </Button>
                    </div>
                  </CardContent>
                  
                  {/* Blur overlay */}
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Crown className="mx-auto h-8 w-8 text-szalty-blue mb-2" />
                      <p className="text-sm font-medium text-szalty-blue">Upgrade to view coach details</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coach Mode Section - At Bottom */}
      <div className="py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Are you a Nutritional Coach?</h2>
            <p className="text-gray-600 mb-4">Preview our coach dashboard and see how you can manage your athletes</p>
            <Button 
              onClick={() => setIsCoachMode(!isCoachMode)}
              variant={isCoachMode ? "default" : "outline"}
              className={isCoachMode ? 'bg-szalty-blue text-white' : 'border-szalty-blue text-szalty-blue hover:bg-szalty-blue hover:text-white'}
            >
              <Users className="mr-2 h-4 w-4" />
              {isCoachMode ? 'Exit Coach Preview' : 'Preview Coach Mode'}
            </Button>
          </div>

          {isCoachMode && (
            <div className="space-y-6">
              {/* Coach Benefits Banner */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700 font-medium text-center">
                  Starting coaches receive free Szalty Pro when they have at least one coached athlete. Coaches only pay when they earn.
                </p>
              </div>
              {/* Athletes Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 text-szalty-blue" size={20} />
                    My Athletes ({6})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "Alex Johnson", sport: "Marathon", lastActive: "2h ago", performance: 89, status: "improving" },
                      { name: "Maria Rodriguez", sport: "Triathlon", lastActive: "1d ago", performance: 92, status: "excellent" },
                      { name: "David Kim", sport: "Cycling", lastActive: "3h ago", performance: 85, status: "stable" },
                      { name: "Emma Wilson", sport: "Swimming", lastActive: "5h ago", performance: 88, status: "improving" },
                      { name: "Chris Brown", sport: "CrossFit", lastActive: "1h ago", performance: 91, status: "excellent" },
                      { name: "Lisa Chen", sport: "Running", lastActive: "4h ago", performance: 86, status: "stable" }
                    ].map((athlete, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-szalty-blue/10 rounded-full flex items-center justify-center">
                              <Activity className="text-szalty-blue" size={16} />
                            </div>
                            <div>
                              <h3 className="font-medium">{athlete.name}</h3>
                              <p className="text-sm text-gray-600">{athlete.sport}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Performance</span>
                              <span className="font-medium">{athlete.performance}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-szalty-blue h-2 rounded-full" 
                                style={{ width: `${athlete.performance}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Last active: {athlete.lastActive}</span>
                              <Badge className={`text-xs ${
                                athlete.status === 'excellent' ? 'bg-green-100 text-green-800' :
                                athlete.status === 'improving' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {athlete.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Coach Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-szalty-blue/10 rounded-lg flex items-center justify-center">
                        <Calendar className="text-szalty-blue" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">Schedule Sessions</h3>
                        <p className="text-sm text-gray-600">Book coaching calls with athletes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-szalty-orange/10 rounded-lg flex items-center justify-center">
                        <Target className="text-szalty-orange" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">Set Nutrition Goals</h3>
                        <p className="text-sm text-gray-600">Create personalized targets</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-szalty-blue/10 rounded-lg flex items-center justify-center">
                        <BarChart3 className="text-szalty-blue" size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium">Team Analytics</h3>
                        <p className="text-sm text-gray-600">Group performance insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumAnalytics;