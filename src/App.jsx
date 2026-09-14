import { Routes, Route } from 'react-router-dom'
import HomeExperience from './experience/HomeExperience.jsx'
import Work from './pages/Work.jsx'
import Project from './pages/Project.jsx'
import About from './pages/About.jsx'
import Services from './pages/Services.jsx'
import Agencies from './pages/Agencies.jsx'
import Contact from './pages/Contact.jsx'

export default function App(){
  return <Routes>
    <Route path="/" element={<HomeExperience/>}/>
    <Route path="/work/" element={<Work/>}/>
    <Route path="/work/:slug/" element={<Project/>}/>
    <Route path="/about/" element={<About/>}/>
    <Route path="/services/" element={<Services/>}/>
    <Route path="/for-agencies/" element={<Agencies/>}/>
    <Route path="/contact/" element={<Contact/>}/>
    <Route path="*" element={<HomeExperience/>}/>
  </Routes>
}
