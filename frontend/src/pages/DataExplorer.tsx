import React, { useState, useEffect } from 'react';
import { api, FilterOptions, Exoplanet } from '../services/api';
import ExoplanetCard, { ExoplanetCardProps } from '../components/ExoplanetCard';
import SearchFilters from '../components/SearchFilters';
import { Loader2Icon } from 'lucide-react';

const DataExplorer: React.FC = () => {
  const [planets, setPlanets] = useState<Exoplanet[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    loadPlanets();
  }, [filters]);

  const loadPlanets = async () => {
    try {
      setLoading(true);
      const response = await api.getExoplanets(filters);
      setPlanets(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load planets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadPlanets();
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.searchExoplanets(query);
      setPlanets(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    // Map your SearchFilters component output to API filters
    setFilters(prev => ({
      ...prev,
      min_temp: newFilters.habitabilityMin ? 250 : undefined,
      max_temp: newFilters.habitabilityMin ? 350 : undefined,
      disposition: newFilters.hasAtmosphere === true ? 'CONFIRMED' : undefined,
      offset: 0, // Reset pagination on filter change
    }));
  };

  // Convert API data to ExoplanetCard props
  const convertToCardProps = (planet: Exoplanet): ExoplanetCardProps => {
    // Use actual column names from your API
    const name = planet.planet_name || planet.koi_name || 'Unknown Planet';
    const id = planet.kepler_id?.toString() || planet.koi_name || '';
    
    // Get values from actual column names
    const temperature = planet.equilibrium_temperature_kelvin;
    const radius = planet.planet_radius_earth_radii;
    const period = planet.orbital_period_days;
    const disposition = planet.disposition_using_kepler_data;
    
    // Calculate habitability score (simple version)
    let habitabilityScore = 50;
    if (temperature && radius) {
      const tempScore = 100 - Math.min(Math.abs(temperature - 300) / 3, 100);
      const radiusScore = 100 - Math.min(Math.abs(radius - 1.0) * 50, 100);
      habitabilityScore = (tempScore + radiusScore) / 2;
    }

    return {
      id,
      name,
      size: radius ? `${radius.toFixed(2)} R⊕` : 'N/A',
      temperature: temperature ? `${temperature.toFixed(0)} K` : 'N/A',
      period: period ? `${period.toFixed(1)} days` : undefined,
      disposition: disposition,
      habitabilityScore: Math.round(habitabilityScore),
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Data Explorer</h1>
        <p className="mt-2 text-gray-400">
          Filter and explore {total.toLocaleString()} exoplanets
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-900/80 backdrop-blur border border-blue-500/20 rounded-lg p-6">
        <SearchFilters onSearch={handleSearch} onFilterChange={handleFilterChange} />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400">
          Showing {planets.length} of {total.toLocaleString()} results
        </p>
        
        {/* Simple pagination controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50)) }))}
            disabled={!filters.offset || filters.offset === 0}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 50) }))}
            disabled={!planets.length || (filters.offset || 0) + planets.length >= total}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 text-white rounded transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2Icon className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : (
        /* Planet Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planets.map((planet) => {
            const cardProps = convertToCardProps(planet);
            return <ExoplanetCard key={cardProps.id} {...cardProps} />;
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && planets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500">No planets found matching your filters</p>
        </div>
      )}
    </div>
  );
};

export default DataExplorer;