import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share, ArrowLeft, ChevronLeft, ChevronRight, Star, ExternalLink, ChevronDown, Crown, MoreHorizontal, Edit3, Trash2, EyeOff, Flag, Send, Shield } from 'lucide-react';

// Mock data - in a real app this would come from an API
const mockPostData = {
  '0': {
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
    performanceRating: 4.5,
    likedBy: [
      { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=1" },
      { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
      { name: "Sarah Johnson", avatar: "https://i.pravatar.cc/150?img=3" },
      { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=4" },
      { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?img=5" }
    ],
    commentList: [
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
    ]
  },
  '1': {
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
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000"
    ],
    description: "Quick morning coffee and oats before my run. Nothing fancy, just keeping it simple today! Sometimes less is more 🏃‍♀️",
    timing: "pre",
    workout: null, // No workout data
    nutrition: null, // No nutrition data
    nutritionItems: null,
    tags: ["morning", "simple", "coffee"],
    photoTags: {
      0: ["breakfast"]
    },
    likes: 89,
    comments: 12,
    createdAt: "4h ago",
    performanceRating: null,
    likedBy: [
      { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=4" },
      { name: "Lisa Park", avatar: "https://i.pravatar.cc/150?img=5" }
    ],
    commentList: [
      { 
        user: { name: "Alex Rivera", avatar: "https://i.pravatar.cc/150?img=4" },
        comment: "Love the simplicity! How was your run?",
        time: "3h ago"
      }
    ]
  },
  '2': {
    id: "2",
    user: {
      name: "Jake Thompson",
      avatar: "https://i.pravatar.cc/150?img=4",
      isPro: false,
      isAthlete: true,
      followerCount: 15000,
      isCurrentUser: false
    },
    images: [
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=1000",
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?q=80&w=1000"
    ],
    description: "Intense CrossFit session this morning! Feeling amazing but too exhausted to track nutrition today. Will get back on it tomorrow 💪",
    timing: "post",
    workout: {
      type: "CrossFit",
      duration: "45:30",
      distance: null,
      calories: "856"
    },
    nutrition: null, // No nutrition data
    nutritionItems: null,
    tags: ["crossfit", "intense", "workout", "exhausted"],
    photoTags: {
      0: ["post-workout"],
      1: ["recovery"]
    },
    likes: 156,
    comments: 31,
    createdAt: "6h ago",
    performanceRating: 4.2,
    likedBy: [
      { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=1" },
      { name: "Mike Chen", avatar: "https://i.pravatar.cc/150?img=2" },
      { name: "David Wilson", avatar: "https://i.pravatar.cc/150?img=6" }
    ],
    commentList: [
      { 
        user: { name: "David Wilson", avatar: "https://i.pravatar.cc/150?img=6" },
        comment: "Beast mode! What was the WOD today?",
        time: "5h ago"
      },
      { 
        user: { name: "Emma Wilson", avatar: "https://i.pravatar.cc/150?img=1" },
        comment: "Recovery is just as important! Take care of yourself 💪",
        time: "4h ago"
      }
    ]
  }
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; name: string } | null>(null);

  // Check if we should auto-open comments from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('comments') === 'true') {
      setIsCommentsOpen(true);
      // Scroll to comments section after a short delay to ensure it's rendered
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 300);
    }
  }, []);

  const post = mockPostData[id as keyof typeof mockPostData];

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }


  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length);
  };

  const navigateToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const totalNutrition = post.nutritionItems?.reduce((total, item) => ({
    calories: total.calories + (parseInt(item.calories) * item.quantity),
    protein: total.protein + (parseInt(item.protein) * item.quantity),
    carbs: total.carbs + (parseInt(item.carbs) * item.quantity),
    fat: total.fat + (parseInt(item.fat) * item.quantity)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 }) || post.nutrition;

  const handleSubmitComment = () => {
    if (newComment.trim()) {
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
            <DropdownMenuContent align="end" className="w-32 bg-background border border-border shadow-lg z-50">
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
          <h1 className="font-semibold text-base">Post</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto pt-4">
        {/* Main Post Card */}
        <div className="performance-card mb-6 animate-fade-in">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <div className="relative">
              <Avatar className={`h-10 w-10 ${post.user.isPro ? 'ring-2 ring-yellow-400' : ''}`}>
                <AvatarImage src={post.user.avatar} alt={post.user.name} className="object-cover" />
                <AvatarFallback className="text-sm">{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {post.user.isPro && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm text-foreground">{post.user.name}</h3>
              <p className="text-xs text-muted-foreground">{post.createdAt}</p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Show gold crown for Pro users only */}
              {post.user.isPro && (
                <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full">
                  <Crown size={12} className="text-yellow-800" />
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {post.user.isCurrentUser ? (
                    <>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/post')}
                      >
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

          {/* Images Carousel */}
          <div className="relative bg-black">
            <img
              src={post.images[currentImageIndex]}
              alt={`Post image ${currentImageIndex + 1}`}
              className="w-full h-[350px] object-cover"
            />
              
              {/* Photo Tags */}
              {post.photoTags?.[currentImageIndex] && (
                <div className="absolute top-3 right-3">
                  {post.photoTags[currentImageIndex].map((tag, index) => {
                    const tagColors = {
                      'pre-workout': 'bg-blue-500/80 text-white',
                      'during-workout': 'bg-orange-500/80 text-white', 
                      'post-workout': 'bg-green-500/80 text-white',
                      'recovery': 'bg-purple-500/80 text-white'
                    };
                    return (
                      <span 
                        key={`${tag}-${index}`} 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${tagColors[tag as keyof typeof tagColors] || 'bg-gray-500/80 text-white'} shadow-sm mb-1 block`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}

            {/* Navigation arrows */}
            {post.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image indicators */}
            {post.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {post.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Image thumbnails */}
          {post.images.length > 1 && (
            <div className="px-4 py-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {post.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToImage(index)}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary' : 'border-border'
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="px-4 py-5 border-y border-border/30">
            <p className="text-sm text-foreground leading-relaxed mb-3">{post.description}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="px-4 py-4 border-t border-border/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`text-sm ${isLiked ? 'text-red-500' : ''} px-0 hover:bg-transparent`}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {post.likes + (isLiked ? 1 : 0)}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm px-0 hover:bg-transparent"
                  onClick={() => setIsCommentsOpen(true)}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {post.comments}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Performance Rating Card */}
        {post.performanceRating && (
          <div className="performance-card mb-6">
            <Collapsible>
              <div className="px-4 py-5">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors">
                    <div>
                      <h3 className="font-medium text-sm mb-2">Performance Rating</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= post.performanceRating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {post.performanceRating}/5 Overall
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-4">
                  <div className="space-y-4 pt-2 border-t border-border/30">
                    <h4 className="font-medium text-xs text-muted-foreground mb-3">Detailed Breakdown</h4>
                    
                    {/* Energy Level */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Energy Level</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground w-8">4/5</span>
                      </div>
                    </div>
                    
                    {/* Performance */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Performance</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground w-8">5/5</span>
                      </div>
                    </div>
                    
                    {/* Recovery */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recovery</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground w-8">4/5</span>
                      </div>
                    </div>
                    
                    {/* Nutrition Quality */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nutrition Quality</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground w-8">5/5</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        )}

        {/* Workout Details Card */}
        {post.workout && (
          <div className="performance-card mb-6">
            <div className="px-4 py-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">Workout Details</h3>
                {post.workout.workoutDetails && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(post.workout.workoutDetails.url, '_blank')}
                    className="text-xs h-7"
                  >
                    View on {post.workout.workoutDetails.platform}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-medium text-sm">{post.workout.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-medium text-sm">{post.workout.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Calories</p>
                  <p className="font-medium text-sm">{post.workout.calories}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Nutrition Card */}
        <div className="performance-card mb-6">
          <div className="px-4 py-5">
            <h3 className="font-medium text-sm mb-4">Nutrition Details</h3>
            
            {totalNutrition ? (
              <>
                {/* Total Nutrition Summary */}
                <div className="grid grid-cols-4 gap-3 mb-5 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{totalNutrition.calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{totalNutrition.protein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{totalNutrition.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-orange-600">{totalNutrition.fat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>

                {/* Individual Food Items */}
                {post.nutritionItems && post.nutritionItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground mb-3">Food Items</h4>
                    {post.nutritionItems.map((item) => (
                      <Collapsible key={item.id}>
                        <CollapsibleTrigger asChild>
                          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-medium">{parseInt(item.calories) * item.quantity} cal</p>
                              </div>
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-3 pb-2">
                          <div className="grid grid-cols-3 gap-3 mt-2 p-3 bg-background rounded-lg border border-border/50">
                            <div className="text-center">
                              <p className="text-sm font-medium text-blue-600">{parseInt(item.protein) * item.quantity}g</p>
                              <p className="text-xs text-muted-foreground">Protein</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-green-600">{parseInt(item.carbs) * item.quantity}g</p>
                              <p className="text-xs text-muted-foreground">Carbs</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-orange-600">{parseInt(item.fat) * item.quantity}g</p>
                              <p className="text-xs text-muted-foreground">Fat</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No nutrition data available</p>
                <p className="text-xs text-muted-foreground mt-1">Add nutrition tracking to see detailed breakdowns</p>
              </div>
            )}
          </div>
        </div>

        {/* Workout Details Card */}
        {!post.workout ? (
          <div className="performance-card mb-6">
            <div className="px-4 py-5">
              <h3 className="font-medium text-sm mb-3">Workout Details</h3>
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">No workout data available</p>
                <p className="text-xs text-muted-foreground mt-1">Connect your fitness apps to track workouts</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Likes Section */}
        <div className="performance-card mb-6">
          <Collapsible open={isLikesOpen} onOpenChange={setIsLikesOpen}>
            <div className="px-4 py-5">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors">
                  <h3 className="font-medium text-sm">
                    Likes ({post.likes})
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isLikesOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4">
                <div className="space-y-3 pt-2 border-t border-border/30">
                  {post.likedBy && post.likedBy.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {post.likedBy.map((user, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user.name}</p>
                          </div>
                          <Heart className="h-4 w-4 text-red-500 fill-current" />
                        </div>
                      ))}
                      {/* Show additional likes count if there are more */}
                      {post.likes > post.likedBy.length && (
                        <div className="text-center py-2 border-t border-border/30">
                          <p className="text-xs text-muted-foreground">
                            +{post.likes - post.likedBy.length} more {post.likes - post.likedBy.length === 1 ? 'person' : 'people'} liked this post
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No likes yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Be the first to like this post!</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* Comments Section */}
        <div id="comments-section" className="performance-card mb-6">{/* Comments Section */}
          <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
            <div className="px-4 py-5">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors">
                  <h3 className="font-medium text-sm">
                    Comments ({post.commentList?.length || 0})
                  </h3>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isCommentsOpen ? 'rotate-180' : ''}`} />
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4">
                <div className="space-y-4 pt-2 border-t border-border/30">
                  {post.commentList && post.commentList.length > 0 ? (
                    post.commentList.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} />
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">No comments yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Be the first to comment!</p>
                    </div>
                  )}
                  
                  {/* Comment Input */}
                  <div className="pt-4 border-t border-border/30">
                    {/* Reply indicator */}
                    {replyingTo && (
                      <div className="mb-3 px-3 py-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center justify-between">
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
                    
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
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
                          <Send size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;