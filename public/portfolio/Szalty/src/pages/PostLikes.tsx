import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Shield } from 'lucide-react';

// Mock data for likes - in real app this would come from API
const mockPostLikes = {
  '0': [
    { id: 1, name: "Emma Wilson", username: "emma_runs", avatar: "https://i.pravatar.cc/150?img=1", isPro: true, isAthlete: false, followingYou: false },
    { id: 2, name: "Mike Chen", username: "mike_lifts", avatar: "https://i.pravatar.cc/150?img=2", isPro: false, isAthlete: true, followingYou: true },
    { id: 3, name: "Sarah Johnson", username: "sarah_swims", avatar: "https://i.pravatar.cc/150?img=3", isPro: true, isAthlete: false, followingYou: false },
    { id: 4, name: "Alex Rivera", username: "alex_cycles", avatar: "https://i.pravatar.cc/150?img=4", isPro: false, isAthlete: false, followingYou: true },
    { id: 5, name: "Lisa Park", username: "lisa_yoga", avatar: "https://i.pravatar.cc/150?img=5", isPro: true, isAthlete: true, followingYou: false },
    { id: 6, name: "David Wilson", username: "david_trains", avatar: "https://i.pravatar.cc/150?img=6", isPro: false, isAthlete: false, followingYou: false },
    { id: 7, name: "Maria Garcia", username: "maria_strong", avatar: "https://i.pravatar.cc/150?img=7", isPro: false, isAthlete: true, followingYou: true },
    { id: 8, name: "James Rodriguez", username: "james_runs", avatar: "https://i.pravatar.cc/150?img=8", isPro: true, isAthlete: false, followingYou: false },
  ],
  '1': [
    { id: 4, name: "Alex Rivera", username: "alex_cycles", avatar: "https://i.pravatar.cc/150?img=4", isPro: false, isAthlete: false, followingYou: true },
    { id: 5, name: "Lisa Park", username: "lisa_yoga", avatar: "https://i.pravatar.cc/150?img=5", isPro: true, isAthlete: true, followingYou: false },
    { id: 9, name: "Tom Anderson", username: "tom_fit", avatar: "https://i.pravatar.cc/150?img=9", isPro: false, isAthlete: false, followingYou: false },
  ],
  '2': [
    { id: 1, name: "Emma Wilson", username: "emma_runs", avatar: "https://i.pravatar.cc/150?img=1", isPro: true, isAthlete: false, followingYou: false },
    { id: 2, name: "Mike Chen", username: "mike_lifts", avatar: "https://i.pravatar.cc/150?img=2", isPro: false, isAthlete: true, followingYou: true },
    { id: 6, name: "David Wilson", username: "david_trains", avatar: "https://i.pravatar.cc/150?img=6", isPro: false, isAthlete: false, followingYou: false },
    { id: 10, name: "Rachel Kim", username: "rachel_strong", avatar: "https://i.pravatar.cc/150?img=10", isPro: true, isAthlete: true, followingYou: true },
  ]
};

const PostLikes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const likes = mockPostLikes[id as keyof typeof mockPostLikes] || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-base">Likes</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-2 pb-4">
        <div className="performance-card">
          <div className="px-3 py-4 sm:px-4 sm:py-5">
            <h3 className="font-medium text-sm mb-4">
              {likes.length} {likes.length === 1 ? 'person likes' : 'people like'} this post
            </h3>
            
            <div className="space-y-2 sm:space-y-3">
              {likes.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 sm:p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      {/* Pro/Athlete indicators */}
                      {user.isPro && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Crown size={8} className="sm:size-[10px] text-yellow-800" />
                        </div>
                      )}
                      {user.isAthlete && !user.isPro && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Shield size={8} className="sm:size-[10px] text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <div className="flex gap-1 flex-wrap">
                          {user.isPro && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                              Pro
                            </Badge>
                          )}
                          {user.isAthlete && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Athlete
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                      {user.followingYou && (
                        <p className="text-xs text-blue-600 font-medium">Follows you</p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant={user.followingYou ? "outline" : "default"} 
                    size="sm"
                    className="text-xs shrink-0 ml-2"
                  >
                    {user.followingYou ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
            </div>
            
            {likes.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm text-muted-foreground">No likes yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to like this post!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostLikes;