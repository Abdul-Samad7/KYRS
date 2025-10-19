import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScientificLayout from './components/ScientificLayout';
import Dashboard from './pages/Dashboard';
import DataExplorer from './pages/DataExplorer';
import AskAnalysis from './pages/AskAnalysis';
import DataUpload from './pages/DataUpload';
import PlanetDetails from './pages/PlanetDetails';

export function App() {
  return (
    <BrowserRouter>
      <ScientificLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/explorer" element={<DataExplorer />} />
          <Route path="/ask" element={<AskAnalysis />} />
          <Route path="/upload" element={<DataUpload />} />
          <Route path="/planet/:id" element={<PlanetDetails />} />
        </Routes>
      </ScientificLayout>
    </BrowserRouter>
  );
}