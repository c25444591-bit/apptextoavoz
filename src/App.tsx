import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import { AdminPage } from './pages/AdminPage';
import { HowItWorks } from './pages/HowItWorks';
// import { SamsungVoiceGuide } from './pages/SamsungVoiceGuide';

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/como-funciona" element={<HowItWorks />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
