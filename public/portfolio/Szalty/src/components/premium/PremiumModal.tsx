import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Check, Crown, Zap } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PremiumModal = ({ open, onOpenChange }: PremiumModalProps) => {
  const premiumFeatures = [
    {
      title: "Personal Nutrition Coaching",
      description: "Connect with certified nutrition coaches for personalized meal plans and guidance",
      icon: <Star className="text-szalty-orange" size={20} />,
      highlight: true
    },
    {
      title: "Advanced Analytics",
      description: "Detailed performance tracking and nutrition correlation insights",
      icon: <Zap className="text-szalty-blue" size={20} />
    },
    {
      title: "Priority Support",
      description: "Get priority customer support and direct coach access",
      icon: <Crown className="text-szalty-yellow" size={20} />
    },
    {
      title: "Exclusive Content",
      description: "Access to premium meal plans and expert nutrition guides",
      icon: <Check className="text-green-500" size={20} />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Crown className="mr-2 text-szalty-orange" size={24} />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-szalty-blue mb-2">$9.99/month</h3>
            <p className="text-sm text-gray-600">Unlock premium features and coaching</p>
          </div>

          <div className="space-y-3">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className={`p-4 ${feature.highlight ? 'border-szalty-orange bg-szalty-orange/5' : ''}`}>
                <div className="flex items-start space-x-3">
                  {feature.icon}
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    {feature.highlight && (
                      <Badge className="mt-2 bg-szalty-orange text-white text-xs">
                        New Feature!
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Maybe Later
            </Button>
            <Button className="bg-szalty-blue text-white hover:bg-szalty-blue/90 flex-1">
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};