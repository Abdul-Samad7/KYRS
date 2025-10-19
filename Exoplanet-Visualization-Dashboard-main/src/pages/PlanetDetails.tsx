import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ExoplanetVisualization from '../components/ExoplanetVisualization';
import PlanetMetrics from '../components/PlanetMetrics';
import { ArrowLeftIcon, ThermometerIcon, CloudIcon, RulerIcon, CalendarIcon, DropletIcon, GlobeIcon } from 'lucide-react';
// Mock planet data
const planetData = {
  '1': {
    id: '1',
    name: 'Kepler-442b',
    description: 'Kepler-442b is a super Earth exoplanet that orbits a K-type star. Its mass is 2.36 Earths, it takes 112.3 days to complete one orbit of its star, and is 0.409 AU from its star. It has an ESI (Earth Similarity Index) of 0.84.',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    texture: 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004874/earth_day_map_2048.jpg',
    distance: '1,206 light years',
    size: '1.3x Earth',
    mass: '2.36x Earth',
    temperature: '295K (22°C)',
    habitabilityScore: 85,
    orbitalPeriod: '112.3 days',
    stellarType: 'K-type star',
    discoveryYear: 2015,
    atmosphereComposition: 'Likely nitrogen, oxygen, and carbon dioxide',
    waterPresence: 'High probability of liquid water',
    surfaceGravity: '1.3g',
    metrics: {
      temperature: [{
        name: 'Day',
        value: 305,
        unit: 'K'
      }, {
        name: 'Night',
        value: 285,
        unit: 'K'
      }, {
        name: 'Average',
        value: 295,
        unit: 'K'
      }],
      orbital: [{
        name: 'Distance',
        value: 0.409,
        unit: 'AU'
      }, {
        name: 'Period',
        value: 112.3,
        unit: 'days'
      }, {
        name: 'Eccentricity',
        value: 0.04,
        unit: ''
      }],
      physical: [{
        name: 'Radius',
        value: 1.3,
        earthValue: 1.0,
        unit: 'Earth radii'
      }, {
        name: 'Mass',
        value: 2.36,
        earthValue: 1.0,
        unit: 'Earth masses'
      }, {
        name: 'Gravity',
        value: 1.3,
        earthValue: 1.0,
        unit: 'g'
      }, {
        name: 'Density',
        value: 5.7,
        earthValue: 5.51,
        unit: 'g/cm³'
      }]
    }
  },
  '2': {
    id: '2',
    name: 'TRAPPIST-1e',
    description: 'TRAPPIST-1e is an exoplanet orbiting the ultra-cool dwarf star TRAPPIST-1. It is the fourth planet in the system and is considered one of the most promising for habitability. The planet is similar in size to Earth and receives about the same amount of light from its star as Earth does from the Sun.',
    image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
    texture: 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004874/earth_day_map_2048.jpg',
    distance: '39 light years',
    size: '0.92x Earth',
    mass: '0.77x Earth',
    temperature: '282K (9°C)',
    habitabilityScore: 78,
    orbitalPeriod: '6.1 days',
    stellarType: 'M-type star',
    discoveryYear: 2017,
    atmosphereComposition: 'Possibly hydrogen, water vapor, and methane',
    waterPresence: 'Possible liquid water',
    surfaceGravity: '0.93g',
    metrics: {
      temperature: [{
        name: 'Day',
        value: 290,
        unit: 'K'
      }, {
        name: 'Night',
        value: 275,
        unit: 'K'
      }, {
        name: 'Average',
        value: 282,
        unit: 'K'
      }],
      orbital: [{
        name: 'Distance',
        value: 0.029,
        unit: 'AU'
      }, {
        name: 'Period',
        value: 6.1,
        unit: 'days'
      }, {
        name: 'Eccentricity',
        value: 0.005,
        unit: ''
      }],
      physical: [{
        name: 'Radius',
        value: 0.92,
        earthValue: 1.0,
        unit: 'Earth radii'
      }, {
        name: 'Mass',
        value: 0.77,
        earthValue: 1.0,
        unit: 'Earth masses'
      }, {
        name: 'Gravity',
        value: 0.93,
        earthValue: 1.0,
        unit: 'g'
      }, {
        name: 'Density',
        value: 5.65,
        earthValue: 5.51,
        unit: 'g/cm³'
      }]
    }
  }
  // Add more planets as needed
};
const PlanetDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const planet = id ? planetData[id as keyof typeof planetData] : null;
  if (!planet) {
    return <div className="w-full bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Planet not found</h2>
          <Link to="/explore" className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-300">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Explore
          </Link>
        </div>
      </div>;
  }
  return <div className="w-full bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/explore" className="inline-flex items-center text-blue-400 hover:text-blue-300">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <div className="h-96">
                <ExoplanetVisualization texturePath={planet.texture} />
              </div>
            </div>
            <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">{planet.name}</h1>
                <div className="flex items-center space-x-1 bg-blue-500 bg-opacity-20 rounded-full px-3 py-1">
                  <div className={`h-2 w-2 rounded-full ${planet.habitabilityScore >= 80 ? 'bg-green-500' : planet.habitabilityScore >= 60 ? 'bg-lime-500' : planet.habitabilityScore >= 40 ? 'bg-yellow-500' : planet.habitabilityScore >= 20 ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium text-white">
                    {planet.habitabilityScore}% Habitable
                  </span>
                </div>
              </div>
              <p className="mt-4 text-gray-300">{planet.description}</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <RulerIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Size</p>
                    <p className="text-white">{planet.size}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ThermometerIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Temperature</p>
                    <p className="text-white">{planet.temperature}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CloudIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Distance</p>
                    <p className="text-white">{planet.distance}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Orbital Period</p>
                    <p className="text-white">{planet.orbitalPeriod}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DropletIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Water Presence</p>
                    <p className="text-white">{planet.waterPresence}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <GlobeIcon className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-400">Surface Gravity</p>
                    <p className="text-white">{planet.surfaceGravity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <PlanetMetrics title="Physical Characteristics" description="Comparison of physical properties with Earth" data={planet.metrics.physical} comparisonMode={true} />
            <PlanetMetrics title="Temperature Profile" description="Temperature variations across the planet" data={planet.metrics.temperature} />
            <PlanetMetrics title="Orbital Parameters" description="Details about the planet's orbit around its star" data={planet.metrics.orbital} />
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-white">
                Atmosphere Composition
              </h3>
              <p className="mt-2 text-gray-300">
                {planet.atmosphereComposition}
              </p>
              <div className="mt-4">
                <Link to={`/compare?planet=${planet.id}`} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Compare with Earth
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default PlanetDetails;