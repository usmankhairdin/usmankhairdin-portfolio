import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, DollarSign, Calendar, ArrowRight, CheckCircle, BarChart3, Target } from 'lucide-react';

const CaseStudies = () => {
  const caseStudies = [
    {
      id: 1,
      company: "Pacific Plumbing Co.",
      industry: "Plumbing Services",
      location: "Seattle, WA",
      duration: "6 months",
      challenge: "Inconsistent lead flow and low-quality prospects that rarely converted into paying customers.",
      solution: "Multi-channel approach combining local SEO optimization, targeted Google Ads, and strategic neighborhood canvassing.",
      results: {
        leads: { before: 15, after: 127, increase: "850%" },
        conversion: { before: 12, after: 34, increase: "120%" },
        revenue: { before: 25000, after: 89000, increase: "340%" },
        roi: { before: 150, after: 423, increase: "180%" }
      },
      testimonial: "PNWLeads completely transformed our business. We went from struggling to find customers to having more qualified leads than we can handle.",
      clientName: "John Pacific",
      clientTitle: "Owner"
    },
    {
      id: 2,
      company: "Emerald City HVAC",
      industry: "HVAC Services",
      location: "Portland, OR",
      duration: "8 months",
      challenge: "High customer acquisition costs and difficulty competing with larger HVAC companies in the market.",
      solution: "Comprehensive local SEO strategy, Facebook advertising campaigns, and targeted canvassing in high-value neighborhoods.",
      results: {
        leads: { before: 8, after: 95, increase: "1087%" },
        conversion: { before: 18, after: 42, increase: "133%" },
        revenue: { before: 32000, after: 125000, increase: "290%" },
        roi: { before: 180, after: 520, increase: "189%" }
      },
      testimonial: "The team at PNWLeads understood our market and delivered results beyond our expectations. Our business has never been stronger.",
      clientName: "Maria Gonzalez",
      clientTitle: "General Manager"
    },
    {
      id: 3,
      company: "Northwest Landscaping",
      industry: "Landscaping",
      location: "Spokane, WA",
      duration: "4 months",
      challenge: "Seasonal business fluctuations and difficulty maintaining consistent revenue throughout the year.",
      solution: "Year-round digital marketing strategy with seasonal campaign adjustments and targeted lead nurturing sequences.",
      results: {
        leads: { before: 22, after: 78, increase: "254%" },
        conversion: { before: 25, after: 38, increase: "52%" },
        revenue: { before: 18000, after: 67000, increase: "272%" },
        roi: { before: 200, after: 445, increase: "123%" }
      },
      testimonial: "PNWLeads helped us break the seasonal cycle and maintain steady growth year-round. Game changer for our business.",
      clientName: "David Chen",
      clientTitle: "Founder"
    }
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Success Stories
          </h1>
          <p className="text-2xl text-blue-100 font-semibold leading-relaxed">
            Real results from real service businesses across the Pacific Northwest. See how our proven strategies have transformed companies just like yours.
          </p>
        </div>
      </section>

      {/* Results Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Proven Results Across Industries
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our comprehensive approach has delivered consistent growth for service businesses of all sizes across the Pacific Northwest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 font-bold">Businesses Helped</div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">340%</div>
              <div className="text-gray-600 font-bold">Average ROI Increase</div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">$50M+</div>
              <div className="text-gray-600 font-bold">Revenue Generated</div>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600 font-bold">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {caseStudies.map((study, index) => (
              <div key={study.id} className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="bg-white rounded-3xl shadow-2xl p-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">{study.company}</h3>
                        <p className="text-lg text-gray-600 font-semibold">{study.industry} • {study.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                          {study.duration}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">The Challenge</h4>
                        <p className="text-gray-700 font-semibold leading-relaxed">{study.challenge}</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3">Our Solution</h4>
                        <p className="text-gray-700 font-semibold leading-relaxed">{study.solution}</p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-6">
                        <blockquote className="text-lg text-gray-700 font-semibold italic leading-relaxed mb-4">
                          "{study.testimonial}"
                        </blockquote>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-sm">
                              {study.clientName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{study.clientName}</p>
                            <p className="text-sm text-gray-600 font-semibold">{study.clientTitle}, {study.company}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl shadow-2xl p-10 text-white">
                    <h4 className="text-2xl font-bold mb-8">Results Achieved</h4>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-blue-100">Monthly Leads</div>
                          <div className="text-2xl font-bold">{study.results.leads.after}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-100">Before: {study.results.leads.before}</div>
                          <div className="text-lg font-bold text-green-300">+{study.results.leads.increase}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-blue-100">Conversion Rate</div>
                          <div className="text-2xl font-bold">{study.results.conversion.after}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-100">Before: {study.results.conversion.before}%</div>
                          <div className="text-lg font-bold text-green-300">+{study.results.conversion.increase}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-blue-100">Monthly Revenue</div>
                          <div className="text-2xl font-bold">${(study.results.revenue.after / 1000).toFixed(0)}K</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-100">Before: ${(study.results.revenue.before / 1000).toFixed(0)}K</div>
                          <div className="text-lg font-bold text-green-300">+{study.results.revenue.increase}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                        <div>
                          <div className="text-sm font-semibold text-blue-100">ROI</div>
                          <div className="text-2xl font-bold">{study.results.roi.after}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-100">Before: {study.results.roi.before}%</div>
                          <div className="text-lg font-bold text-green-300">+{study.results.roi.increase}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Industries We Serve
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
              Our proven strategies work across a wide range of service industries throughout the Pacific Northwest.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              'Plumbing', 'HVAC', 'Electrical', 'Landscaping',
              'Roofing', 'Cleaning', 'Pest Control', 'Home Improvement',
              'Painting', 'Flooring', 'Windows & Doors', 'Solar Installation'
            ].map((industry) => (
              <div key={industry} className="bg-gray-50 rounded-xl p-6 text-center hover:bg-gray-100 transition-colors duration-200">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900">{industry}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="text-2xl text-gray-300 mb-10 font-semibold leading-relaxed">
            Join hundreds of service businesses that have transformed their growth with our proven lead generation strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Calendar className="h-6 w-6 mr-3" />
              Start Your Success Story
            </Link>
            <Link 
              to="/services"
              className="border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-gray-800 flex items-center justify-center"
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              View Our Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;