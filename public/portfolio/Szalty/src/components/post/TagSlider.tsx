
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TagSliderProps {
  onTagsChange: (tags: string[]) => void;
  initialTags?: string[];
}

const TagSlider: React.FC<TagSliderProps> = ({ onTagsChange, initialTags = [] }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [activeSection, setActiveSection] = useState(0);

  const tagSections = [
    {
      name: "Meal Type",
      tags: [
        { id: "breakfast", label: "Breakfast", color: "bg-red-500 text-white" },
        { id: "lunch", label: "Lunch", color: "bg-blue-500 text-white" },
        { id: "dinner", label: "Dinner", color: "bg-purple-500 text-white" },
        { id: "snack", label: "Snack", color: "bg-green-500 text-white" }
      ]
    },
    {
      name: "Activity",
      tags: [
        { id: "pre-workout", label: "Pre-Workout", color: "meal-timing-pre" },
        { id: "during-workout", label: "During", color: "meal-timing-during" },
        { id: "post-workout", label: "Post-Workout", color: "meal-timing-post" },
        { id: "recovery", label: "Recovery", color: "bg-teal-500 text-white" }
      ]
    },
    {
      name: "Preparation",
      tags: [
        { id: "homemade", label: "Homemade", color: "bg-amber-500 text-black" },
        { id: "restaurant", label: "Restaurant", color: "bg-yellow-500 text-black" },
        { id: "prepackaged", label: "Pre-packaged", color: "bg-lime-500 text-black" },
        { id: "delivery", label: "Delivery", color: "bg-orange-500 text-white" }
      ]
    }
  ];

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId) 
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    
    setSelectedTags(newTags);
    onTagsChange(newTags);
  };

  const getTagById = (tagId: string) => {
    for (const section of tagSections) {
      const tag = section.tags.find(t => t.id === tagId);
      if (tag) return tag;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="font-medium mb-3">Meal Tags</h2>
      
      {/* Section Navigation */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        {tagSections.map((section, index) => (
          <button
            key={section.name}
            onClick={() => setActiveSection(index)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeSection === index
                ? "bg-white text-szalty-blue shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      {/* Active Section Tags */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 justify-between">
          {tagSections[activeSection].tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-1 ${
                selectedTags.includes(tag.id)
                  ? tag.color
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mt-4 pt-3 border-t">
          <p className="text-sm text-gray-600 mb-2">Selected tags:</p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tagId) => {
              const tag = getTagById(tagId);
              return tag ? (
                <Badge key={tagId} className={tag.color}>
                  {tag.label}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSlider;
