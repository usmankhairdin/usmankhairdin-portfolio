import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Megaphone, UserCheck, BarChart3, CheckCircle, ArrowRight, Target, TrendingUp, Award } from 'lucide-react';

const Services = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Our Lead Generation Services
          </h1>
          <p className="text-2xl text-blue-100 max-w-3xl mx-auto font-semibold leading-relaxed">
            Comprehensive solutions designed to generate qualified leads and grow your service business across the Pacific Northwest.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Complete Lead Generation Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our integrated approach combines digital marketing, local optimization, and direct outreach to deliver consistent, high-quality leads for your service business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Local SEO */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Local SEO Optimization</h3>
              <p className="text-gray-700 mb-8 font-semibold leading-relaxed text-lg">
                Dominate local search results and ensure your service business appears when customers need you most. Our comprehensive SEO strategy puts you ahead of the competition.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Google My Business optimization and management
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Local keyword research and targeting
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Citation building and NAP consistency
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Review management and reputation building
                </li>
              </ul>
              <Link 
                to="/services/local-seo"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 inline-flex items-center"
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Paid Advertising */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center mb-8">
                <Megaphone className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Targeted Paid Advertising</h3>
              <p className="text-gray-700 mb-8 font-semibold leading-relaxed text-lg">
                Strategic ad campaigns that reach your ideal customers at the perfect moment, maximizing your advertising budget and delivering qualified leads.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Google Ads campaign management
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Facebook and Instagram advertising
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Landing page design and optimization
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Conversion tracking and analytics
                </li>
              </ul>
              <Link 
                to="/services/paid-advertising"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 inline-flex items-center"
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Lead Generation */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-3xl p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center mb-8">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Lead Generation Systems</h3>
              <p className="text-gray-700 mb-8 font-semibold leading-relaxed text-lg">
                Comprehensive lead generation systems that capture, qualify, and nurture prospects through automated workflows and personalized follow-up sequences.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Lead capture form optimization
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  CRM integration and automation
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Email marketing campaigns
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Lead scoring and qualification
                </li>
              </ul>
              <Link 
                to="/services/lead-generation"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 inline-flex items-center"
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>

            {/* Canvassing */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl p-10 hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mb-8">
                <UserCheck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">In-Person Canvassing</h3>
              <p className="text-gray-700 mb-8 font-semibold leading-relaxed text-lg">
                Direct, personal outreach that builds trust and generates high-quality leads through face-to-face interactions in your target neighborhoods.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Trained canvassing teams
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Strategic neighborhood targeting
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Real-time lead tracking and reporting
                </li>
                <li className="flex items-center text-gray-700 font-semibold">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  Appointment setting and follow-up
                </li>
              </ul>
              <Link 
                to="/services/canvassing"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 inline-flex items-center"
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose PNWLeads Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our comprehensive approach and proven track record make us the trusted choice for service businesses across the Pacific Northwest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Targeted Approach</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                We focus specifically on service businesses in the Pacific Northwest, understanding your unique market challenges and opportunities.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Results</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Our clients see an average 340% increase in ROI and 98% satisfaction rate with our comprehensive lead generation services.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Full-Service Support</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                From strategy development to implementation and ongoing optimization, we handle every aspect of your lead generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Transform Your Lead Generation?
          </h2>
          <p className="text-2xl text-blue-100 mb-10 font-semibold leading-relaxed">
            Let's discuss which services are right for your business and create a custom strategy that delivers results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-white hover:bg-gray-100 text-blue-600 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              Get Started Today
            </Link>
            <Link 
              to="/case-studies"
              className="border-2 border-white hover:border-blue-100 text-white hover:text-blue-100 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-white/10 flex items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mr-3" />
              View Case Studies
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;