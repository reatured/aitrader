import React from 'react';
import { ArrowUp, ArrowDown, DollarSign } from 'lucide-react';

const StatsCard = ({ title, value, subValue, isCurrency = true, trend = null }) => {
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : value;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{formattedValue}</div>
        {trend !== null && (
          <div className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp size={16} className="mr-1" /> : <ArrowDown size={16} className="mr-1" />}
            {Math.abs(trend).toFixed(2)}%
          </div>
        )}
      </div>
      {subValue && <div className="text-sm text-gray-400 mt-1">{subValue}</div>}
    </div>
  );
};

export default StatsCard;
