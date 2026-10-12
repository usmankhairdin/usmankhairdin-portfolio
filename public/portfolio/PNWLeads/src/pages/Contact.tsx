import React, { useState } from 'react';
import { Phone, Mail, MapPin, Calendar, MessageCircle, CheckCircle, Clock, Users } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '',
    budget: '',
    message: '',
    preferredContact: 'email'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (isSubmitted) {
    return (
      <div className="pt-16 min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Thank You!</h1>
            <p className="text-xl text-gray-600 mb-8 font-semibold leading-relaxed">
              We've received your message and will get back to you within 24 hours. Our team is excited to help you grow your service business with qualified leads.
            </p>
            <div className="bg-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What happens next?</h3>
              <ul className="text-left space-y-2 text-gray-700 font-semibold">
                <li className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  We'll review your information within 2 hours
                </li>
                <li className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-3" />
                  Our lead generation specialist will contact you
                </li>
                <li className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                  We'll schedule a free consultation call
                </li>
              </ul>
            </div>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Let's Grow Your Business Together
          </h1>
          <p className="text-2xl text-blue-100 font-semibold leading-relaxed">
            Ready to generate more qualified leads? Get in touch with our team and let's discuss how we can help scale your service business.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get Your Free Consultation</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-bold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-bold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-bold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                    placeholder="Smith Plumbing Services"
                  />
                </div>

                <div>
                  <label htmlFor="serviceType" className="block text-sm font-bold text-gray-700 mb-2">
                    Type of Service Business *
                  </label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    required
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                  >
                    <option value="">Select your business type</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="hvac">HVAC</option>
                    <option value="electrical">Electrical</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="roofing">Roofing</option>
                    <option value="cleaning">Cleaning Services</option>
                    <option value="pest-control">Pest Control</option>
                    <option value="home-improvement">Home Improvement</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-bold text-gray-700 mb-2">
                    Monthly Marketing Budget
                  </label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                  >
                    <option value="">Select your budget range</option>
                    <option value="under-2k">Under $2,000</option>
                    <option value="2k-5k">$2,000 - $5,000</option>
                    <option value="5k-10k">$5,000 - $10,000</option>
                    <option value="10k-20k">$10,000 - $20,000</option>
                    <option value="over-20k">Over $20,000</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredContact" className="block text-sm font-bold text-gray-700 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="font-semibold">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="font-semibold">Phone</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    Tell us about your goals
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold"
                    placeholder="What are your main challenges with lead generation? What are your growth goals?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  <Calendar className="h-6 w-6 mr-3" />
                  Book Your Free Consultation
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-2xl p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Get In Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Phone</p>
                      <p className="text-gray-600 font-semibold">(555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Email</p>
                      <p className="text-gray-600 font-semibold">hello@pnwleads.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                      <MapPin className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Location</p>
                      <p className="text-gray-600 font-semibold">Seattle, WA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-10 text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose PNWLeads?</h3>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="font-semibold">500+ Service businesses helped</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="font-semibold">340% Average ROI increase</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="font-semibold">98% Client satisfaction rate</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-6 w-6 mr-4 text-blue-200" />
                    <span className="font-semibold">Pacific Northwest specialists</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-100 rounded-3xl p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Hours</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Monday - Friday</span>
                    <span className="font-bold text-gray-900">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Saturday</span>
                    <span className="font-bold text-gray-900">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Sunday</span>
                    <span className="font-bold text-gray-900">Closed</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 font-semibold">
                  Emergency consultations available 24/7 for existing clients
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
