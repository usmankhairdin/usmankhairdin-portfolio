import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import CaseStudies from './pages/CaseStudies';
import About from './pages/About';
import Contact from './pages/Contact';
import LocalSEO from './pages/services/LocalSEO';
import PaidAdvertising from './pages/services/PaidAdvertising';
import LeadGeneration from './pages/services/LeadGeneration';
import Canvassing from './pages/services/Canvassing';

function App() {
  return (
    <Router basename="/portfolio/PNWLeads">
      <div className="min-h-screen bg-white font-sans">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/local-seo" element={<LocalSEO />} />
          <Route path="/services/paid-advertising" element={<PaidAdvertising />} />
          <Route path="/services/lead-generation" element={<LeadGeneration />} />
          <Route path="/services/canvassing" element={<Canvassing />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;