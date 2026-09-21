import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Target, Award, TrendingUp, CheckCircle, ArrowRight, MapPin, Calendar, Briefcase } from 'lucide-react';

const About = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            About PNWLeads
          </h1>
          <p className="text-2xl text-blue-100 font-semibold leading-relaxed">
            We're passionate about helping service businesses across the Pacific Northwest grow through qualified lead generation and proven marketing strategies.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-700 font-semibold leading-relaxed">
                <p>
                  Founded in 2019, PNWLeads was born from a simple observation: service businesses in the Pacific Northwest were struggling to generate consistent, high-quality leads despite having excellent services and strong local reputations.
                </p>
                <p>
                  Our founders, having worked in digital marketing and local business development for over a decade, recognized that traditional marketing approaches weren't delivering the results that service businesses needed to thrive in an increasingly competitive market.
                </p>
                <p>
                  We set out to create a comprehensive lead generation system that combines the best of digital marketing, local SEO, targeted advertising, and personal outreach to deliver qualified leads that convert into paying customers.
                </p>
                <p>
                  Today, we've helped over 500 service businesses across Washington, Oregon, and Idaho scale their operations, increase their revenue, and build sustainable growth through our proven lead generation strategies.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop" 
                alt="Team collaboration" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm font-semibold">Businesses Helped</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our Mission & Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              We're driven by a commitment to help service businesses succeed through transparent, results-driven lead generation strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Results-Focused</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Every strategy we implement is designed with one goal in mind: generating qualified leads that convert into paying customers for your business.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                We believe in complete transparency. You'll always know exactly what we're doing, why we're doing it, and how it's performing.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Partnership</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                We don't just work for you; we work with you as a true partner in your business growth and long-term success.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Local Expertise</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Our deep understanding of Pacific Northwest markets gives us unique insights into what works for service businesses in this region.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Continuous Growth</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                We're constantly evolving our strategies and staying ahead of industry trends to ensure your business continues to grow.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600 font-semibold leading-relaxed">
                We hold ourselves to the highest standards and are committed to delivering exceptional results for every client we serve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our experienced team of marketing professionals, local SEO experts, and business development specialists are dedicated to your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">MR</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Michael Rodriguez</h3>
              <p className="text-blue-600 font-bold mb-4">Founder & CEO</p>
              <p className="text-gray-600 font-semibold leading-relaxed">
                15+ years in digital marketing and business development. Specializes in lead generation strategies for service businesses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">SC</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sarah Chen</h3>
              <p className="text-green-600 font-bold mb-4">Head of Digital Marketing</p>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Expert in local SEO and paid advertising with a track record of delivering 300%+ ROI for service businesses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">DJ</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">David Johnson</h3>
              <p className="text-orange-600 font-bold mb-4">Lead Generation Specialist</p>
              <p className="text-gray-600 font-semibold leading-relaxed">
                Manages our canvassing operations and direct outreach programs, ensuring high-quality lead generation and conversion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Approach
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto font-semibold leading-relaxed">
              We believe in a comprehensive, data-driven approach that combines multiple channels to maximize your lead generation potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Analysis</h3>
              <p className="text-blue-100 font-semibold">
                We start by analyzing your current marketing efforts, target market, and competition to identify opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Strategy</h3>
              <p className="text-blue-100 font-semibold">
                We develop a custom multi-channel strategy tailored to your business goals and target audience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Implementation</h3>
              <p className="text-blue-100 font-semibold">
                Our team executes the strategy across all channels while maintaining consistent messaging and branding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Optimization</h3>
              <p className="text-blue-100 font-semibold">
                We continuously monitor performance and optimize campaigns to maximize ROI and lead quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Partner With Us?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Let's discuss how our proven approach can help your service business generate more qualified leads and achieve sustainable growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Schedule a Consultation
            </Link>
            <Link 
              to="/services"
              className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-gray-800 flex items-center justify-center"
            >
              <Briefcase className="h-6 w-6 mr-3" />
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;