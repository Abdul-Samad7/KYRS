import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Exoplanet } from '../services/api';
import ExoplanetVisualization from '../components/ExoplanetVisualization';
import PlanetMetrics from '../components/PlanetMetrics';
import { generatePlanetVisuals } from '../utils/planetVisuals';
import { 
  ArrowLeftIcon, 
  ThermometerIcon, 
  CloudIcon, 
  RulerIcon, 
  CalendarIcon, 
  GlobeIcon,
  Loader2Icon,
  AlertCircleIcon
} from 'lucide-react';

const PlanetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [planet, setPlanet] = useState<Exoplanet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPlanet(id);
    }
  }, [id]);

  const loadPlanet = async (planetId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getExoplanetById(planetId);
      setPlanet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load planet');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  // Error state
  if (error || !planet) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Planet Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested planet could not be found'}</p>
          <Link
            to="/explorer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  // Extract planet data with correct column names
  const planetName = planet.planet_name || planet.koi_name || 'Unknown Planet';
  const disposition = planet.disposition_using_kepler_data || 'Unknown';
  const temperature = planet.equilibrium_temperature_kelvin;
  const radius = planet.planet_radius_earth_radii;
  const period = planet.orbital_period_days;
  const habitabilityScore = planet.habitability_score || 50;

  // Generate planet visuals based on data
  const planetVisuals = generatePlanetVisuals(temperature, radius, disposition);

  // Prepare metrics data for charts
  const temperatureData = temperature ? [
    { name: 'Planet Temp', value: temperature, unit: 'K' },
    { name: 'Earth Temp', value: 288, unit: 'K' }
  ] : [];

  const physicalData = [
    ...(radius ? [{
      name: 'Radius',
      value: radius,
      earthValue: 1.0,
      unit: 'R⊕'
    }] : []),
    ...(temperature ? [{
      name: 'Temperature',
      value: temperature,
      earthValue: 288,
      unit: 'K'
    }] : [])
  ];

  const orbitalData = period ? [
    { name: 'Orbital Period', value: period, unit: 'days' },
    { name: 'Earth Period', value: 365, unit: 'days' }
  ] : [];

  // Get habitability color
  const getHabitabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/explorer"
        className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Explorer
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - 3D Visualization & Basic Info */}
        <div className="space-y-6">
          {/* 3D Planet Viewer */}
          <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/20 backdrop-blur border border-blue-500/30 rounded-lg overflow-hidden">
            <div className="h-96">
              <ExoplanetVisualization
                planetColor={planetVisuals.color}
                atmosphereColor={planetVisuals.atmosphereColor}
                rotationSpeed={0.002}
                size={Math.min(2 + (radius || 1) * 0.2, 3)}
                emissiveIntensity={planetVisuals.emissiveIntensity}
                roughness={planetVisuals.roughness}
                metalness={planetVisuals.metalness}
              />
            </div>
            <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700">
              <p className="text-sm text-gray-400 text-center">{planetVisuals.description}</p>
            </div>
          </div>

          {/* Basic Info Card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur border border-purple-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {planetName}
              </h1>
              <div className="flex items-center space-x-1 bg-gray-900/80 rounded-full px-3 py-1">
                <div className={`h-2 w-2 rounded-full ${getHabitabilityColor(habitabilityScore)}`}></div>
                <span className="text-sm font-medium text-white">
                  {habitabilityScore}% Habitable
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                disposition === 'CONFIRMED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                disposition === 'CANDIDATE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {disposition}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {radius && (
                <div className="flex items-start gap-2">
                  <RulerIcon className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Radius</p>
                    <p className="text-white font-medium">{radius.toFixed(2)} R⊕</p>
                  </div>
                </div>
              )}

              {temperature && (
                <div className="flex items-start gap-2">
                  <ThermometerIcon className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Temperature</p>
                    <p className="text-white font-medium">{temperature.toFixed(0)} K</p>
                  </div>
                </div>
              )}

              {period && (
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Orbital Period</p>
                    <p className="text-white font-medium">{period.toFixed(1)} days</p>
                  </div>
                </div>
              )}

              {planet.kepler_id && (
                <div className="flex items-start gap-2">
                  <GlobeIcon className="h-5 w-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Kepler ID</p>
                    <p className="text-white font-medium">{planet.kepler_id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Charts & Data */}
        <div className="space-y-6">
          {/* Physical Characteristics */}
          {physicalData.length > 0 && (
            <PlanetMetrics
              title="Physical Characteristics"
              description="Comparison with Earth"
              data={physicalData}
              comparisonMode={true}
            />
          )}

          {/* Temperature Comparison */}
          {temperatureData.length > 0 && (
            <PlanetMetrics
              title="Temperature Comparison"
              description="Equilibrium temperature vs Earth"
              data={temperatureData}
              comparisonMode={false}
            />
          )}

          {/* Orbital Data */}
          {orbitalData.length > 0 && (
            <PlanetMetrics
              title="Orbital Parameters"
              description="Orbital period comparison"
              data={orbitalData}
              comparisonMode={false}
            />
          )}

          {/* Raw Data Card */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur border border-gray-700/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Additional Data</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(planet).slice(0, 10).map(([key, value]) => (
                value !== null && value !== undefined && (
                  <div key={key} className="flex justify-between border-b border-gray-800 pb-1">
                    <span className="text-gray-400">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-white font-mono text-xs">
                      {typeof value === 'number' ? value.toFixed(3) : String(value)}
                    </span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetDetails;