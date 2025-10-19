import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, DatasetStats } from '../services/api';
import { 
  RocketIcon, 
  SearchIcon, 
  BarChart3Icon, 
  SparklesIcon,
  GlobeIcon,
  Loader2Icon 
} from 'lucide-react';

const Home: React.FC = () => {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Discover
              </span>
              <br />
              <span className="text-white">Habitable Worlds</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Explore thousands of exoplanets discovered by NASA's Kepler mission. 
              Visualize them in 3D, compare them with Earth, and discover potentially habitable worlds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-lg font-semibold transition-all transform hover:scale-105"
              >
                <RocketIcon className="h-5 w-5" />
                Start Exploring
              </Link>
              <Link
                to="/compare"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-lg font-semibold transition-all"
              >
                <BarChart3Icon className="h-5 w-5" />
                Compare Planets
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          {loading ? (
            <div className="mt-16 flex justify-center">
              <Loader2Icon className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          ) : stats && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur border border-blue-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stats.total_planets.toLocaleString()}
                </div>
                <div className="text-gray-400">Total Exoplanets</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 backdrop-blur border border-green-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  {stats.confirmed.toLocaleString()}
                </div>
                <div className="text-gray-400">Confirmed Planets</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur border border-purple-500/30 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  {stats.avg_temperature.toFixed(0)}K
                </div>
                <div className="text-gray-400">Avg Temperature</div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 backdrop-blur border border-pink-500/30 rounded-lg p-6 text-center">
                <div className