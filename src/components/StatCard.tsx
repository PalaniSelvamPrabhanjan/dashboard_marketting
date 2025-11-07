import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  growth: number;
  icon: React.ReactNode;
  chartData: number[];
  color: string;
}

export function StatCard({ title, value, growth, icon, chartData, color }: StatCardProps) {
  const isPositive = growth >= 0;
  const formattedValue = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toString();
  const formattedGrowth = `${(growth * 100).toFixed(1)}%`;

  const data = chartData.map((val, idx) => ({ value: val, index: idx }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{formattedValue}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {isPositive ? (
          <TrendingUp size={16} className="text-green-500" />
        ) : (
          <TrendingDown size={16} className="text-red-500" />
        )}
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {formattedGrowth}
        </span>
        <span className="text-gray-400 text-sm">vs last week</span>
      </div>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
