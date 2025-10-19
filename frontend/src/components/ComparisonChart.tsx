import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
interface ComparisonMetric {
  attribute: string;
  exoplanet: number;
  earth: number;
  fullMark: number;
}
interface ComparisonChartProps {
  planetName: string;
  data: ComparisonMetric[];
}
const ComparisonChart: React.FC<ComparisonChartProps> = ({
  planetName,
  data
}) => {
  return <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">
        Habitability Comparison
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#4B5563" />
            <PolarAngleAxis dataKey="attribute" tick={{
            fill: '#9CA3AF'
          }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{
            fill: '#9CA3AF'
          }} />
            <Radar name={planetName} dataKey="exoplanet" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            <Radar name="Earth" dataKey="earth" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>;
};
export default ComparisonChart;