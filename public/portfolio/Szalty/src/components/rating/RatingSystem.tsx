
import React, { useState } from "react";
import { Star } from "lucide-react";

interface RatingCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  value: number;
}

interface RatingSystemProps {
  onRatingsChange?: (ratings: Record<string, number>) => void;
  initialRatings?: Record<string, number>;
}

const RatingSystem: React.FC<RatingSystemProps> = ({ 
  onRatingsChange,
  initialRatings = {}
}) => {
  const [ratings, setRatings] = useState<Record<string, number>>(initialRatings);

  const categories: RatingCategory[] = [
    {
      id: "energy",
      label: "Energy Level",
      description: "How energized you felt",
      icon: "⚡",
      value: ratings.energy || 0
    },
    {
      id: "recovery",
      label: "Recovery Impact", 
      description: "How it helped recovery",
      icon: "🔄",
      value: ratings.recovery || 0
    },
    {
      id: "performance",
      label: "Performance Impact",
      description: "Effect on workout/day",
      icon: "💪",
      value: ratings.performance || 0
    },
    {
      id: "satisfaction",
      label: "Taste/Satisfaction",
      description: "Enjoyment level",
      icon: "😋",
      value: ratings.satisfaction || 0
    }
  ];

  const handleRating = (categoryId: string, rating: number) => {
    const newRatings = { ...ratings, [categoryId]: rating };
    setRatings(newRatings);
    onRatingsChange?.(newRatings);
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className="transition-colors p-1"
          >
            <Star
              size={18}
              className={`${
                star <= value
                  ? "fill-primary text-primary"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Rate Your Experience</h2>
      
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-xl">{category.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-base text-gray-900">{category.label}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 flex-1 pr-4">{category.description}</p>
              <StarRating
                value={category.value}
                onChange={(rating) => handleRating(category.id, rating)}
              />
            </div>
          </div>
        ))}
      </div>
      
      {Object.keys(ratings).length > 0 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl">
          <p className="text-base text-primary font-medium">
            Overall Rating: {(Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length).toFixed(1)}/5
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingSystem;
