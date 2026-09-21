import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Play,
  Award,
  Search,
  Megaphone,
  UserCheck,
  BarChart3,
  Calendar,
  MessageCircle
} from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-20 pb-24">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
            alt="Business meeting background" 
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-50/85 to-white/90"></div>
        </div>

        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-full opacity-10 blur-2xl"></div>
          <div className="absolute top-1/2 right-20 w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-15 blur-xl transform -translate-y-1/2"></div>
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 left-1/3 w-3 h-3 bg-indigo-500 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-pulse delay-500"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.05)_1px,transparent_0)] bg-[length:24px_24px]"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-50/30 to-transparent transform rotate-12 scale-150"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Grow Your Service Business With 
                <span className="text-blue-600 relative">
                  <span className="relative z-10"> Qualified Leads</span>
                  <div className="absolute bottom-3 left-0 w-full h-4 bg-blue-200 opacity-30 transform -skew-x-12"></div>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl font-semibold leading-relaxed">
                Stop chasing unqualified prospects. We deliver high-quality leads that convert into paying customers for service businesses across the Pacific Northwest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  <Calendar className="h-6 w-6 mr-3 group-hover:animate-bounce" />
                  Book a Free Call
                </Link>
                <button className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-white/80 backdrop-blur-sm flex items-center justify-center group">
                  <Play className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 relative overflow-hidden border border-white/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-600 rounded-full translate-y-12 -translate-x-12 opacity-20"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900">Lead Generation Dashboard</h3>
                    <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      <span className="text-sm font-bold">+247% Growth</span>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                        <span className="text-base font-bold text-gray-700">Qualified Leads</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">127</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-4 animate-pulse delay-200"></div>
                        <span className="text-base font-bold text-gray-700">Conversion Rate</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">34%</span>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mr-4 animate-pulse delay-500"></div>
                        <span className="text-base font-bold text-gray-700">ROI</span>
                      </div>
                      <span className="text-2xl font-bold text-gray-900">423%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-bounce"></div>
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-purple-500 rounded-full opacity-25 animate-bounce delay-1000"></div>
              <div className="absolute top-1/2 -left-8 w-4 h-4 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About PNWLeads */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[length:32px_32px]"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Service Businesses Trust PNWLeads
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              We specialize in helping service businesses like yours generate consistent, high-quality leads that convert into paying customers. Our proven system has helped hundreds of companies across the Pacific Northwest scale their operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">500+</h3>
              <p className="text-gray-600 font-bold text-lg">Service Businesses Helped</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">340%</h3>
              <p className="text-gray-600 font-bold text-lg">Average ROI Increase</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">98%</h3>
              <p className="text-gray-600 font-bold text-lg">Client Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How We Generate Qualified Leads For You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-semibold leading-relaxed">
              Our proven 3-step process combines digital marketing expertise with local market knowledge to deliver results that matter.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-8">
                <Search className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center mb-6">
                <span className="bg-blue-100 text-blue-600 text-sm font-bold px-4 py-2 rounded-full mr-4">01</span>
                <h3 className="text-xl font-bold text-gray-900">Local SEO Optimization</h3>
              </div>
              <p className="text-gray-600 mb-8 font-semibold leading-relaxed">
                We optimize your online presence to dominate local search results, ensuring your service business appears when customers need you most.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-8">
                <Megaphone className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center mb-6">
                <span className="bg-green-100 text-green-600 text-sm font-bold px-4 py-2 rounded-full mr-4">02</span>
                <h3 className="text-xl font-bold text-gray-900">Targeted Paid Advertising</h3>
              </div>
              <p className="text-gray-600 mb-8 font-semibold leading-relaxed">
                Strategic ad campaigns that reach your ideal customers at the perfect moment, maximizing your advertising budget and lead quality.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-10 hover:shadow-xl transition-shadow duration-200">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-8">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div className="flex items-center mb-6">
                <span className="bg-orange-100 text-orange-600 text-sm font-bold px-4 py-2 rounded-full mr-4">03</span>
                <h3 className="text-xl font-bold text-gray-900">In-Person Canvassing</h3>
              </div>
              <p className="text-gray-600 mb-8 font-semibold leading-relaxed">
                Direct, personal outreach that builds trust and generates high-quality leads through face-to-face interactions in your local market.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/services"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              View All Services
              <BarChart3 className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600 font-semibold">
              Don't just take our word for it. Here's what service business owners are saying about working with PNWLeads.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 font-semibold leading-relaxed text-lg">
                "PNWLeads transformed our business. We went from 5 leads per month to 50+ qualified leads. Our revenue increased by 280% in just 6 months."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">JS</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600 font-semibold">Smith Plumbing Services</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 font-semibold leading-relaxed text-lg">
                "The quality of leads is incredible. Every lead they send us is pre-qualified and ready to buy. Our conversion rate has never been higher."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MJ</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">Maria Johnson</p>
                  <p className="text-sm text-gray-600 font-semibold">Johnson Landscaping</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 font-semibold leading-relaxed text-lg">
                "Professional, reliable, and results-driven. PNWLeads helped us scale from a 2-person operation to a team of 15 in under a year."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">DT</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">David Thompson</p>
                  <p className="text-sm text-gray-600 font-semibold">Thompson HVAC</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/case-studies"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
            >
              View Case Studies
              <TrendingUp className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Scale Your Service Business?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Stop struggling with inconsistent leads. Let us help you build a predictable, profitable lead generation system that grows your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              Grow My Leads Now
            </Link>
            <Link 
              to="/contact"
              className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-gray-800 flex items-center justify-center"
            >
              <MessageCircle className="h-6 w-6 mr-3" />
              Chat With Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;