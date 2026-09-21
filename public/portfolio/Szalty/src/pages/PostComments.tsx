import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Shield, Heart, Send, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock data for comments - in real app this would come from API
const mockPostComments = {
  '0': [
    { 
      id: 1,
      user: { 
        name: "Emma Wilson", 
        username: "emma_runs",
        avatar: "https://i.pravatar.cc/150?img=1",
        isPro: true,
        isAthlete: false
      },
      comment: "Amazing nutrition timing! What was your pre-workout meal? I've been struggling with getting the timing right.",
      time: "1h ago",
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 11,
          user: { 
            name: "Shane Barone", 
            username: "shane_lifts",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
            isPro: true,
            isAthlete: false,
            isOP: true
          },
          comment: "Thanks! I had the peanut butter toast about 45 minutes before. Perfect energy without feeling heavy!",
          time: "45m ago",
          likes: 5,
          isLiked: true
        }
      ]
    },
    { 
      id: 2,
      user: { 
        name: "Mike Chen", 
        username: "mike_lifts",
        avatar: "https://i.pravatar.cc/150?img=2",
        isPro: false,
        isAthlete: true
      },
      comment: "Those gains are insane! 💪 What's your current split looking like?",
      time: "45m ago",
      likes: 8,
      isLiked: true,
      replies: []
    },
    { 
      id: 3,
      user: { 
        name: "Sarah Johnson", 
        username: "sarah_swims",
        avatar: "https://i.pravatar.cc/150?img=3",
        isPro: true,
        isAthlete: false
      },
      comment: "Love seeing the detailed nutrition breakdown. This is exactly what I needed for my prep!",
      time: "30m ago",
      likes: 15,
      isLiked: false,
      replies: []
    }
  ],
  '1': [
    { 
      id: 1,
      user: { 
        name: "Alex Rivera", 
        username: "alex_cycles",
        avatar: "https://i.pravatar.cc/150?img=4",
        isPro: false,
        isAthlete: false
      },
      comment: "Love the simplicity! How was your run?",
      time: "3h ago",
      likes: 3,
      isLiked: false,
      replies: []
    }
  ],
  '2': [
    { 
      id: 1,
      user: { 
        name: "David Wilson", 
        username: "david_trains",
        avatar: "https://i.pravatar.cc/150?img=6",
        isPro: false,
        isAthlete: false
      },
      comment: "Beast mode! What was the WOD today?",
      time: "5h ago",
      likes: 7,
      isLiked: true,
      replies: []
    },
    { 
      id: 2,
      user: { 
        name: "Emma Wilson", 
        username: "emma_runs",
        avatar: "https://i.pravatar.cc/150?img=1",
        isPro: true,
        isAthlete: false
      },
      comment: "Recovery is just as important! Take care of yourself 💪",
      time: "4h ago",
      likes: 12,
      isLiked: false,
      replies: []
    }
  ]
};

const PostComments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);
  
  const comments = mockPostComments[id as keyof typeof mockPostComments] || [];

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // In real app, this would make an API call
      console.log('Submitting comment:', newComment);
      console.log('Replying to:', replyingTo);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  const handleReply = (commentId: number, userName: string) => {
    setReplyingTo({ id: commentId, name: userName });
    setNewComment(`@${userName} `);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any; isReply?: boolean }) => (
    <div className={`flex gap-2 sm:gap-3 ${isReply ? 'ml-8 sm:ml-12 mt-2 sm:mt-3' : ''}`}>
      <div className="relative">
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback className="text-xs">{comment.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        {/* Pro/Athlete/OP indicators */}
        {comment.user.isPro && (
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400 rounded-full flex items-center justify-center">
            <Crown size={6} className="sm:size-[8px] text-yellow-800" />
          </div>
        )}
        {comment.user.isAthlete && !comment.user.isPro && (
          <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <Shield size={6} className="sm:size-[8px] text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="bg-muted/50 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 flex-wrap">
            <p className="font-medium text-xs">{comment.user.name}</p>
            {comment.user.isOP && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                OP
              </Badge>
            )}
            {comment.user.isPro && (
              <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                Pro
              </Badge>
            )}
          </div>
          <p className="text-sm leading-relaxed">{comment.comment}</p>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 mt-2 ml-2 sm:ml-3">
          <p className="text-xs text-muted-foreground">{comment.time}</p>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors">
            <Heart size={10} className={comment.isLiked ? 'fill-red-500 text-red-500' : ''} />
            {comment.likes}
          </button>
          {!isReply && (
            <button 
              onClick={() => handleReply(comment.id, comment.user.name)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Reply
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MoreHorizontal size={10} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem className="text-xs">
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                Block user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 sm:mt-3">
            {comment.replies.map((reply: any) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-base">Comments</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="performance-card mt-2 mb-24 sm:mb-28">
          <div className="px-3 py-4 sm:px-4 sm:py-5">
            <h3 className="font-medium text-sm mb-4">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
            
            {comments.length === 0 && (
              <div className="text-center py-6 sm:py-8">
                <p className="text-sm text-muted-foreground">No comments yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-50">{/* Fixed comment input */}
        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 border-b border-border/50">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Replying to <span className="font-medium text-blue-600">@{replyingTo.name}</span>
              </p>
              <button 
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="p-3 sm:p-4">
          <div className="max-w-2xl mx-auto flex gap-2 sm:gap-3">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="You" />
              <AvatarFallback className="text-xs">You</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input 
                placeholder={replyingTo ? `Reply to @${replyingTo.name}...` : "Add a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="flex-1 text-sm"
              />
              <Button 
                size="icon"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="shrink-0"
              >
                <Send size={14} className="sm:size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComments;