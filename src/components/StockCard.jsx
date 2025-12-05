import React from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';

const StockCard = ({ stock, onRemove }) => {
  if (!stock) return null;

  const isPositive = stock.totalReturn >= 0;
  const ColorIcon = isPositive ? TrendingUp : TrendingDown;
  const strokeColor = isPositive ? '#16a34a' : '#dc2626'; // green-600 : red-600

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 sm:p-6 relative animate-fade-in flex flex-col gap-4 h-full">
      <button 
        onClick={onRemove}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
        title="Remove Stock"
      >
        <Trash2 size={20} />
      </button>

      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 truncate">{stock.symbol}</h2>
          <span className={`flex items-center text-sm font-medium px-2.5 py-0.5 rounded-full ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <ColorIcon size={14} className="mr-1" />
            {stock.totalReturn >= 0 ? '+' : ''}{stock.totalReturn.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="w-full border-b border-gray-100 pb-3">
        <p className="text-gray-500 text-sm">Current Value</p>
        <div className="text-2xl font-bold text-gray-900">
          ${stock.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center text-gray-500 mb-1">
            <DollarSign size={14} className="mr-1" />
            <span className="text-xs font-medium">Total Invested</span>
          </div>
          <div className="text-base font-bold text-gray-900">
            ${stock.totalInvested.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-1">Total Shares</div>
          <div className="text-base font-bold text-gray-900">
            {stock.totalShares.toFixed(4)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-1">Avg Cost</div>
          <div className="text-base font-bold text-gray-900">
            ${stock.averageCost.toFixed(2)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-medium text-gray-500 mb-1">Current Price</div>
          <div className="text-base font-bold text-gray-900">
            ${stock.currentPrice.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="h-[180px] sm:h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={stock.history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorValueStock-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => format(parseISO(str), 'MMM yy')}
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fontSize: 10 }}
              tickFormatter={(val) => `$${val}`}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              formatter={(value, name) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name]}
              labelFormatter={(label) => format(parseISO(label), 'MMM d, yyyy')}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              name="Stock Price"
              stroke={strokeColor} 
              fillOpacity={1} 
              fill={`url(#colorValueStock-${stock.symbol})`} 
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
