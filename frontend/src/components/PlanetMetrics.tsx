import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
interface MetricData {
  name: string;
  value: number;
  earthValue?: number;
  unit: string;
}
interface PlanetMetricsProps {
  title: string;
  description: string;
  data: MetricData[];
  comparisonMode?: boolean;
  showUnits?: boolean;
}
const PlanetMetrics: React.FC<PlanetMetricsProps> = ({
  title,
  description,
  data,
  comparisonMode = false,
  showUnits = true
}) => {
  // detect a common unit across all data points (if any)
  const units = data.map(d => d.unit).filter(Boolean);
  const commonUnit = units.length > 0 && new Set(units).size === 1 ? units[0] : undefined;
  // X-axis tickFormatter: if the tick matches a metric name, append its unit
  const xTickFormatter = (tick: any) => {
    if (!showUnits) return String(tick);
    const m = data.find(d => d.name === tick);
    if (m && m.unit) return `${tick} (${m.unit})`;
    return String(tick);
  };
  const formatTooltip = (value: number, name: string) => {
    const metric = data.find(d => {
      if (name === 'value') return d.value === value;
      if (name === 'earthValue') return d.earthValue === value;
      return false;
    });
    return [`${value} ${metric?.unit || ''}`, name === 'value' ? 'Exoplanet' : 'Earth'];
  };
  return <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-1 text-gray-300 text-sm">{description}{commonUnit ? ` • ${commonUnit}` : ''}</p>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          {comparisonMode ? <BarChart data={data} margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 30
        }} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{
            fill: '#9CA3AF',
            fontSize: 12
          }} tickFormatter={xTickFormatter} />
              <YAxis tick={{
            fill: '#9CA3AF'
          }} tickFormatter={(val: number) => (showUnits && commonUnit) ? `${val} ${commonUnit}` : String(val)} />
              <Tooltip formatter={formatTooltip} contentStyle={{
            backgroundColor: '#1F2937',
            borderColor: '#4B5563'
          }} />
              <Legend />
              <Bar dataKey="value" name="Exoplanet" fill="#3B82F6" />
              <Bar dataKey="earthValue" name="Earth" fill="#10B981" />
            </BarChart> : <LineChart data={data} margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 30
        }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} tick={{
            fill: '#9CA3AF',
            fontSize: 12
          }} tickFormatter={xTickFormatter} />
              <YAxis tick={{
            fill: '#9CA3AF'
          }} tickFormatter={(val: number) => (showUnits && commonUnit) ? `${val} ${commonUnit}` : String(val)} />
              <Tooltip formatter={formatTooltip} contentStyle={{
            backgroundColor: '#1F2937',
            borderColor: '#4B5563'
          }} />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{
            r: 4
          }} activeDot={{
            r: 6
          }} />
            </LineChart>}
        </ResponsiveContainer>
      </div>
    </div>;
};
export default PlanetMetrics;