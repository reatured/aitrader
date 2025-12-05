import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';

const StockCard = ({ stock, onClose }) => {
  if (!stock) return null;

  const isPositive = stock.totalReturn >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const strokeColor = isPositive ? '#16a34a' : '#dc2626'; // green-600 : red-600
  const fillColor = isPositive ? '#dcfce7' : '#fee2e2'; // green-100 : red-100

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 relative animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-gray-900">{stock.symbol}</h2>
            <span className={`flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <ColorIcon size={14} className="mr-1" />
              {stock.totalReturn >= 0 ? '+' : ''}{stock.totalReturn.toFixed(2)}%
            </span>
          </div>
          <p className="text-gray-500">Individual Stock Performance</p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <div className="text-3xl font-bold text-gray-900">
            ${stock.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-500">Current Value</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <DollarSign size={16} className="mr-1" />
            <span className="text-sm font-medium">Total Invested</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            ${stock.totalInvested.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Shares</div>
          <div className="text-lg font-bold text-gray-900">
            {stock.totalShares.toFixed(4)}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500 mb-1">Avg Cost</div>
          <div className="text-lg font-bold text-gray-900">
            ${stock.averageCost.toFixed(2)}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-500 mb-1">Current Price</div>
          <div className="text-lg font-bold text-gray-900">
            ${stock.currentPrice.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={stock.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValueStock" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              tickFormatter={(val) => `$${val}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value, name) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
              labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              name="Stock Price"
              stroke={strokeColor} 
              fillOpacity={1} 
              fill="url(#colorValueStock)" 
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="averageCost"
              name="Avg Cost"
              stroke="#f97316"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockCard;
