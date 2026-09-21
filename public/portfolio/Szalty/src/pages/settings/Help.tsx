import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HelpCircle, MessageSquare, Book, Video, Mail, Phone, ExternalLink, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const HelpSettings = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [supportForm, setSupportForm] = useState({
    category: '',
    subject: '',
    message: ''
  });

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: MessageSquare,
      action: () => console.log('Contact support'),
      color: 'bg-blue-500'
    },
    {
      title: 'User Guide',
      description: 'Learn how to use Szalty',
      icon: Book,
      action: () => console.log('Open user guide'),
      color: 'bg-green-500'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: Video,
      action: () => console.log('Open videos'),
      color: 'bg-purple-500'
    },
    {
      title: 'Community Forum',
      description: 'Ask the community',
      icon: HelpCircle,
      action: () => console.log('Open forum'),
      color: 'bg-orange-500'
    }
  ];

  const faqCategories = [
    {
      title: 'General',
      questions: [
        {
          id: 'general-1',
          question: 'What is Szalty?',
          answer: 'Szalty is a platform where you can share and follow your friends, family, chefs, or your favorite professional athletes and celebrities to watch their food journey. It helps you try to optimize your performance and nutrition while staying accountable and finding out what works best for you.'
        }
      ]
    },
    {
      title: 'Getting Started',
      questions: [
        {
          id: 'start-1',
          question: 'How do I create my first meal post?',
          answer: 'To create a meal post, tap the "+" button in the navigation bar, select your photos, add a description, tag the meal timing (pre/during/post workout), and include nutrition information if available.'
        },
        {
          id: 'start-2',
          question: 'How do I connect my fitness tracker?',
          answer: 'Go to Settings > Connected Apps, find your device (Strava, Garmin, etc.), and follow the connection process. This will sync your workout data automatically.'
        },
        {
          id: 'start-3',
          question: 'What is meal timing and why is it important?',
          answer: 'Meal timing refers to when you eat relative to your workouts (pre, during, or post). This helps other athletes understand your fueling strategy and optimize their own nutrition.'
        }
      ]
    },
    {
      title: 'Nutrition Tracking',
      questions: [
        {
          id: 'nutrition-1',
          question: 'How accurate is the nutrition data?',
          answer: 'Our nutrition database contains over 2 million foods. Data accuracy depends on the source - user-generated content may vary, while branded foods come directly from manufacturers.'
        },
        {
          id: 'nutrition-2',
          question: 'Can I create custom foods?',
          answer: 'Yes! Tap "Add Food" when creating a post, then "Create Custom Food" to add your own recipes or foods not in our database.'
        },
        {
          id: 'nutrition-3',
          question: 'How do I set nutrition goals?',
          answer: 'Premium users can set custom nutrition goals in Settings > Account > Nutrition Goals. Free users get basic goal tracking.'
        }
      ]
    },
    {
      title: 'Privacy & Safety',
      questions: [
        {
          id: 'privacy-1',
          question: 'Who can see my posts?',
          answer: 'By default, posts are public. You can change this in Settings > Privacy to make your account private, followers-only, or completely private.'
        },
        {
          id: 'privacy-2',
          question: 'How do I report inappropriate content?',
          answer: 'Tap the three dots on any post and select "Report". We review all reports within 24 hours and take appropriate action.'
        },
        {
          id: 'privacy-3',
          question: 'Can I export my data?',
          answer: 'Yes, you can export all your data in Settings > Privacy > Export Data. Premium users get additional export formats.'
        }
      ]
    },
    {
      title: 'Premium Features',
      questions: [
        {
          id: 'premium-1',
          question: 'What does Szalty Pro include?',
          answer: 'Pro includes advanced analytics, custom nutrition goals, priority support, data export capabilities, and access to select coaches.'
        },
        {
          id: 'premium-2',
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel anytime in Settings > Billing. Your subscription remains active until the end of your billing period.'
        },
        {
          id: 'premium-3',
          question: 'Is there a family plan?',
          answer: 'Currently we offer individual plans only. Family plans are on our roadmap for 2024.'
        }
      ]
    },
    {
      title: 'Coaches & Creators',
      questions: [
        {
          id: 'coaches-creators-1',
          question: 'Who can become a coach or creator on Szalty?',
          answer: 'Anyone can become a creator! Whether you\'re a certified nutrition coach, a mom sharing healthy recipes for kids, a chef wanting to display your food and offer meal plans, or anyone else adding value to our nutrition community - this is your platform to share and earn.'
        },
        {
          id: 'coaches-creators-2',
          question: 'Do coaches and creators get Szalty Pro for free?',
          answer: 'Yes! All approved coaches and creators get Szalty Pro at no cost. You only pay a portion of your subscription revenue (30%) when you start earning from your content. No upfront fees or monthly Pro charges.'
        },
        {
          id: 'coaches-creators-3',
          question: 'How does monetization work for creators?',
          answer: 'Creators can set up monthly subscription tiers for premium content like exclusive recipes, meal plans, nutrition guides, or specialized content. Subscriptions are the only monetization model - pricing typically ranges from $4.99 to $49.99 per month based on the value you provide.'
        },
        {
          id: 'coaches-creators-4',
          question: 'What percentage does Szalty take from creator earnings?',
          answer: 'Szalty takes 30% from creator subscription revenue. This helps us maintain the platform, provide creator tools, and support the community. Creators keep 70% of their subscription earnings.'
        },
        {
          id: 'coaches-creators-5',
          question: 'What types of content can I monetize?',
          answer: 'You can offer premium meal plans, exclusive recipes, nutrition guides, cooking tutorials, specialized diets (kids\' nutrition, sports nutrition, etc.), live Q&As, or any valuable nutrition content through monthly subscriptions. All monetization is subscription-based - no one-on-one coaching sessions are offered.'
        },
        {
          id: 'coaches-creators-6',
          question: 'How do I set my subscription pricing?',
          answer: 'You have full control over your monthly subscription pricing, typically ranging from $4.99 to $49.99 per month. Price based on the value and exclusivity of your content - comprehensive meal plans and expert guidance can command higher prices than basic recipe collections.'
        },
        {
          id: 'coaches-creators-7',
          question: 'How do I get started as a creator?',
          answer: 'You can apply to become a creator in two ways: 1) Build at least 1,000 followers on Szalty with good engagement, or 2) Prove you have 1,000+ subscribers/followers on another platform (Instagram, YouTube, TikTok, etc.). Apply through Settings > Creator Tools - we review for content quality and community value.'
        },
        {
          id: 'coaches-creators-8',
          question: 'What is the gold crown and who gets it?',
          answer: 'Professional athletes, creators, and nutritionists receive a 🥇 Gold Crown next to their name on posts to show their professional status and expertise in the nutrition and fitness community.'
        }
      ]
    }
  ];

  const toggleFaq = (questionId: string) => {
    setOpenFaq(openFaq === questionId ? null : questionId);
  };

  const filteredFaq = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      searchQuery === '' || 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>
            <p className="text-gray-600">Get help and find answers</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} text-white flex items-center justify-center mb-2`}>
                    <action.icon size={16} />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Search Help Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFaq.map((category) => (
                <div key={category.title}>
                  <h3 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                    {category.title}
                  </h3>
                  <div className="space-y-2">
                    {category.questions.map((faq) => (
                      <Collapsible key={faq.id}>
                        <CollapsibleTrigger
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                            {openFaq === faq.id ? (
                              <ChevronDown size={16} className="text-gray-500" />
                            ) : (
                              <ChevronRight size={16} className="text-gray-500" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className={openFaq === faq.id ? 'block' : 'hidden'}>
                          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{faq.answer}</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <MessageSquare size={20} className="text-blue-600" />
              <span>Contact Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={supportForm.category}
                onChange={(e) => setSupportForm(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input
                placeholder="Brief description of your issue"
                value={supportForm.subject}
                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <Textarea
                placeholder="Please provide as much detail as possible..."
                value={supportForm.message}
                onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                className="min-h-[120px]"
              />
            </div>
            <Button className="w-full">Send Message</Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Response time:</strong> We typically respond within 24 hours. 
                Premium users get priority support with faster response times.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Other Ways to Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Other Ways to Get Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Mail size={16} className="mr-2" />
              Email: support@szalty.com
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ExternalLink size={16} className="mr-2" />
              Community Forum
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Video size={16} className="mr-2" />
              Video Tutorials
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Book size={16} className="mr-2" />
              User Guide & Documentation
            </Button>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Szalty App</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Connected Apps Sync</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Nutrition Database</span>
                <Badge variant="default" className="bg-green-100 text-green-800">Operational</Badge>
              </div>
            </div>
            <Button variant="ghost" className="w-full mt-3 text-blue-600">
              <ExternalLink size={16} className="mr-2" />
              View Full Status Page
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpSettings;
