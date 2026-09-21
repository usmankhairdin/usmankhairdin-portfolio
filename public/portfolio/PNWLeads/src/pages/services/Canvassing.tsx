import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, MapPin, Users, CheckCircle, Calendar, TrendingUp, Target, Award, Clock, Shield } from 'lucide-react';

const Canvassing = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <UserCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            In-Person Canvassing
          </h1>
          <p className="text-2xl text-purple-100 font-semibold leading-relaxed">
            Direct, personal outreach that builds trust and generates high-quality leads through face-to-face interactions in your target neighborhoods.
          </p>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                The Power of Personal Connection
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-semibold leading-relaxed">
                <p>
                  In an increasingly digital world, personal connection stands out. Our professional canvassing teams create meaningful face-to-face interactions that build trust and generate high-quality leads.
                </p>
                <p>
                  Unlike cold calls or digital ads, door-to-door canvassing allows for immediate relationship building, real-time objection handling, and the ability to showcase your professionalism in person.
                </p>
                <p>
                  Our trained canvassers represent your brand with professionalism and expertise, turning neighborhood visits into qualified appointments and loyal customers.
                </p>
              </div>
              <div className="mt-8">
                <Link 
                  to="/contact"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  Start Canvassing
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                alt="Professional canvasser at door" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-purple-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">85%</div>
                  <div className="text-sm font-semibold">Trust Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canvassing Advantages */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Canvassing Works for Service Businesses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Face-to-face interaction creates trust and connection that digital marketing simply can't match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Builds Immediate Trust</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Face-to-face interaction creates instant credibility and trust that takes months to build through digital channels.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Highly Targeted</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Target specific neighborhoods, demographics, and property types that match your ideal customer profile.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Connection</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Create meaningful relationships that lead to referrals, repeat business, and long-term customer loyalty.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Immediate Feedback</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Get real-time responses, handle objections instantly, and adjust your approach based on immediate feedback.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Local Market Insight</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Gain valuable insights about local market conditions, customer needs, and competitive landscape.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Higher Conversion Rates</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Face-to-face leads typically convert at 3-5x higher rates than digital leads due to the personal connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Canvassing Process */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Professional Canvassing Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Every aspect of our canvassing program is designed to represent your brand professionally and generate qualified leads.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Territory Analysis & Planning</h3>
                  <p className="text-gray-600 font-semibold leading-relaxed">
                    We analyze demographics, property values, and market data to identify the most promising neighborhoods for your services.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Team Training & Preparation</h3>
                  <p className="text-gray-600 font-semibold leading-relaxed">
                    Our canvassers are thoroughly trained on your services, pricing, and brand messaging to represent you professionally.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Canvassing Execution</h3>
                  <p className="text-gray-600 font-semibold leading-relaxed">
                    Professional door-to-door outreach using proven scripts and techniques to engage homeowners and generate interest.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Lead Qualification & Handoff</h3>
                  <p className="text-gray-600 font-semibold leading-relaxed">
                    Qualified leads are immediately entered into your CRM with detailed notes and scheduled for follow-up appointments.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl p-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">What Our Canvassers Provide</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Professional appearance and branded materials</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Comprehensive knowledge of your services</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Real-time lead tracking and reporting</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Appointment setting capabilities</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Follow-up coordination</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-4" />
                  <span className="font-semibold text-gray-700">Detailed interaction reports</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Canvassing Results That Speak for Themselves
            </h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our professional canvassing programs consistently deliver high-quality leads with exceptional conversion rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">65%</div>
              <div className="text-purple-100 font-bold">Average Conversion Rate</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">3.5x</div>
              <div className="text-purple-100 font-bold">Higher Quality Than Digital Leads</div>
            </div>

            <div className="text-center p-8 bg-white/10 rounded-2xl">
              <div className="text-4xl font-bold text-white mb-2">85%</div>
              <div className="text-purple-100 font-bold">Customer Satisfaction Rate</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Case Study: Spokane Roofing Solutions</h3>
                <p className="text-gray-700 font-semibold leading-relaxed mb-6">
                  Our targeted canvassing campaign in high-value neighborhoods helped Spokane Roofing Solutions achieve remarkable growth in just 3 months.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Generated 156 qualified leads in 90 days</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Achieved 68% lead-to-appointment rate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Closed 42% of appointments</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-semibold text-gray-700">Generated $485,000 in new revenue</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">3-Month Campaign Results</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Doors Knocked</span>
                    <span className="text-2xl font-bold text-purple-600">2,847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Qualified Leads</span>
                    <span className="text-2xl font-bold text-purple-600">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Conversion Rate</span>
                    <span className="text-2xl font-bold text-purple-600">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Revenue Generated</span>
                    <span className="text-2xl font-bold text-purple-600">$485K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Canvassing Service Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              We provide professional canvassing services throughout the Pacific Northwest, targeting the most promising neighborhoods for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Washington State</h3>
              <ul className="text-gray-600 font-semibold space-y-2">
                <li>Seattle Metro Area</li>
                <li>Spokane</li>
                <li>Tacoma</li>
                <li>Bellevue</li>
                <li>Everett</li>
                <li>Vancouver</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Oregon</h3>
              <ul className="text-gray-600 font-semibold space-y-2">
                <li>Portland Metro Area</li>
                <li>Eugene</li>
                <li>Salem</li>
                <li>Gresham</li>
                <li>Hillsboro</li>
                <li>Bend</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Idaho</h3>
              <ul className="text-gray-600 font-semibold space-y-2">
                <li>Boise Metro Area</li>
                <li>Meridian</li>
                <li>Nampa</li>
                <li>Idaho Falls</li>
                <li>Pocatello</li>
                <li>Coeur d'Alene</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Start Canvassing?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Let our professional canvassing team generate high-quality leads through personal, face-to-face interactions in your target neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Launch Your Campaign
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

export default Canvassing;