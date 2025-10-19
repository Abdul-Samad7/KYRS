import React, { useState } from 'react';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { FilterOptions } from '../services/api';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    min_temp: undefined,
    max_temp: undefined,
    min_radius: undefined,
    max_radius: undefined,
    disposition: undefined,
  });

  // Local UI state for sliders
  const [tempRange, setTempRange] = useState<[number, number]>([0, 5000]);
  const [radiusRange, setRadiusRange] = useState<[number, number]>([0, 25]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleTempRangeChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...tempRange];
    newRange[index] = value;
    setTempRange(newRange);

    const newFilters = {
      ...filters,
      min_temp: newRange[0] > 0 ? newRange[0] : undefined,
      max_temp: newRange[1] < 5000 ? newRange[1] : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRadiusRangeChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...radiusRange];
    newRange[index] = value;
    setRadiusRange(newRange);

    const newFilters = {
      ...filters,
      min_radius: newRange[0] > 0 ? newRange[0] : undefined,
      max_radius: newRange[1] < 25 ? newRange[1] : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDispositionChange = (disposition: string) => {
    const newFilters = {
      ...filters,
      disposition: disposition || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      min_temp: undefined,
      max_temp: undefined,
      min_radius: undefined,
      max_radius: undefined,
      disposition: undefined,
    };
    setFilters(defaultFilters);
    setTempRange([0, 5000]);
    setRadiusRange([0, 25]);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Search by name or ID (e.g., Kepler-22, K00752)..."
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <FilterIcon className="h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
        </button>
        {showFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-6 pt-4 border-t border-gray-700">
          {/* Temperature Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Temperature Range: {tempRange[0]} - {tempRange[1]} K
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-12">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={tempRange[0]}
                  onChange={(e) => handleTempRangeChange(0, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs text-gray-400 w-16">{tempRange[0]} K</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-12">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={tempRange[1]}
                  onChange={(e) => handleTempRangeChange(1, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs text-gray-400 w-16">{tempRange[1]} K</span>
              </div>
            </div>
          </div>

          {/* Radius Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Planet Radius: {radiusRange[0].toFixed(1)} - {radiusRange[1].toFixed(1)} R⊕
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-12">Min:</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={radiusRange[0]}
                  onChange={(e) => handleRadiusRangeChange(0, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-xs text-gray-400 w-16">{radiusRange[0].toFixed(1)} R⊕</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-12">Max:</span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={radiusRange[1]}
                  onChange={(e) => handleRadiusRangeChange(1, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="text-xs text-gray-400 w-16">{radiusRange[1].toFixed(1)} R⊕</span>
              </div>
            </div>
          </div>

          {/* Disposition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Planet Status
            </label>
            <select
              value={filters.disposition || ''}
              onChange={(e) => handleDispositionChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANDIDATE">Candidate</option>
              <option value="FALSE">False Positive</option>
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setTempRange([250, 350]);
                  setRadiusRange([0.8, 1.5]);
                  const habitableFilters = {
                    min_temp: 250,
                    max_temp: 350,
                    min_radius: 0.8,
                    max_radius: 1.5,
                    disposition: 'CONFIRMED',
                  };
                  setFilters(habitableFilters);
                  onFilterChange(habitableFilters);
                }}
                className="px-3 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-500/30 text-green-400 rounded text-sm transition-colors"
              >
                🌍 Habitable Zone
              </button>
              <button
                onClick={() => {
                  setTempRange([1000, 5000]);
                  const hotFilters = { ...filters, min_temp: 1000, max_temp: 5000 };
                  setFilters(hotFilters);
                  onFilterChange(hotFilters);
                }}
                className="px-3 py-2 bg-orange-900/30 hover:bg-orange-900/50 border border-orange-500/30 text-orange-400 rounded text-sm transition-colors"
              >
                🔥 Hot Jupiters
              </button>
              <button
                onClick={() => {
                  setRadiusRange([0.5, 2]);
                  const earthFilters = { ...filters, min_radius: 0.5, max_radius: 2 };
                  setFilters(earthFilters);
                  onFilterChange(earthFilters);
                }}
                className="px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 text-blue-400 rounded text-sm transition-colors"
              >
                🪐 Earth-sized
              </button>
              <button
                onClick={() => {
                  const confirmedFilters = { ...filters, disposition: 'CONFIRMED' };
                  setFilters(confirmedFilters);
                  onFilterChange(confirmedFilters);
                }}
                className="px-3 py-2 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 text-purple-400 rounded text-sm transition-colors"
              >
                ✓ Confirmed Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;