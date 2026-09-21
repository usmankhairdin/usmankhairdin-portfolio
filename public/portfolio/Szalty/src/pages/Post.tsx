import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image, Plus, X, Activity, Send, ChevronDown, Search, Trash2, ArrowLeft, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import RatingSystem from "@/components/rating/RatingSystem";
import PhotoTagging from "@/components/photo/PhotoTagging";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface NutritionItem {
  id: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  quantity: number;
}

const Post = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [photoTags, setPhotoTags] = useState<Record<string, string[]>>({});
  const [isNutritionOpen, setIsNutritionOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [nutritionItems, setNutritionItems] = useState<NutritionItem[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [currentNutritionItem, setCurrentNutritionItem] = useState<NutritionItem>({
    id: "",
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: 1
  });
  
  const productDatabase = [
    {
      id: 1,
      name: "Maurten Gel 100",
      calories: 100,
      carbs: 25,
      protein: 0,
      fat: 0,
      portionSize: "1 gel"
    },
    {
      id: 2,
      name: "Maurten Drink Mix 320",
      calories: 320,
      carbs: 79,
      protein: 0,
      fat: 0,
      portionSize: "1 serving"
    },
    {
      id: 3,
      name: "Maurten Solid 225",
      calories: 225,
      carbs: 55,
      protein: 0,
      fat: 0,
      portionSize: "1 bar"
    },
    {
      id: 4,
      name: "Medium Banana",
      calories: 105,
      carbs: 27,
      protein: 1.3,
      fat: 0.4,
      portionSize: "1 medium"
    },
    {
      id: 5,
      name: "Large Banana",
      calories: 121,
      carbs: 31,
      protein: 1.5,
      fat: 0.4,
      portionSize: "1 large"
    }
  ];
  
  const filteredProducts = productDatabase.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddImage = () => {
    const mockImageUrls = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&auto=format",
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&auto=format",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format"
    ];
    
    if (images.length < mockImageUrls.length) {
      setImages([...images, mockImageUrls[images.length]]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setCurrentNutritionItem({
      id: `item-${Date.now()}`,
      name: product.name,
      calories: product.calories.toString(),
      protein: product.protein.toString(),
      carbs: product.carbs.toString(),
      fat: product.fat.toString(),
      quantity: 1
    });
    setSearchQuery("");
  };

  const handleAddNutritionItem = () => {
    if (currentNutritionItem.name || currentNutritionItem.calories) {
      const newItem = {
        ...currentNutritionItem,
        id: `item-${Date.now()}`,
        name: currentNutritionItem.name || "Custom item",
      };
      
      setNutritionItems(prev => [...prev, newItem]);
      toast({
        title: "Item added",
        description: `${newItem.name} added to your nutrition list.`
      });
      
      setCurrentNutritionItem({
        id: "",
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        quantity: 1
      });
      setSelectedProduct(null);
    } else {
      toast({
        title: "Missing information",
        description: "Please add a name or at least calories information.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveNutritionItem = (id: string) => {
    setNutritionItems(nutritionItems.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "Item removed from nutrition list."
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setNutritionItems(nutritionItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleSend = () => {
    console.log("Creating post...");
    toast({
      title: "Post created!",
      description: "Your nutrition post has been shared."
    });
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">New Post</h1>
        <button 
          onClick={handleSend}
          className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Send size={20} className="text-primary" />
        </button>
      </div>
      
      <div className="px-4 py-6 space-y-6 max-w-lg mx-auto pb-32">
        {/* Photos/Video Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Photos/Video</h2>
          
          {images.length === 0 ? (
            <div 
              onClick={handleAddImage}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Image size={20} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-base mb-4">Add up to 5 photos or videos</p>
                <Button 
                  variant="outline"
                  className="text-primary border-primary hover:bg-primary/10 rounded-full px-6 pointer-events-none"
                >
                  Choose Media
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div key={index} className="aspect-square rounded-xl relative overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Upload ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <button 
                  onClick={handleAddImage}
                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Plus size={20} className="text-gray-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Photo Tagging Section */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <PhotoTagging 
              photos={images}
              onTagsChange={setPhotoTags}
              initialTags={photoTags}
            />
          </div>
        )}
        
        {/* Description Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
          <Textarea 
            placeholder="Share details about your meal, recipe links, and how it impacts your performance..." 
            className="min-h-[120px] bg-white border-gray-200 rounded-xl resize-none text-base placeholder:text-gray-400"
          />
        </div>

        {/* Nutritional Data Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Collapsible open={isNutritionOpen} onOpenChange={setIsNutritionOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h2 className="text-lg font-medium text-gray-900">📊 Nutrition Information</h2>
              <ChevronDown 
                size={20} 
                className={`transition-transform text-gray-400 ${isNutritionOpen ? 'rotate-180' : ''}`}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 mt-6">
              {nutritionItems.length > 0 && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700">Added Items ({nutritionItems.length})</label>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {nutritionItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="font-medium text-base flex items-center">
                            <span className="mr-3 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-sm font-medium">
                              #{index + 1}
                            </span>
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {item.carbs}g carbs • {item.protein}g protein • {item.calories} cal
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <span className="text-base font-medium text-gray-500">-</span>
                            </button>
                            <span className="text-base w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <span className="text-base font-medium text-gray-500">+</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => handleRemoveNutritionItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <div className="text-base text-primary font-medium">Total Nutrition</div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="text-sm">
                        <span className="font-medium">Calories:</span> {nutritionItems.reduce((sum, item) => sum + (Number(item.calories) * item.quantity), 0)}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Carbs:</span> {nutritionItems.reduce((sum, item) => sum + (Number(item.carbs) * item.quantity), 0)}g
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Protein:</span> {nutritionItems.reduce((sum, item) => sum + (Number(item.protein) * item.quantity), 0)}g
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Fat:</span> {nutritionItems.reduce((sum, item) => sum + (Number(item.fat) * item.quantity), 0)}g
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700">🔍 Search Products</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3.5 text-gray-400" />
                  <Input 
                    placeholder='Type "maurten" or food name...'
                    className="pl-10 bg-gray-50 border-gray-200 text-base rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {searchQuery && (
                  <div className="border border-gray-200 rounded-xl bg-white shadow-sm max-h-32 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-base">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            {product.carbs}g carbs • {product.calories} cal
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-base text-gray-500">No products found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedProduct && (
                <div className="p-4 bg-primary/10 rounded-xl">
                  <div className="font-medium text-base text-primary">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-600">Nutritional data auto-filled</div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">Manual Entry</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Calories</label>
                    <Input 
                      placeholder="e.g. 450" 
                      className="bg-gray-50 border-gray-200 text-base rounded-xl mt-1"
                      value={currentNutritionItem.calories}
                      onChange={(e) => setCurrentNutritionItem({...currentNutritionItem, calories: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Carbs (g)</label>
                    <Input 
                      placeholder="e.g. 45" 
                      className="bg-gray-50 border-gray-200 text-base rounded-xl mt-1"
                      value={currentNutritionItem.carbs}
                      onChange={(e) => setCurrentNutritionItem({...currentNutritionItem, carbs: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Protein (g)</label>
                    <Input 
                      placeholder="e.g. 30" 
                      className="bg-gray-50 border-gray-200 text-base rounded-xl mt-1"
                      value={currentNutritionItem.protein}
                      onChange={(e) => setCurrentNutritionItem({...currentNutritionItem, protein: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Fat (g)</label>
                    <Input 
                      placeholder="e.g. 15" 
                      className="bg-gray-50 border-gray-200 text-base rounded-xl mt-1"
                      value={currentNutritionItem.fat}
                      onChange={(e) => setCurrentNutritionItem({...currentNutritionItem, fat: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddNutritionItem} 
                    variant="outline" 
                    className="text-primary border-primary hover:bg-primary/10 text-base rounded-full px-6"
                    disabled={!currentNutritionItem.name && !currentNutritionItem.calories}
                  >
                    <Plus size={16} className="mr-2" /> Add Item
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Link Workout Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Link Workout</h2>
              <p className="text-sm text-gray-500 mt-1">Connect your activity data</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="text-primary border-primary hover:bg-primary/10 rounded-full px-4"
            >
              <Activity size={16} className="mr-2" />
              Connect
            </Button>
          </div>
        </div>

        {/* Rating System */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <RatingSystem 
            onRatingsChange={setRatings}
            initialRatings={ratings}
          />
        </div>

        {/* Privacy Settings Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Lock size={20} className="text-gray-600" />
              <div>
                <h2 className="text-lg font-medium text-gray-900">Hide Post</h2>
                <p className="text-sm text-gray-500 mt-1">Only you will be able to see this post</p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          {isPrivate && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                🔒 This post will be private and only visible to you
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Bottom Create Post Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-10">
        <div className="max-w-lg mx-auto">
          <Button 
            onClick={handleSend}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-full text-lg font-medium shadow-lg"
          >
            {isPrivate ? "Create Private Post" : "Create Post"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Post;
