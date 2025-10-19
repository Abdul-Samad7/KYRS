import React from 'react';
import { Link } from 'react-router-dom';
import { ThermometerIcon, RulerIcon, ClockIcon, SparklesIcon } from 'lucide-react';

export interface ExoplanetCardProps {
  id: string;
  name: string;
  image?: string;
  distance?: string;
  size: string;
  temperature: string;
  habitabilityScore: number;
  period?: string;
  disposition?: string;
}

const ExoplanetCard: React.FC<ExoplanetCardProps> = ({
  id,
  name,
  size,
  temperature,
  habitabilityScore,
  period,
  disposition
}) => {
  // Calculate habitability color
  const getHabitabilityColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500', border: 'border-green-500/30', glow: 'shadow-green-500/20' };
    if (score >= 60) return { bg: 'bg-lime-500', border: 'border-lime-500/30', glow: 'shadow-lime-500/20' };
    if (score >= 40) return { bg: 'bg-yellow-500', border: 'border-yellow-500/30', glow: 'shadow-yellow-500/20' };
    if (score >= 20) return { bg: 'bg-orange-500', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' };
    return { bg: 'bg-red-500', border: 'border-red-500/30', glow: 'shadow-red-500/20' };
  };

  const colors = getHabitabilityColor(habitabilityScore);

  // Get disposition badge color
  const getDispositionColor = (disp?: string) => {
    if (!disp) return 'bg-gray-700 text-gray-400';
    if (disp.includes('CONFIRMED')) return 'bg-green-900/30 text-green-400 border border-green-500/30';
    if (disp.includes('CANDIDATE')) return 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30';
    return 'bg-red-900/30 text-red-400 border border-red-500/30';
  };

  return (
    <Link to={`/planet/${id}`} className="group block">
      <div className={`relative bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur border ${colors.border} rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:${colors.glow} hover:shadow-xl`}>
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Content */}
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {name}
              </h3>
              {disposition && (
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${getDispositionColor(disposition)}`}>
                  {disposition}
                </span>
              )}
            </div>
            
            {/* Habitability Score - Prominent */}
            <div className="flex flex-col items-center">
              <div className={`relative w-16 h-16 rounded-full border-4 ${colors.border} ${colors.bg} flex items-center justify-center ${colors.glow} shadow-lg`}>
                <span className="text-white font-bold text-lg">{habitabilityScore}</span>
              </div>
              <span className="text-xs text-gray-400 mt-1">Habitable</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-3 p-2 rounded bg-gray-800/50">
              <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <ThermometerIcon className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="text-sm font-semibold text-white truncate">{temperature}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 rounded bg-gray-800/50">
              <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <RulerIcon className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Radius</p>
                <p className="text-sm font-semibold text-white truncate">{size}</p>
              </div>
            </div>

            {period && (
              <div className="flex items-center gap-3 p-2 rounded bg-gray-800/50">
                <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Orbital Period</p>
                  <p className="text-sm font-semibold text-white truncate">{period}</p>
                </div>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="mt-6 flex items-center justify-between text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
            <span className="flex items-center gap-1">
              <SparklesIcon className="h-4 w-4" />
              View Analysis
            </span>
            <span className="transform group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ExoplanetCard;