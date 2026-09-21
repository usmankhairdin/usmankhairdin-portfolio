import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, CheckCircle, TrendingUp, Calendar, ArrowRight, Target, Users, Award } from 'lucide-react';

const LocalSEO = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Local SEO Optimization
          </h1>
          <p className="text-2xl text-blue-100 font-semibold leading-relaxed">
            Dominate local search results and ensure your service business appears when customers need you most in the Pacific Northwest.
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Why Local SEO Matters for Service Businesses
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-semibold leading-relaxed">
                <p>
                  When customers need your services, they turn to Google first. Local SEO ensures your business appears at the top of search results when potential customers are actively looking for what you offer.
                </p>
                <p>
                  Our comprehensive local SEO strategy goes beyond basic optimization. We create a dominant online presence that builds trust, drives traffic, and converts searchers into paying customers.
                </p>
                <p>
                  With over 97% of consumers using online search to find local businesses, having a strong local SEO presence isn't optional—it's essential for growth.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  Get Started Today
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                alt="Local search results" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">97%</div>
                  <div className="text-sm font-semibold">Use Online Search</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Local SEO Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our comprehensive approach covers every aspect of local SEO to ensure maximum visibility and lead generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Google My Business Optimization</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Complete profile setup and optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Professional photos and virtual tours
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Regular posts and updates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Q&A management
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Local Keyword Optimization</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Comprehensive keyword research
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Location-specific targeting
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Service-based keyword optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Competitor analysis
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Review Management</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Review monitoring and alerts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Response strategy and templates
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Review generation campaigns
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Reputation repair when needed
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Citation Building</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  NAP consistency across platforms
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Industry-specific directories
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Local business listings
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Citation cleanup and correction
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Website Optimization</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  On-page SEO optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Local schema markup
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Mobile optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Page speed optimization
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Reporting</h3>
              <ul className="space-y-3 text-gray-600 font-semibold">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Ranking position tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Traffic and conversion metrics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  GMB insights and analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  Competitive analysis updates
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Local SEO Results That Matter
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our local SEO strategies deliver measurable results that directly impact your bottom line.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">285%</div>
              <div className="text-gray-600 font-bold">Average Increase in Local Search Visibility</div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">420%</div>
              <div className="text-gray-600 font-bold">Average Increase in Website Traffic</div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">340%</div>
              <div className="text-gray-600 font-bold">Average Increase in Lead Generation</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6">Case Study: Seattle Plumbing Pro</h3>
                <p className="text-blue-100 font-semibold leading-relaxed mb-6">
                  Within 6 months of implementing our local SEO strategy, Seattle Plumbing Pro saw dramatic improvements in their online visibility and lead generation.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-300 mr-3" />
                    <span className="font-semibold">Ranked #1 for "plumber Seattle" and 15 other key terms</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-300 mr-3" />
                    <span className="font-semibold">450% increase in Google My Business views</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-300 mr-3" />
                    <span className="font-semibold">320% increase in phone calls from search</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-300 mr-3" />
                    <span className="font-semibold">$89,000 monthly revenue increase</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/10 rounded-2xl p-8">
                <h4 className="text-xl font-bold mb-6">6-Month Results</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Local Search Rankings</span>
                    <span className="text-2xl font-bold text-green-300">#1-3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Monthly Leads</span>
                    <span className="text-2xl font-bold text-green-300">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Conversion Rate</span>
                    <span className="text-2xl font-bold text-green-300">34%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">ROI</span>
                    <span className="text-2xl font-bold text-green-300">423%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Local SEO Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              We follow a proven methodology to ensure your local SEO success from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Audit & Analysis</h3>
              <p className="text-gray-600 font-semibold">
                Comprehensive analysis of your current local SEO performance and competitive landscape.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Strategy Development</h3>
              <p className="text-gray-600 font-semibold">
                Custom local SEO strategy tailored to your business goals and target market.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Implementation</h3>
              <p className="text-gray-600 font-semibold">
                Execute optimization across all platforms and channels for maximum impact.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Monitor & Optimize</h3>
              <p className="text-gray-600 font-semibold">
                Continuous monitoring and optimization to maintain and improve rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Dominate Local Search?
          </h2>
          <p className="text-2xl text-blue-100 mb-10 font-semibold leading-relaxed">
            Let's optimize your local SEO and start generating more qualified leads from customers actively searching for your services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-white hover:bg-gray-100 text-blue-600 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Get Your Free SEO Audit
            </Link>
            <Link 
              to="/case-studies"
              className="border-2 border-white hover:border-blue-100 text-white hover:text-blue-100 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-white/10 flex items-center justify-center"
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

export default LocalSEO;