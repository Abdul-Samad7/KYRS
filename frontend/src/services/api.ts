// Enhanced API service for ExoExplorer backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Exoplanet {
  kepler_id?: number;
  koi_name?: string;
  planet_name?: string;
  disposition_using_kepler_data?: string;
  disposition_pipeline?: string;
  equilibrium_temperature_kelvin?: number;
  planet_radius_earth_radii?: number;
  orbital_period_days?: number;
  insolation_flux_earth_flux?: number;
  planet_score?: number;
  habitability_score?: number;
  [key: string]: any;
}

interface FilterOptions {
  limit?: number;
  offset?: number;
  disposition?: string;
  min_temp?: number;
  max_temp?: number;
  min_radius?: number;
  max_radius?: number;
  min_period?: number;
  max_period?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface ExoplanetsResponse {
  total: number;
  offset: number;
  limit: number;
  filters_applied: any;
  data: Exoplanet[];
}

interface SearchResponse {
  query: string;
  total: number;
  data: Exoplanet[];
}

interface AskResponse {
  question: string;
  answer: string;
  records_analyzed: number;
  total_records: number;
}

interface CompareResponse {
  planets: Exoplanet[];
  count: number;
  comparison: Record<string, {
    min: number;
    max: number;
    avg: number;
    values: number[];
  }>;
}

interface StatsResponse {
  total_records: number;
  total_columns: number;
  columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  disposition_counts?: Record<string, number>;
  numeric_stats?: Record<string, {
    column: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  }>;
  data_quality?: Record<string, any>;
}

interface DistributionResponse {
  column: string;
  type: 'numeric' | 'categorical';
  histogram?: {
    counts: number[];
    bin_edges: number[];
  };
  value_counts?: Record<string, number>;
  stats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  unique_count?: number;
}

class ExoplanetAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ 
      status: string; 
      data_loaded: boolean; 
      total_records: number;
      columns: string[];
    }>('/health');
  }

  // Get exoplanets with advanced filtering
  async getExoplanets(filters?: FilterOptions): Promise<ExoplanetsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const endpoint = `/exoplanets${params.toString() ? `?${params}` : ''}`;
    return this.request<ExoplanetsResponse>(endpoint);
  }

  // Get specific exoplanet with calculated fields
  async getExoplanetById(id: string | number): Promise<Exoplanet> {
    return this.request<Exoplanet>(`/exoplanets/${id}`);
  }

  // Search exoplanets by name/ID
  async searchExoplanets(query: string): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query });
    return this.request<SearchResponse>(`/search?${params}`);
  }

  // Ask Gemini AI a question
  async askQuestion(
    question: string, 
    style: 'brief' | 'detailed' = 'brief'
  ): Promise<AskResponse> {
    return this.request<AskResponse>('/ask', {
      method: 'POST',
      body: JSON.stringify({ question, style }),
    });
  }

  // Compare multiple planets
  async comparePlanets(planetIds: (string | number)[]): Promise<CompareResponse> {
    return this.request<CompareResponse>('/compare', {
      method: 'POST',
      body: JSON.stringify({ planet_ids: planetIds }),
    });
  }

  // Get comprehensive dataset statistics
  async getStatistics(): Promise<StatsResponse> {
    return this.request<StatsResponse>('/stats');
  }

  // Get distribution data for a column
  async getDistribution(column: string, bins: number = 20): Promise<DistributionResponse> {
    const params = new URLSearchParams({ column, bins: String(bins) });
    return this.request<DistributionResponse>(`/explore/distributions?${params}`);
  }

  // Helper: Get confirmed planets only
  async getConfirmedPlanets(limit: number = 50): Promise<ExoplanetsResponse> {
    return this.getExoplanets({ 
      disposition: 'CONFIRMED',
      limit 
    });
  }

  // Helper: Get habitable zone candidates (Earth-like)
  async getHabitableZonePlanets(): Promise<ExoplanetsResponse> {
    return this.getExoplanets({
      min_temp: 250,
      max_temp: 350,
      min_radius: 0.8,
      max_radius: 1.5,
      disposition: 'CONFIRMED',
      limit: 100
    });
  }

  // Helper: Get hottest planets
  async getHottestPlanets(limit: number = 10): Promise<ExoplanetsResponse> {
    return this.getExoplanets({
      sort_by: 'koi_teq',
      sort_order: 'desc',
      limit
    });
  }
}

// Export singleton instance
export const api = new ExoplanetAPI();

// Export types
export type {
  Exoplanet,
  FilterOptions,
  ExoplanetsResponse,
  SearchResponse,
  AskResponse,
  CompareResponse,
  StatsResponse,
  DistributionResponse,
};