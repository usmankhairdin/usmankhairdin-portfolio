import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Target, Users, CheckCircle, Calendar, TrendingUp, Zap, Filter, Mail, Phone, Award } from 'lucide-react';

const LeadGeneration = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-orange-600 to-amber-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Lead Generation Systems
          </h1>
          <p className="text-2xl text-orange-100 font-semibold leading-relaxed">
            Comprehensive lead generation systems that capture, qualify, and nurture prospects through automated workflows and personalized follow-up sequences.
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Turn Prospects Into Paying Customers
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-semibold leading-relaxed">
                <p>
                  A steady stream of qualified leads is the lifeblood of any successful service business. Our comprehensive lead generation systems ensure you never run out of potential customers.
                </p>
                <p>
                  We build automated systems that work 24/7 to capture leads, qualify prospects, and nurture them through your sales funnel until they're ready to buy your services.
                </p>
                <p>
                  From initial contact to final conversion, every touchpoint is optimized to maximize your lead quality and conversion rates.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  Build My Lead System
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                alt="Lead generation funnel" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-orange-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm font-semibold">Lead Capture</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Components */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Lead Generation Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Every component works together to create a seamless lead generation machine that operates around the clock.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Capture Optimization</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Strategically placed forms and calls-to-action that convert website visitors into qualified leads.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  High-converting landing pages
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Exit-intent popups
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Contact form optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Live chat integration
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Filter className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Qualification</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Automated systems that score and qualify leads based on their likelihood to convert.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Lead scoring algorithms
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Behavioral tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Demographic filtering
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Budget qualification
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email Marketing Automation</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Personalized email sequences that nurture leads and guide them toward conversion.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Welcome email series
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Educational content delivery
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Promotional campaigns
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Re-engagement sequences
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">CRM Integration</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Seamless integration with your CRM system for efficient lead management and follow-up.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automatic lead import
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Task automation
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Follow-up reminders
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Pipeline management
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Nurturing Campaigns</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Multi-channel campaigns that keep your business top-of-mind until prospects are ready to buy.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Drip email campaigns
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  SMS follow-up sequences
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Retargeting ads
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Personalized content
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Analytics</h3>
              <p className="text-gray-600 mb-6 font-semibold">
                Detailed tracking and reporting to optimize every aspect of your lead generation funnel.
              </p>
              <ul className="space-y-2 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Conversion tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Lead source attribution
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  ROI analysis
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Performance optimization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Generation Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How Our Lead Generation System Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              A proven 5-step process that transforms website visitors into qualified leads and paying customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Attract</h3>
              <p className="text-gray-600 font-semibold">
                Drive targeted traffic to optimized landing pages through SEO, ads, and content marketing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Capture</h3>
              <p className="text-gray-600 font-semibold">
                Convert visitors into leads using compelling offers and optimized capture forms.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Qualify</h3>
              <p className="text-gray-600 font-semibold">
                Score and segment leads based on their readiness to purchase and fit for your services.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Nurture</h3>
              <p className="text-gray-600 font-semibold">
                Engage leads with valuable content and personalized follow-up sequences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">5</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Convert</h3>
              <p className="text-gray-600 font-semibold">
                Turn qualified leads into paying customers through strategic sales processes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-gradient-to-br from-orange-600 to-amber-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Lead Generation That Delivers Results
            </h2>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our systematic approach to lead generation consistently delivers high-quality prospects that convert into revenue.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">380%</div>
              <div className="text-orange-100 font-bold">Average Increase in Lead Volume</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">45%</div>
              <div className="text-orange-100 font-bold">Average Lead-to-Customer Rate</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-orange-100 font-bold">Automated Lead Generation</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Case Study: Northwest Landscaping</h3>
                <p className="text-gray-700 font-semibold leading-relaxed mb-6">
                  Our comprehensive lead generation system helped Northwest Landscaping overcome seasonal fluctuations and maintain consistent growth year-round.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Increased monthly leads from 22 to 78</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Improved lead quality by 65%</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Achieved 38% conversion rate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Generated $67,000 in additional monthly revenue</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">4-Month System Results</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Monthly Leads</span>
                    <span className="text-2xl font-bold text-orange-600">78</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Conversion Rate</span>
                    <span className="text-2xl font-bold text-orange-600">38%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Cost Per Lead</span>
                    <span className="text-2xl font-bold text-orange-600">$45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">ROI</span>
                    <span className="text-2xl font-bold text-orange-600">445%</span>
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
            Ready to Build Your Lead Generation System?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Let's create an automated lead generation system that works 24/7 to grow your service business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Build My System
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

export default LeadGeneration;