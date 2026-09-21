
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, BarChart3, Users, Zap, Clock, Star } from 'lucide-react';

interface PremiumFeaturesProps {
  isPremium?: boolean;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  isPremium = false
}) => {
  const [isAnnual, setIsAnnual] = useState(true);
  if (isPremium) {
    return (
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-semibold text-amber-800 sm:text-lg">
            <Crown className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Premium Benefits
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-3 w-3 text-amber-600 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Advanced Analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-3 w-3 text-amber-600 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Nutritional coaching experts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-amber-600 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Custom Ranges</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-amber-600 flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Meal Plans</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-blue-50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-base font-semibold sm:text-lg">
            <Crown className="mr-2 h-4 w-4 text-primary sm:h-5 sm:w-5" />
            Unlock Premium
          </CardTitle>
          <Badge className="bg-primary text-primary-foreground text-xs">
            Limited Time
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-3 w-3 text-primary flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Advanced charts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-3 w-3 text-primary flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Nutritional coaching experts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3 text-primary flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">1+ year data</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-3 w-3 text-primary flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Pro meal plans</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-3 w-3 text-primary flex-shrink-0 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Timing optimization</span>
            </div>
          </div>
          
          <div className="border-t pt-3 sm:pt-4">
            {/* Pricing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <span className={`text-xs ${!isAnnual ? 'font-medium text-primary' : 'text-gray-600'}`}>
                Monthly
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    isAnnual ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                      isAnnual ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <span className={`text-xs ${isAnnual ? 'font-medium text-primary' : 'text-gray-600'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge className="bg-green-100 text-green-800 text-xs">Save 17%</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {isAnnual ? 'Premium Annual' : 'Premium Monthly'}
                </p>
                <p className="text-xs text-gray-600 sm:text-sm">
                  {isAnnual ? 'Save 17% vs monthly' : 'Cancel anytime'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary sm:text-2xl">
                  ${isAnnual ? '99' : '9.99'}
                </p>
                <span className="text-xs text-gray-500 sm:text-sm">
                  /{isAnnual ? 'year' : 'month'}
                </span>
                {isAnnual && (
                  <p className="text-xs text-gray-500 line-through sm:text-sm">$119.88</p>
                )}
              </div>
            </div>
            
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium touch-manipulation">
              <a href="/premium-analytics" className="w-full">Start 7-Day Free Trial</a>
            </Button>
            
            <p className="text-xs text-gray-500 text-center mt-2">
              Cancel anytime. No commitment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
