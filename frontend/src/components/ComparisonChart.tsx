import React from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

const ComparisonChart: React.FC<ComparisonChartProps> = ({ planetName, data }) => {
  // 🧭 Format labels with units
  const formatLabel = (s: string) => {
    const lower = s.toLowerCase();
    if (lower.includes("radius")) return "Radius (R⊕)";
    if (lower.includes("temp")) return "Temperature (K)";
    if (lower.includes("period")) return "Orbital Period (days)";
    if (lower.includes("flux")) return "Insolation (×Earth)";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // 🧮 Normalize values to percentage of fullMark
  const normalizedData = data.map((d) => ({
    attribute: formatLabel(d.attribute),
    exoplanet: Math.min((d.exoplanet / d.fullMark) * 100, 100),
    earth: Math.min((d.earth / d.fullMark) * 100, 100),
  }));

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-1">Habitability Comparison</h3>
      <p className="text-sm text-gray-400 mb-4">
        Comparison of <b>{planetName}</b> and Earth across physical & orbital parameters
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedData}>
            {/* Subtle gridlines */}
            <PolarGrid stroke="#1F2937" radialLines={false} gridType="circle" />

            {/* Clean axis labels only — no numeric ticks */}
            <PolarAngleAxis
              dataKey="attribute"
              tick={{ fill: "#E5E7EB", fontSize: 12 }}
              tickLine={false}
            />

            {/* Hide radius ticks completely for a cleaner look */}
            {/* Recharts renders better spacing without PolarRadiusAxis */}

            {/* 🟦 Exoplanet layer */}
            <Radar
              name={planetName}
              dataKey="exoplanet"
              stroke="#3B82F6"
              fill="url(#exoplanetGradient)"
              fillOpacity={0.4}
              dot={true}
            />

            {/* 🟩 Earth layer */}
            <Radar
              name="Earth"
              dataKey="earth"
              stroke="#10B981"
              fill="url(#earthGradient)"
              fillOpacity={0.35}
              dot={true}
            />

            <defs>
              <radialGradient id="exoplanetGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.1} />
              </radialGradient>
              <radialGradient id="earthGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#059669" stopOpacity={0.1} />
              </radialGradient>
            </defs>

            {/* Minimalist tooltip */}
            <Tooltip
              cursor={{ stroke: "#6B7280", strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "6px",
                color: "#E5E7EB",
                fontSize: "13px",
              }}
              formatter={(value: number, key: string, entry) =>
                [`${value.toFixed(1)}%`, key === "exoplanet" ? planetName : "Earth"]
              }
            />

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ paddingTop: 8, fontSize: 13, color: "#E5E7EB" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChart;
