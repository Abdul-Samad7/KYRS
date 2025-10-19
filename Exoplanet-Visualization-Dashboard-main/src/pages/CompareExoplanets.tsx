import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ExoplanetVisualization from '../components/ExoplanetVisualization';
import ComparisonChart from '../components/ComparisonChart';
import PlanetMetrics from '../components/PlanetMetrics';
import { ArrowLeftIcon, ThermometerIcon, CloudIcon, RulerIcon, CalendarIcon } from 'lucide-react';
// Mock planet data - same as in PlanetDetails.tsx
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
    },
    habitabilityMetrics: [{
      attribute: 'Temperature',
      exoplanet: 85,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Size',
      exoplanet: 90,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Gravity',
      exoplanet: 80,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Water',
      exoplanet: 75,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Atmosphere',
      exoplanet: 70,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Radiation',
      exoplanet: 60,
      earth: 100,
      fullMark: 100
    }]
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
    },
    habitabilityMetrics: [{
      attribute: 'Temperature',
      exoplanet: 90,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Size',
      exoplanet: 95,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Gravity',
      exoplanet: 95,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Water',
      exoplanet: 65,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Atmosphere',
      exoplanet: 60,
      earth: 100,
      fullMark: 100
    }, {
      attribute: 'Radiation',
      exoplanet: 50,
      earth: 100,
      fullMark: 100
    }]
  }
  // Add more planets as needed
};
const earthTexture = 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004874/earth_day_map_2048.jpg';
const CompareExoplanets = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const planetId = queryParams.get('planet');
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(planetId);
  const planet = selectedPlanet ? planetData[selectedPlanet as keyof typeof planetData] : null;
  return <div className="w-full bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/explore" className="inline-flex items-center text-blue-400 hover:text-blue-300">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white">
          Compare with Earth
        </h1>
        {!planet ? <div className="mt-6">
            <p className="text-gray-300">
              Select a planet to compare with Earth:
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(planetData).map(p => <div key={p.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-blue-500" onClick={() => setSelectedPlanet(p.id)}>
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                  <p className="mt-2 text-gray-300">
                    Habitability Score: {p.habitabilityScore}%
                  </p>
                </div>)}
            </div>
          </div> : <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {planet.name}
                </h2>
                <div className="h-64">
                  <ExoplanetVisualization texturePath={planet.texture} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
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
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Earth</h2>
                <div className="h-64">
                  <ExoplanetVisualization texturePath={earthTexture} atmosphereColor="#4299e1" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <RulerIcon className="h-5 w-5 mr-2 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Size</p>
                      <p className="text-white">1.0 Earth radius</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <ThermometerIcon className="h-5 w-5 mr-2 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400">Temperature</p>
                      <p className="text-white">288K (15°C)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ComparisonChart planetName={planet.name} data={planet.habitabilityMetrics} />
              <div className="space-y-8">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white">
                    Habitability Assessment
                  </h3>
                  <div className="mt-4 flex items-center">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div className={`h-4 rounded-full ${planet.habitabilityScore >= 80 ? 'bg-green-500' : planet.habitabilityScore >= 60 ? 'bg-lime-500' : planet.habitabilityScore >= 40 ? 'bg-yellow-500' : planet.habitabilityScore >= 20 ? 'bg-orange-500' : 'bg-red-500'}`} style={{
                    width: `${planet.habitabilityScore}%`
                  }}></div>
                    </div>
                    <span className="ml-2 text-white font-medium">
                      {planet.habitabilityScore}%
                    </span>
                  </div>
                  <p className="mt-4 text-gray-300">
                    {planet.habitabilityScore >= 80 ? `${planet.name} has excellent potential for habitability with Earth-like conditions.` : planet.habitabilityScore >= 60 ? `${planet.name} has good potential for habitability with some differences from Earth.` : planet.habitabilityScore >= 40 ? `${planet.name} has moderate potential for habitability with significant differences from Earth.` : planet.habitabilityScore >= 20 ? `${planet.name} has low potential for habitability with major differences from Earth.` : `${planet.name} is unlikely to be habitable with conditions very different from Earth.`}
                  </p>
                </div>
                <button onClick={() => setSelectedPlanet(null)} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                  Compare with Another Planet
                </button>
              </div>
            </div>
            <div className="mt-8">
              <PlanetMetrics title="Physical Characteristics Comparison" description={`Comparing ${planet.name} with Earth`} data={planet.metrics.physical} comparisonMode={true} />
            </div>
          </div>}
      </div>
    </div>;
};
export default CompareExoplanets;