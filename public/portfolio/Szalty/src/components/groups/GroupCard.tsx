import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MapPin, Clock, Users, MessageSquare, Lock } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    description: string;
    members: number;
    posts: number;
    category: string;
    isPublic: boolean;
    joined: boolean;
    image: string;
    recentActivity: string;
    location: string;
  };
  getCategoryColor: (category: string) => string;
}

export const GroupCard = ({ group, getCategoryColor }: GroupCardProps) => {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* Header with Image and Title */}
        <div className="flex items-start space-x-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <img src={group.image} alt={group.name} className="object-cover" />
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-base truncate">{group.name}</h4>
              {!group.isPublic && <Lock size={14} className="text-gray-400 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2">
              {group.joined && (
                <Badge className="text-xs bg-szalty-blue text-white">
                  Joined
                </Badge>
              )}
              {!group.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Private
                </Badge>
              )}
              <Badge className={`text-xs ${getCategoryColor('performance')}`}>
                {group.category}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Users size={12} className="mr-1" />
              <span>{group.members.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare size={12} className="mr-1" />
              <span>{group.posts}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={10} className="mr-1" />
              <span className="truncate max-w-20">{group.location}</span>
            </div>
          </div>
          <div className="flex items-center text-xs text-gray-400">
            <Clock size={10} className="mr-1" />
            <span className="truncate max-w-24">{group.recentActivity}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            className={`w-full ${
              group.joined 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200" 
                : "bg-szalty-blue text-white hover:bg-szalty-blue/90"
            }`}
            size="sm"
          >
            {group.joined ? "✓ Joined" : group.isPublic ? "Join Group" : "Request to Join"}
          </Button>
        </div>
      </div>
    </Card>
  );
};