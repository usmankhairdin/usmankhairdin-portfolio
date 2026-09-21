import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Star, Calendar, Download, Gift, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BillingSettings = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  
  const currentPlan = {
    name: 'Szalty Pro',
    status: 'active',
    nextBilling: '2024-02-15',
    features: [
      'Advanced analytics',
      'Access to nutritional coaching experts',
      'Custom nutrition goals',
      'Priority support',
      'Export data'
    ]
  };

  const planPricing = {
    monthly: { price: 9.99, billing: 'month' },
    annual: { price: 99.99, billing: 'year', savings: 17 }
  };

  const currentPrice = isAnnual ? planPricing.annual : planPricing.monthly;
  const billingHistory = [
    { date: '2024-01-15', amount: '$9.99', status: 'paid', plan: 'Szalty Pro Monthly' },
    { date: '2023-12-15', amount: '$9.99', status: 'paid', plan: 'Szalty Pro Monthly' },
    { date: '2023-11-15', amount: '$9.99', status: 'paid', plan: 'Szalty Pro Monthly' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subscription & Billing</h1>
            <p className="text-gray-600">Manage your premium subscription</p>
          </div>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Star size={20} className="text-yellow-500" />
              <span>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentPlan.name}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  ${currentPrice.price}
                  <span className="text-sm font-normal text-gray-500">/{currentPrice.billing}</span>
                </p>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                {currentPlan.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check size={16} className="text-green-600" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Next billing date: {currentPlan.nextBilling}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Plan Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <Label htmlFor="billing-toggle" className={`font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
              />
              <div className="flex items-center space-x-2">
                <Label htmlFor="billing-toggle" className={`font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                  Annual
                </Label>
                {isAnnual && (
                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                    Save {planPricing.annual.savings}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Plan Details */}
            <div className="border rounded-lg p-6 bg-white">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Szalty Pro</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-600">${currentPrice.price}</span>
                  <span className="text-gray-500">/{currentPrice.billing}</span>
                </div>
                {isAnnual && (
                  <p className="text-sm text-green-600 mt-1">
                    Save ${(planPricing.monthly.price * 12 - planPricing.annual.price).toFixed(2)} per year
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check size={14} className="text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full">
                {isAnnual ? 'Switch to Annual Plan' : 'Current Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <CreditCard size={20} className="text-blue-600" />
              <span>Billing Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Auto-renewal</label>
                <p className="text-sm text-gray-500">Automatically renew subscription</p>
              </div>
              <Switch
                checked={autoRenew}
                onCheckedChange={setAutoRenew}
              />
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard size={16} className="mr-2" />
                Update payment method
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download size={16} className="mr-2" />
                Download invoices
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {billingHistory.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.plan}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{transaction.amount}</p>
                    <Badge 
                      variant="default" 
                      className={`text-xs ${
                        transaction.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <Gift size={20} className="text-blue-600" />
              <span>Referral Program</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Earn Free Months!</h3>
              <p className="text-sm text-gray-700 mb-3">
                Refer friends to Szalty Pro and earn 1 month free for each successful referral.
              </p>
              <Button variant="default" className="w-full">
                Share Your Referral Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cancel Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <AlertCircle size={20} className="text-red-500" />
              <span>Cancel Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Need to cancel? We're sorry to see you go. Your subscription will remain active until the end of your billing period.
              </p>
              <Button variant="destructive" className="w-full">
                Cancel Subscription
              </Button>
              <p className="text-xs text-gray-500 text-center">
                You can reactivate anytime before your subscription expires
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingSettings;