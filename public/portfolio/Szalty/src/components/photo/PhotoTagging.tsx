
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoTaggingProps {
  photos: string[];
  onTagsChange?: (photoTags: Record<string, string[]>) => void;
  initialTags?: Record<string, string[]>;
}

const PhotoTagging: React.FC<PhotoTaggingProps> = ({
  photos,
  onTagsChange,
  initialTags = {}
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTags, setPhotoTags] = useState<Record<string, string[]>>(initialTags);
  const [activeSection, setActiveSection] = useState(0);

  const tagSections = [
    {
      name: "General",
      tags: [
        { id: "breakfast", label: "Breakfast", color: "bg-red-500 text-white" },
        { id: "lunch", label: "Lunch", color: "bg-blue-500 text-white" },
        { id: "dinner", label: "Dinner", color: "bg-purple-500 text-white" },
        { id: "snack", label: "Snack", color: "bg-green-500 text-white" },
        { id: "homemade", label: "Homemade", color: "bg-amber-500 text-black" },
        { id: "restaurant", label: "Restaurant", color: "bg-yellow-500 text-black" }
      ]
    },
    {
      name: "Activity",
      tags: [
        { id: "pre-workout", label: "Pre-Workout", color: "meal-timing-pre" },
        { id: "during-workout", label: "During", color: "meal-timing-during" },
        { id: "post-workout", label: "Post-Workout", color: "meal-timing-post" },
        { id: "recovery", label: "Recovery", color: "bg-teal-500 text-white" },
        { id: "water", label: "Water", color: "bg-blue-400 text-white" },
        { id: "electrolytes", label: "Electrolytes", color: "bg-cyan-500 text-white" }
      ]
    }
  ];

  // Apply first selected tag to all photos when it's the first tag selection
  useEffect(() => {
    if (photos.length <= 1) return;
    
    // Check if ANY photo has tags
    const totalTaggedPhotos = Object.keys(photoTags).filter(key => {
      const tags = photoTags[parseInt(key)];
      return tags && tags.length > 0;
    }).length;
    
    // If exactly one photo has a tag (the first one selected), apply it to all
    if (totalTaggedPhotos === 1) {
      const taggedPhotoIndex = Object.keys(photoTags).find(key => {
        const tags = photoTags[parseInt(key)];
        return tags && tags.length > 0;
      });
      
      if (taggedPhotoIndex !== undefined) {
        const sourceTag = photoTags[parseInt(taggedPhotoIndex)][0];
        const updatedPhotoTags = { ...photoTags };
        
        // Apply this tag to all other photos
        for (let i = 0; i < photos.length; i++) {
          if (i !== parseInt(taggedPhotoIndex)) {
            updatedPhotoTags[i] = [sourceTag];
          }
        }
        
        setPhotoTags(updatedPhotoTags);
        onTagsChange?.(updatedPhotoTags);
      }
    }
  }, [photoTags, photos.length]);

  const currentPhoto = photos[currentPhotoIndex];
  const currentTags = photoTags[currentPhotoIndex] || [];

  const toggleTag = (tagId: string) => {
    let newTags: string[] = [];
    
    // If the tag is already selected, remove it (toggle off)
    // Otherwise, replace any existing tag with this new one (only one tag allowed)
    if (currentTags.includes(tagId)) {
      newTags = []; // Remove the tag
    } else {
      newTags = [tagId]; // Replace with new tag (only one allowed)
    }
    
    const newPhotoTags = { ...photoTags, [currentPhotoIndex]: newTags };
    setPhotoTags(newPhotoTags);
    onTagsChange?.(newPhotoTags);
  };

  const getTagById = (tagId: string) => {
    for (const section of tagSections) {
      const tag = section.tags.find(t => t.id === tagId);
      if (tag) return tag;
    }
    return null;
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Tag Your Photos</h2>
      
      {/* Photo Viewer - Wider aspect ratio */}
      <div className="relative">
        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
          <img 
            src={currentPhoto} 
            alt={`Photo ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-all"
              >
                <ChevronLeft size={20} className="text-white" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-80 transition-all"
              >
                <ChevronRight size={20} className="text-white" />
              </button>
            </>
          )}
          
          {/* Photo counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">{currentPhotoIndex + 1} / {photos.length}</span>
            </div>
          )}
          
          {/* Current tags overlay */}
          {currentTags.length > 0 && (
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {currentTags.map(tagId => {
                const tag = getTagById(tagId);
                return tag ? (
                  <Badge key={tagId} className={`${tag.color} text-xs shadow-sm`}>
                    {tag.label}
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tag Categories - Two section slider */}
      <div className="bg-gray-50 rounded-xl p-1">
        <div className="grid grid-cols-2 gap-1">
          {tagSections.map((section, index) => (
            <button
              key={section.name}
              onClick={() => setActiveSection(index)}
              className={`py-4 px-6 rounded-lg text-base font-medium transition-all ${
                activeSection === index
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {section.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Section Tags - Grid layout for better spacing */}
      <div className="space-y-4">
        <div className={`grid gap-3 ${tagSections[activeSection].tags.length <= 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
          {tagSections[activeSection].tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`py-4 px-4 rounded-xl text-sm font-medium transition-all text-center ${
                currentTags.includes(tag.id)
                  ? tag.color + " shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo thumbnails - Only show if multiple photos */}
      {photos.length > 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">All Photos</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  index === currentPhotoIndex ? "ring-2 ring-primary shadow-md" : "hover:ring-2 hover:ring-gray-300"
                }`}
              >
                <img 
                  src={photo} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Tag indicators */}
                {(photoTags[index] || []).length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoTagging;
