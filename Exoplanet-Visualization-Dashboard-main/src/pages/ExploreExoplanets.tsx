import React, { useEffect, useState } from 'react';
import ExoplanetCard, { ExoplanetCardProps } from '../components/ExoplanetCard';
import SearchFilters, { FilterOptions } from '../components/SearchFilters';
import { GlobeIcon } from 'lucide-react';
// Mock data for exoplanets
const mockExoplanets: ExoplanetCardProps[] = [{
  id: '1',
  name: 'Kepler-442b',
  image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '1,206 light years',
  size: '1.3x Earth',
  temperature: '295K (22°C)',
  habitabilityScore: 85
}, {
  id: '2',
  name: 'TRAPPIST-1e',
  image: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '39 light years',
  size: '0.92x Earth',
  temperature: '282K (9°C)',
  habitabilityScore: 78
}, {
  id: '3',
  name: 'Proxima Centauri b',
  image: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '4.2 light years',
  size: '1.07x Earth',
  temperature: '234K (-39°C)',
  habitabilityScore: 62
}, {
  id: '4',
  name: 'TOI-700 d',
  image: 'https://images.unsplash.com/photo-1614732484003-ef9881555dc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '101 light years',
  size: '1.19x Earth',
  temperature: '268K (-5°C)',
  habitabilityScore: 71
}, {
  id: '5',
  name: 'K2-18b',
  image: 'https://images.unsplash.com/photo-1614314107768-6018061b5b72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '124 light years',
  size: '2.6x Earth',
  temperature: '265K (-8°C)',
  habitabilityScore: 58
}, {
  id: '6',
  name: 'Teegarden b',
  image: 'https://images.unsplash.com/photo-1614724723656-457e78e0b8a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
  distance: '12.5 light years',
  size: '1.05x Earth',
  temperature: '298K (25°C)',
  habitabilityScore: 81
}];
const ExploreExoplanets = () => {
  const [exoplanets, setExoplanets] = useState<ExoplanetCardProps[]>(mockExoplanets);
  const [filteredExoplanets, setFilteredExoplanets] = useState<ExoplanetCardProps[]>(mockExoplanets);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    habitabilityMin: 0,
    distanceMax: 100,
    sizeRange: [0.1, 10],
    hasAtmosphere: null,
    hasWater: null
  });
  useEffect(() => {
    // In a real app, this would be an API call to fetch exoplanets data
    // For now, we'll use our mock data
    setExoplanets(mockExoplanets);
  }, []);
  useEffect(() => {
    // Apply filters and search
    let filtered = exoplanets;
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(planet => planet.name.toLowerCase().includes(query));
    }
    // Apply filters
    filtered = filtered.filter(planet => {
      // Filter by habitability score
      if (planet.habitabilityScore < activeFilters.habitabilityMin) {
        return false;
      }
      // In a real app, we would filter by other criteria as well
      // For the mock data, we'll just use the habitability filter
      return true;
    });
    setFilteredExoplanets(filtered);
  }, [exoplanets, searchQuery, activeFilters]);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
  };
  return <div className="w-full bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Explore Potentially Habitable</span>
            <span className="block text-blue-400">Exoplanets</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg">
            Discover exoplanets that could potentially support life based on
            various habitability factors.
          </p>
        </div>
        <div className="mb-8">
          <SearchFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
        </div>
        {filteredExoplanets.length > 0 ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExoplanets.map(planet => <ExoplanetCard key={planet.id} {...planet} />)}
          </div> : <div className="text-center py-12">
            <GlobeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-xl font-medium text-white">
              No exoplanets found
            </h3>
            <p className="mt-1 text-gray-300">
              Try adjusting your search or filters.
            </p>
          </div>}
      </div>
    </div>;
};
export default ExploreExoplanets;