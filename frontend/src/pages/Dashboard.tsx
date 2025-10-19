import React, { useEffect, useState } from 'react';
import { api, StatsResponse } from '../services/api';
import { DatabaseIcon, CheckCircleIcon, AlertCircleIcon, TrendingUpIcon } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Research Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Overview of exoplanet dataset and analysis capabilities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-900/80 to-blue-900/20 backdrop-blur border border-blue-500/30 rounded-lg p-6 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <DatabaseIcon className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Total Records</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {stats?.total_records.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-green-900/20 backdrop-blur border border-green-500/30 rounded-lg p-6 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Confirmed</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {stats?.disposition_counts?.CONFIRMED?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-yellow-900/20 backdrop-blur border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircleIcon className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Candidates</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            {stats?.disposition_counts?.CANDIDATE?.toLocaleString() || '0'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur border border-purple-500/30 rounded-lg p-6 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUpIcon className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Columns</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {stats?.total_columns}
          </p>
        </div>
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Stats */}
        {stats?.numeric_stats?.temperature && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Temperature Distribution
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.temperature.min.toFixed(1)} K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Maximum</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.temperature.max.toFixed(1)} K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mean</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.temperature.mean.toFixed(1)} K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Median</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.temperature.median.toFixed(1)} K
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Radius Stats */}
        {stats?.numeric_stats?.radius && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Radius Distribution
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.radius.min.toFixed(2)} R⊕
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Maximum</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.radius.max.toFixed(2)} R⊕
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mean</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.radius.mean.toFixed(2)} R⊕
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Median</span>
                <span className="text-white font-mono">
                  {stats.numeric_stats.radius.median.toFixed(2)} R⊕
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/explorer"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <h4 className="font-medium text-white mb-1">Explore Data</h4>
            <p className="text-sm text-gray-400">
              Filter and visualize the exoplanet dataset
            </p>
          </a>
          <a
            href="/ask"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <h4 className="font-medium text-white mb-1">Ask Questions</h4>
            <p className="text-sm text-gray-400">
              Use AI to analyze and query your data
            </p>
          </a>
          <a
            href="/upload"
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <h4 className="font-medium text-white mb-1">Upload Dataset</h4>
            <p className="text-sm text-gray-400">
              Analyze your own exoplanet data
            </p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;