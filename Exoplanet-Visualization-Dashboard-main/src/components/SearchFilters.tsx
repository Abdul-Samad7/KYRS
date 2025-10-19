import React, { useState } from 'react';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
}
export interface FilterOptions {
  habitabilityMin: number;
  distanceMax: number;
  sizeRange: [number, number];
  hasAtmosphere: boolean | null;
  hasWater: boolean | null;
}
const SearchFilters: React.FC<SearchFiltersProps> = ({
  onSearch,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    habitabilityMin: 0,
    distanceMax: 100,
    sizeRange: [0.1, 10],
    hasAtmosphere: null,
    hasWater: null
  });
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  const resetFilters = () => {
    const defaultFilters = {
      habitabilityMin: 0,
      distanceMax: 100,
      sizeRange: [0.1, 10],
      hasAtmosphere: null,
      hasWater: null
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  return <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input type="text" value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Search exoplanets..." />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center text-sm text-gray-300 hover:text-white">
            <FilterIcon className="h-4 w-4 mr-1" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          {showFilters && <button type="button" onClick={resetFilters} className="text-sm text-blue-400 hover:text-blue-300">
              Reset Filters
            </button>}
        </div>
      </form>
      {showFilters && <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Minimum Habitability Score: {filters.habitabilityMin}%
            </label>
            <input type="range" min="0" max="100" value={filters.habitabilityMin} onChange={e => handleFilterChange('habitabilityMin', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Max Distance (light years): {filters.distanceMax}
            </label>
            <input type="range" min="1" max="500" value={filters.distanceMax} onChange={e => handleFilterChange('distanceMax', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Has Atmosphere
              </label>
              <select value={filters.hasAtmosphere === null ? '' : filters.hasAtmosphere.toString()} onChange={e => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleFilterChange('hasAtmosphere', value);
          }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Has Water
              </label>
              <select value={filters.hasWater === null ? '' : filters.hasWater.toString()} onChange={e => {
            const value = e.target.value === '' ? null : e.target.value === 'true';
            handleFilterChange('hasWater', value);
          }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                <option value="">Any</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>}
    </div>;
};
export default SearchFilters;