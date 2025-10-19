import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExploreExoplanets from './pages/ExploreExoplanets';
import PlanetDetails from './pages/PlanetDetails';
import CompareExoplanets from './pages/CompareExoplanets';
import Navigation from './components/Navigation';
export function App() {
  return <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <Navigation />
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreExoplanets />} />
            <Route path="/planet/:id" element={<PlanetDetails />} />
            <Route path="/compare" element={<CompareExoplanets />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>;
}