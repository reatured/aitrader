import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const ConfigForm = ({ onAddStock, globalConfig, onUpdateGlobalConfig }) => {
  const [symbol, setSymbol] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol) {
      onAddStock(symbol.toUpperCase());
      setSymbol('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Investment ($)</label>
          <input
            type="number"
            value={globalConfig.contribution}
            onChange={(e) => onUpdateGlobalConfig('contribution', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={globalConfig.startDate}
            onChange={(e) => onUpdateGlobalConfig('startDate', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Enter Stock Symbol (e.g., AAPL, MSFT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
        >
          <Plus size={20} className="mr-2" />
          Add Stock
        </button>
      </form>
    </div>
  );
};

export default ConfigForm;
