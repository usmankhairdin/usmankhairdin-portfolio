
import React from "react";
import MealCard from "@/components/meal/MealCard";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const mockData = [
  {
    id: "0",
    user: {
      name: "Shane Barone",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      isPro: true,
      isAthlete: false,
      followerCount: 8500,
      isCurrentUser: true
    },
    images: [
      "peanut-butter-toast.jpg",
      "energy-gel.jpg",
      "protein-shake.jpg",
      "pasta-meal.jpg"
    ],
    description: "Crushed today's leg session! 💪 Peak week training with perfect nutrition timing. The pre-workout fuel made all the difference - felt explosive throughout the entire session. Recovery meal was on point too.",
    timing: null,
    workout: {
      type: "Strength Training",
      duration: "1h 45m",
      distance: null,
      calories: "856",
      workoutDetails: {
        platform: "Strava",
        url: "https://strava.com/activities/12345"
      }
    },
    nutrition: {
      calories: 855,
      protein: 81,
      carbs: 110,
      fat: 15
    },
    nutritionItems: [
      { id: 'greek-yogurt', name: 'Greek Yogurt with Berries', calories: '180', protein: '20', carbs: '15', fat: '6', quantity: 1 },
      { id: 'protein-shake', name: 'Whey Protein Shake', calories: '120', protein: '25', carbs: '3', fat: '1', quantity: 1 },
      { id: 'banana', name: 'Banana', calories: '105', protein: '1', carbs: '27', fat: '0', quantity: 1 },
      { id: 'chicken-rice', name: 'Chicken & Rice Bowl', calories: '450', protein: '35', carbs: '65', fat: '8', quantity: 1 }
    ],
    tags: ["bulking", "strength", "legday", "preworkout"],
    photoTags: {
      0: ["pre-workout"],
      1: ["during-workout"], 
      2: ["post-workout"],
      3: ["recovery"]
    },
    likes: 245,
    comments: 23,
    createdAt: "2h ago",
    performanceRating: 4.5
  },
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://i.pravatar.cc/150?img=1",
      isPro: true,
      isAthlete: false,
      followerCount: 3200,
      isCurrentUser: false
    },
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000"
    ],
    description: "Fueling up before my 10K run. Started with oatmeal with banana and honey, then grabbed my smoothie and energy bar for the road!",
    timing: "pre" as const,
    workout: {
      type: "Morning Run",
      duration: "56:24",
      distance: "10.2 km",
      calories: "642"
    },
    nutrition: {
      calories: 450,
      protein: 12,
      carbs: 78,
      fat: 8
    },
    tags: ["runnermeals", "carboloading", "preworkout", "oatmeal"],
    photoTags: {
      0: ["breakfast"],
      1: ["pre-workout"], 
      2: ["snack"]
    },
    likes: 42,
    comments: 7,
    createdAt: "2h ago"
  },
  {
    id: "2",
    user: {
      name: "Alex Peterson",
      avatar: "https://i.pravatar.cc/150?img=2",
      isPro: true,
      isAthlete: true,
      followerCount: 85000
    },
    images: [
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1000"
    ],
    description: "Post-ride recovery smoothie: banana, chocolate protein, almond milk, spinach, and frozen berries. Perfect balance of carbs and protein!",
    timing: "post" as const,
    workout: {
      type: "Cycling",
      duration: "1:35:15",
      distance: "45.7 km",
      calories: "1,248"
    },
    nutrition: {
      calories: 520,
      protein: 35,
      carbs: 42,
      fat: 12
    },
    tags: ["recovery", "smoothiebowl", "postworkout", "cyclingnutrition"],
    photoTags: {
      0: ["post-workout"]
    },
    likes: 28,
    comments: 5,
    createdAt: "5h ago"
  },
  {
    id: "3",
    user: {
      name: "Maria Garcia",
      avatar: "https://i.pravatar.cc/150?img=3",
      isPro: false,
      isAthlete: false,
      followerCount: 1200
    },
    images: [
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=1000"
    ],
    description: "Just discovered this amazing açaí bowl spot downtown! Perfect for my rest day. Sometimes you just need to treat yourself 🍓",
    timing: "post" as const,
    workout: null,
    nutrition: {
      calories: 380,
      protein: 8,
      carbs: 65,
      fat: 12
    },
    tags: ["restday", "acaibowl", "treatyourself", "downtown"],
    photoTags: {
      0: ["snack"]
    },
    likes: 19,
    comments: 3,
    createdAt: "8h ago"
  },
  {
    id: "4",
    user: {
      name: "Jake Thompson",
      avatar: "https://i.pravatar.cc/150?img=4",
      isPro: false,
      isAthlete: true,
      followerCount: 15000
    },
    images: [
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000",
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=1000"
    ],
    description: "Intense CrossFit session this morning! Feeling amazing but too exhausted to track nutrition today. Will get back on it tomorrow 💪",
    timing: "post" as const,
    workout: {
      type: "CrossFit",
      duration: "45:30",
      distance: null,
      calories: "856"
    },
    nutrition: null,
    tags: ["crossfit", "intense", "workout", "exhausted"],
    photoTags: {
      0: ["post-workout"],
      1: ["recovery"]
    },
    likes: 35,
    comments: 12,
    createdAt: "12h ago"
  },
  {
    id: "5",
    user: {
      name: "Emily Chen",
      avatar: "https://i.pravatar.cc/150?img=5",
      isPro: false,
      isAthlete: false,
      followerCount: 890
    },
    images: [
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1000"
    ],
    description: "Lazy Sunday vibes with my favorite study buddy 🐱 Just enjoying some homemade granola and yogurt while reviewing training plans.",
    timing: null,
    workout: null,
    nutrition: null,
    tags: ["lazysunday", "studybuddy", "homemade", "granola"],
    photoTags: {},
    likes: 24,
    comments: 8,
    createdAt: "1d ago"
  },
  {
    id: "6",
    user: {
      name: "David Wilson",
      avatar: "https://i.pravatar.cc/150?img=6",
      isPro: true,
      isAthlete: false,
      followerCount: 4200
    },
    images: [
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000"
    ],
    description: "Mid-workout fuel! These energy bites are a game changer during long training sessions. Recipe in my bio!",
    timing: "during" as const,
    workout: {
      type: "Endurance Training",
      duration: "2:15:00",
      distance: "32.5 km",
      calories: "1,420"
    },
    nutrition: null,
    tags: ["energybites", "endurance", "midworkout", "recipe"],
    photoTags: {
      0: ["during-workout"]
    },
    likes: 31,
    comments: 6,
    createdAt: "1d ago"
  },
  {
    id: "7",
    user: {
      name: "Zoe Martinez",
      avatar: "https://i.pravatar.cc/150?img=7",
      isPro: false,
      isAthlete: false,
      followerCount: 560
    },
    images: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"
    ],
    description: "Pre-swim breakfast! Keeping it light but nutritious. Pool session starts in 30 minutes and I'm ready to crush some laps 🏊‍♀️",
    timing: "pre" as const,
    workout: null,
    nutrition: {
      calories: 280,
      protein: 15,
      carbs: 35,
      fat: 8
    },
    tags: ["preswim", "light", "nutritious", "ready"],
    photoTags: {
      0: ["breakfast"]
    },
    likes: 17,
    comments: 4,
    createdAt: "2d ago"
  },
  {
    id: "8",
    user: {
      name: "Ryan Clark",
      avatar: "https://i.pravatar.cc/150?img=8",
      isPro: false,
      isAthlete: false,
      followerCount: 320
    },
    images: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000"
    ],
    description: "Quick dinner after a long day at work. Nothing fancy, just good food to refuel. Sometimes simple is best 🍽️",
    timing: null,
    workout: null,
    nutrition: {
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 15
    },
    tags: ["dinner", "simple", "refuel", "workday"],
    photoTags: null,
    likes: 12,
    comments: 2,
    createdAt: "2d ago"
  },
  {
    id: "9",
    user: {
      name: "Fuel Station Café",
      avatar: "https://i.pravatar.cc/150?img=9",
      isPro: true,
      isAthlete: false,
      isBusiness: true,
      followerCount: 12500
    },
    images: [
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000"
    ],
    description: "New on the menu! Our performance bowls are crafted specifically for athletes. Fresh quinoa, grilled chicken, roasted vegetables, and our signature recovery sauce. Available for pickup or delivery 📍",
    timing: "post" as const,
    workout: null,
    nutrition: {
      calories: 520,
      protein: 45,
      carbs: 48,
      fat: 18
    },
    tags: ["performancebowl", "quinoa", "athlete", "delivery"],
    photoTags: {
      0: ["lunch"],
      1: ["homemade"]
    },
    likes: 67,
    comments: 15,
    createdAt: "3h ago"
  }
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 bg-szalty-offWhite z-10">
        <div className="container mx-auto max-w-lg px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-szalty-blue">Szalty</h1>
            <div className="flex items-center space-x-4">
              <button className="text-szalty-blueGray">
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button className="text-szalty-blueGray">
                <Bell size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <Separator className="mb-0 bg-szalty-lightGray" />
        </div>
      </div>

      <div className="pt-16">
        {mockData.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default Index;
