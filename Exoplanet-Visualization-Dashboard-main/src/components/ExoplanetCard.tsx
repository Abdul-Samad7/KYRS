import React from 'react';
import { Link } from 'react-router-dom';
import { ThermometerIcon, CloudIcon, RulerIcon } from 'lucide-react';
export interface ExoplanetCardProps {
  id: string;
  name: string;
  image: string;
  distance: string;
  size: string;
  temperature: string;
  habitabilityScore: number;
}
const ExoplanetCard: React.FC<ExoplanetCardProps> = ({
  id,
  name,
  image,
  distance,
  size,
  temperature,
  habitabilityScore
}) => {
  // Calculate habitability color
  const getHabitabilityColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-lime-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  return <Link to={`/planet/${id}`} className="group">
      <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50">
        <div className="relative h-48 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-gray-900/80 rounded-full px-2 py-1">
            <div className={`h-2 w-2 rounded-full ${getHabitabilityColor(habitabilityScore)}`}></div>
            <span className="text-xs font-medium text-white">
              {habitabilityScore}% Habitable
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-white group-hover:text-blue-400">
            {name}
          </h3>
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-gray-300">
              <RulerIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">Size: {size}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <ThermometerIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">Temp: {temperature}</span>
            </div>
            <div className="flex items-center text-gray-300">
              <CloudIcon className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">Distance: {distance}</span>
            </div>
          </div>
          <div className="mt-4 text-blue-400 text-sm font-medium flex justify-end">
            View details →
          </div>
        </div>
      </div>
    </Link>;
};
export default ExoplanetCard;