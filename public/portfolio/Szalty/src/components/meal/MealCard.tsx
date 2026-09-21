
import React from "react";
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Send, MoreHorizontal, EyeOff, Edit3, Trash2, Flag, ChevronLeft, ChevronRight, Crown, Shield, Store } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MealTiming from "./MealTiming";

interface NutritionItem {
  id: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  quantity: number;
}

interface MealCardProps {
  meal: {
    id: string;
    user: {
      name: string;
      avatar: string;
      isPro?: boolean;
      isAthlete?: boolean;
      isBusiness?: boolean;
      followerCount?: number;
      isCurrentUser?: boolean;
    };
    images: string[];
    description: string;
    timing: "pre" | "during" | "post" | null;
    workout?: {
      type: string;
      duration: string;
      distance?: string;
      calories?: string;
      workoutDetails?: {
        platform: string;
        url: string;
      };
    } | null;
    nutrition?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    } | null;
    nutritionItems?: NutritionItem[];
    tags: string[];
    photoTags?: Record<string, string[]> | null;
    likes: number;
    comments: number;
    createdAt: string;
    performanceRating?: number;
  };
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLiked, setIsLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(meal.likes);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation when clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, [role="button"]')) {
      return;
    }
    navigate(`/post/${meal.id}`);
  };


  const getTagById = (tagId: string) => {
    // Use the exact same tag definitions as PhotoTagging component
    const tagMap: Record<string, { label: string; color: string }> = {
      // General tags
      'breakfast': { label: 'Breakfast', color: 'bg-red-500 text-white' },
      'lunch': { label: 'Lunch', color: 'bg-blue-500 text-white' },
      'dinner': { label: 'Dinner', color: 'bg-purple-500 text-white' },
      'snack': { label: 'Snack', color: 'bg-green-500 text-white' },
      'homemade': { label: 'Homemade', color: 'bg-amber-500 text-black' },
      'restaurant': { label: 'Restaurant', color: 'bg-yellow-500 text-black' },
      
      // Activity tags
      'pre-workout': { label: 'Pre-Workout', color: 'bg-blue-500/80 text-white' },
      'during-workout': { label: 'During', color: 'bg-orange-500/80 text-white' },
      'post-workout': { label: 'Post-Workout', color: 'bg-green-500/80 text-white' },
      'recovery': { label: 'Recovery', color: 'bg-purple-500/80 text-white' },
      'water': { label: 'Water', color: 'bg-blue-400 text-white' },
      'electrolytes': { label: 'Electrolytes', color: 'bg-cyan-500 text-white' }
    };
    return tagMap[tagId] || { label: tagId, color: 'bg-gray-500 text-white' };
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const imageWidth = container.clientWidth;
    const newIndex = Math.round(scrollLeft / imageWidth);
    setCurrentImageIndex(newIndex);
  };

  const navigateToImage = (index: number) => {
    const container = document.getElementById(`carousel-${meal.id}`);
    if (container) {
      const imageWidth = container.clientWidth;
      container.scrollTo({
        left: index * imageWidth,
        behavior: 'smooth'
      });
      setCurrentImageIndex(index);
    }
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % meal.images.length;
    navigateToImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = currentImageIndex === 0 ? meal.images.length - 1 : currentImageIndex - 1;
    navigateToImage(prevIndex);
  };
  // Calculate total nutrition from all nutrition items
  const totalNutrition = meal.nutritionItems?.reduce((total, item) => {
    const multiplier = item.quantity || 1;
    return {
      calories: total.calories + (Number(item.calories) * multiplier || 0),
      protein: total.protein + (Number(item.protein) * multiplier || 0),
      carbs: total.carbs + (Number(item.carbs) * multiplier || 0),
      fat: total.fat + (Number(item.fat) * multiplier || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 }) || meal.nutrition;

  return (
    <div className="performance-card mb-6 animate-fade-in cursor-pointer" onClick={handleCardClick}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            <Avatar className={`h-9 w-9 ${meal.user.isPro ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}>
              <img src={meal.user.avatar} alt={meal.user.name} />
            </Avatar>
            {meal.user.isPro && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{meal.user.name}</p>
            <p className="text-xs text-gray-500">{meal.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Show gold crown for Pro users only */}
          {meal.user.isPro && (
            <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
              <Crown size={12} className="text-yellow-800" />
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <MoreHorizontal size={18} className="text-gray-600" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
              {meal.user.isCurrentUser ? (
                <>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Edit3 size={16} />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-600">
                    <Trash2 size={16} />
                    Delete post
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <EyeOff size={16} />
                    Hide post
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                    <Flag size={16} />
                    Report post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {totalNutrition && (
        <div className="px-4 py-3 bg-szalty-gray flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-szalty-darkGray">
              Total Nutrition
            </span>
          </div>
          <div className="flex space-x-4">
            {totalNutrition.calories && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Calories</p>
                <p className="text-sm font-medium">{totalNutrition.calories}</p>
              </div>
            )}
            {totalNutrition.protein && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Protein</p>
                <p className="text-sm font-medium">{totalNutrition.protein}g</p>
              </div>
            )}
            {totalNutrition.carbs && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Carbs</p>
                <p className="text-sm font-medium">{totalNutrition.carbs}g</p>
              </div>
            )}
            {totalNutrition.fat && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Fat</p>
                <p className="text-sm font-medium">{totalNutrition.fat}g</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="relative">
        <div 
          id={`carousel-${meal.id}`}
          className="carousel overflow-x-auto snap-x snap-mandatory scrollbar-none flex"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          {meal.images.map((image, index) => (
            <div key={index} className="snap-center shrink-0 w-full h-[350px] flex-none relative">
              <img
                src={image}
                alt={`Meal ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Top right corner - only ONE tag total */}
              <div className="absolute top-3 right-3">
                {/* Show photo tag if it exists, otherwise show meal timing */}
                {meal.photoTags && meal.photoTags[index] && meal.photoTags[index].length > 0 ? (
                  (() => {
                    const tag = getTagById(meal.photoTags[index][0]); // Only show first tag
                    return (
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${tag.color} shadow-sm`}
                      >
                        {tag.label}
                      </span>
                    );
                  })()
                ) : (
                  meal.timing && <MealTiming timing={meal.timing} />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        {meal.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Enhanced image indicators */}
        {meal.images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1">
            {meal.images.map((_, index) => (
              <button
                key={index}
                onClick={() => navigateToImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white scale-125' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {meal.workout && (
        <div className="px-4 py-3 bg-szalty-gray flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-szalty-darkGray">
              {meal.workout.type}
            </span>
          </div>
          <div className="flex space-x-4">
            {meal.workout.distance && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Distance</p>
                <p className="text-sm font-medium">{meal.workout.distance}</p>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-szalty-darkGray">Duration</p>
              <p className="text-sm font-medium">{meal.workout.duration}</p>
            </div>
            {meal.workout.calories && (
              <div className="text-right">
                <p className="text-xs text-szalty-darkGray">Calories</p>
                <p className="text-sm font-medium">{meal.workout.calories}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <div className="flex space-x-4">
            <button 
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
                setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
              }}
            >
              <Heart size={20} className={`${isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
              <span className="ml-1 text-sm text-gray-500">{likeCount}</span>
            </button>
            <button 
              className="flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/post/${meal.id}?comments=true`);
              }}
            >
              <MessageSquare size={20} className="text-gray-500" />
              <span className="ml-1 text-sm text-gray-500">{meal.comments}</span>
            </button>
          </div>
          <button>
            <Send size={20} className="text-gray-500" />
          </button>
        </div>
        
        <p className="text-sm mt-2">{meal.description}</p>
      </div>
    </div>
  );
};

export default MealCard;
