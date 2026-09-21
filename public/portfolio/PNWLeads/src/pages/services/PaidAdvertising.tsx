import React from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Target, TrendingUp, CheckCircle, Calendar, DollarSign, Users, BarChart3, Zap, Award } from 'lucide-react';

const PaidAdvertising = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Megaphone className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Targeted Paid Advertising
          </h1>
          <p className="text-2xl text-green-100 font-semibold leading-relaxed">
            Strategic ad campaigns that reach your ideal customers at the perfect moment, maximizing your advertising budget and delivering qualified leads.
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Maximize Your Advertising ROI
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-semibold leading-relaxed">
                <p>
                  Stop wasting money on ads that don't convert. Our targeted paid advertising campaigns are designed to reach customers who are ready to buy your services right now.
                </p>
                <p>
                  We combine advanced targeting techniques, compelling ad creative, and optimized landing pages to ensure every dollar you spend generates maximum return on investment.
                </p>
                <p>
                  From Google Ads to Facebook advertising, we manage every aspect of your paid campaigns to deliver consistent, qualified leads that grow your business.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  Start Your Campaign
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                alt="Digital advertising dashboard" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-green-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">450%</div>
                  <div className="text-sm font-semibold">Average ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advertising Platforms */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Multi-Platform Advertising Strategy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              We leverage the most effective advertising platforms to reach your customers wherever they are online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Google Ads Management</h3>
              <p className="text-gray-700 mb-6 font-semibold leading-relaxed">
                Capture customers at the moment they're searching for your services with strategic Google Ads campaigns.
              </p>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Search campaign optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Local Services Ads management
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Display and remarketing campaigns
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  YouTube advertising
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Shopping campaigns for product-based services
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Social Media Advertising</h3>
              <p className="text-gray-700 mb-6 font-semibold leading-relaxed">
                Reach your target audience on Facebook, Instagram, and other social platforms with compelling visual campaigns.
              </p>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Facebook and Instagram ads
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  LinkedIn advertising for B2B services
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Nextdoor neighborhood targeting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Video and carousel ad formats
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Lookalike audience development
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What's Included in Your Campaigns
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Every aspect of your paid advertising is handled by our expert team to ensure maximum performance and ROI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Advanced Targeting</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• Geographic targeting</li>
                <li>• Demographic profiling</li>
                <li>• Behavioral targeting</li>
                <li>• Custom audience creation</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ad Creative Development</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• Compelling ad copy</li>
                <li>• Professional graphics</li>
                <li>• Video ad production</li>
                <li>• A/B testing</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Landing Page Optimization</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• High-converting landing pages</li>
                <li>• Mobile optimization</li>
                <li>• Form optimization</li>
                <li>• Speed optimization</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Budget Management</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• Strategic budget allocation</li>
                <li>• Bid optimization</li>
                <li>• Cost per lead tracking</li>
                <li>• ROI maximization</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Tracking</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• Conversion tracking setup</li>
                <li>• Call tracking integration</li>
                <li>• Analytics reporting</li>
                <li>• Performance optimization</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Reporting</h3>
              <ul className="space-y-2 text-gray-700 font-semibold">
                <li>• Detailed performance reports</li>
                <li>• ROI analysis</li>
                <li>• Optimization recommendations</li>
                <li>• Strategy adjustments</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Advertising Results That Drive Growth
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our data-driven approach to paid advertising delivers consistent, measurable results for service businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">450%</div>
              <div className="text-green-100 font-bold">Average ROI</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">65%</div>
              <div className="text-green-100 font-bold">Lower Cost Per Lead</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">280%</div>
              <div className="text-green-100 font-bold">Increase in Qualified Leads</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Case Study: Portland HVAC Solutions</h3>
                <p className="text-gray-700 font-semibold leading-relaxed mb-6">
                  Our comprehensive paid advertising strategy helped Portland HVAC Solutions achieve remarkable growth in just 4 months.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Reduced cost per lead by 58%</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Increased monthly leads from 12 to 95</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Achieved 520% ROI on ad spend</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Generated $125,000 in additional monthly revenue</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">4-Month Campaign Results</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Monthly Ad Spend</span>
                    <span className="text-2xl font-bold text-green-600">$8,500</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Monthly Leads</span>
                    <span className="text-2xl font-bold text-green-600">95</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Cost Per Lead</span>
                    <span className="text-2xl font-bold text-green-600">$89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">ROI</span>
                    <span className="text-2xl font-bold text-green-600">520%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Scale Your Advertising?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Let's create targeted advertising campaigns that deliver qualified leads and maximize your return on investment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-green-600 hover:bg-green-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Start Your Campaign
            </Link>
            <Link 
              to="/case-studies"
              className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-gray-800 flex items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mr-3" />
              View Success Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaidAdvertising;