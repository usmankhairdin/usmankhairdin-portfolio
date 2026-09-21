import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-6">
              <Target className="h-10 w-10 text-blue-400 mr-3" />
              <span className="text-2xl font-bold">PNWLeads</span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md font-semibold leading-relaxed">
              Helping service businesses across the Pacific Northwest generate qualified leads and grow their revenue through proven marketing strategies.
            </p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-blue-400 text-sm font-bold">f</span>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-blue-400 text-sm font-bold">in</span>
              </div>
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                <span className="text-blue-400 text-sm font-bold">tw</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><Link to="/services/local-seo" className="hover:text-white transition-colors font-semibold">Local SEO</Link></li>
              <li><Link to="/services/paid-advertising" className="hover:text-white transition-colors font-semibold">Paid Advertising</Link></li>
              <li><Link to="/services/lead-generation" className="hover:text-white transition-colors font-semibold">Lead Generation</Link></li>
              <li><Link to="/services/canvassing" className="hover:text-white transition-colors font-semibold">Canvassing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-lg">Contact</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3" />
                <span className="font-semibold">(555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3" />
                <span className="font-semibold">hello@pnwleads.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3" />
                <span className="font-semibold">Seattle, WA</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p className="font-semibold">&copy; 2024 PNWLeads. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;