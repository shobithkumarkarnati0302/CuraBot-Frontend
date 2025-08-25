import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ChatBot } from './components/ChatBot';
import { Home } from './pages/Home';
import { Appointments } from './pages/Appointments';
import { Doctors } from './pages/Doctors';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { LabRecords } from './pages/LabRecords';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-warm-bg flex flex-col">
        <Navbar />
        <main className="w-full flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lab-records" element={<LabRecords />} />
          </Routes>
        </main>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;