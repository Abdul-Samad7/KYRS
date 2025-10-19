import React from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, GlobeIcon, BarChartIcon, InfoIcon } from 'lucide-react';
const Home = () => {
  return <div className="w-full bg-black">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10"></div>
          <img src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Space background with stars" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto py-32 px-4 sm:py-40 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            <span className="block">Discover Potentially Habitable</span>
            <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Exoplanets
            </span>
          </h1>
          <p className="mt-6 max-w-lg mx-auto text-xl text-gray-300">
            Explore the universe and learn about planets beyond our solar system
            that could potentially support life.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link to="/explore" className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 sm:px-8">
                Explore Exoplanets
              </Link>
              <Link to="/compare" className="flex items-center justify-center px-4 py-3 border border-gray-700 text-base font-medium rounded-md shadow-sm text-gray-200 bg-gray-800 hover:bg-gray-700 sm:px-8">
                Compare to Earth
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      <div className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white text-center">
            Discover the Universe with ExoExplorer
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="bg-blue-500 rounded-md p-2 w-12 h-12 flex items-center justify-center mb-4">
                <GlobeIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Interactive Visualizations
              </h3>
              <p className="mt-2 text-gray-300">
                Explore 3D models of exoplanets and their star systems with our
                interactive visualization tools.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="bg-purple-500 rounded-md p-2 w-12 h-12 flex items-center justify-center mb-4">
                <InfoIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Detailed Information
              </h3>
              <p className="mt-2 text-gray-300">
                Access comprehensive data about each exoplanet, including size,
                orbit, atmosphere, and habitability factors.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="bg-indigo-500 rounded-md p-2 w-12 h-12 flex items-center justify-center mb-4">
                <BarChartIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Data Visualization
              </h3>
              <p className="mt-2 text-gray-300">
                Compare exoplanets with Earth using intuitive charts and graphs
                for temperature, pressure, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* AI Section */}
      <div className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-extrabold text-white">
                Powered by Advanced AI
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Our platform uses cutting-edge AI to help you understand complex
                astronomical data in simple terms. Ask questions about
                exoplanets and get instant, accurate answers.
              </p>
              <div className="mt-6 rounded-md shadow">
                <div className="relative">
                  <input type="text" className="block w-full pl-4 pr-12 py-3 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ask about exoplanets..." disabled />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-gray-400">(Coming soon)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2 lg:flex lg:justify-end">
              <img src="https://images.unsplash.com/photo-1581822261290-991b38693d1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" alt="AI visualization" className="rounded-lg shadow-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Home;