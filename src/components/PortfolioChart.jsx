import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO } from 'date-fns';

const DURATION_PRESETS = ['1M', '3M', '6M', '1Y', '3Y', '5Y', 'Max'];

const PortfolioChart = ({ data, duration, onDurationChange }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col h-[300px] sm:h-[360px] lg:h-[460px] mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-gray-800">Portfolio Performance</h3>
        <div className="flex items-center gap-1 flex-wrap">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onDurationChange(preset)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-colors ${
                duration === preset
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(parseISO(str), 'MMM yyyy')}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(val) => `$${val / 1000}k`}
            stroke="#9CA3AF"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
            labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="value" 
            name="Portfolio Value" 
            stroke="#3B82F6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
          <Area 
            type="monotone" 
            dataKey="invested" 
            name="Total Invested" 
            stroke="#9CA3AF" 
            strokeDasharray="5 5" 
            fill="none"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PortfolioChart;
