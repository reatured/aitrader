import React, { useState } from 'react';
import { Plus, Settings, ArrowUpDown, TrendingUp, DollarSign, AlertCircle, Trash2 } from 'lucide-react';

const Sidebar = ({ 
  stocks, // Processed stocks (no errors)
  allSymbols, // All symbols including those with errors
  stockErrors, // Map of symbol -> error message
  onAddStock, 
  onRemoveStock, // New prop for removing from sidebar list
  globalConfig, 
  onUpdateGlobalConfig, 
  sortBy, 
  onSortChange 
}) => {
  const [symbol, setSymbol] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol) {
      const symbolsToAdd = symbol.split(',').map(s => s.trim().toUpperCase()).filter(s => s.length > 0);
      symbolsToAdd.forEach(s => onAddStock(s));
      setSymbol('');
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 text-blue-600 mb-8">
          <TrendingUp size={24} />
          <h1 className="text-xl font-bold tracking-tight">AiTrader</h1>
        </div>

        {/* Add Stock Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Add Stock</h3>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Symbols (e.g. AAPL, MSFT)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="flex-1 min-w-0 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase text-sm"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
              title="Add Stock"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* Simulation Settings */}
        <div className="mb-8 border-b border-gray-100 pb-8">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-between w-full text-left mb-4 group"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
              Simulation Settings
            </h3>
            <Settings size={16} className={`text-gray-400 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
          </button>
          
          {showSettings && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weekly Investment ($)</label>
                <input
                  type="number"
                  value={globalConfig.contribution}
                  onChange={(e) => onUpdateGlobalConfig('contribution', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={globalConfig.startDate}
                  onChange={(e) => onUpdateGlobalConfig('startDate', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sorting */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Your Portfolio</h3>
            <div className="relative group">
              <button className="text-gray-400 hover:text-gray-600">
                <ArrowUpDown size={16} />
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 shadow-lg rounded-lg py-1 hidden group-hover:block z-20">
                <button 
                  onClick={() => onSortChange('symbol')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'symbol' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  Symbol
                </button>
                <button 
                  onClick={() => onSortChange('return')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'return' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  Return %
                </button>
                <button 
                  onClick={() => onSortChange('value')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'value' ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                >
                  Value
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stock List */}
        <div className="space-y-3">
          {allSymbols.map(symbol => { // Use allSymbols here
            const stock = stocks.find(s => s.symbol === symbol);
            const hasError = stockErrors[symbol];
            
            return (
              <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1 h-8 rounded-full ${stock && stock.totalReturn >= 0 ? 'bg-green-500' : hasError ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <div className="font-bold text-gray-900 flex items-center">
                      {symbol}
                      {hasError && (
                        <div className="relative group ml-2">
                          <AlertCircle size={16} className="text-red-500 cursor-help" />
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-max p-2 bg-red-600 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                            {hasError}
                          </div>
                        </div>
                      )}
                    </div>
                    {stock && (
                      <div className="text-xs text-gray-500">${stock.currentValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stock && (
                    <div className={`text-sm font-medium ${stock.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stock.totalReturn >= 0 ? '+' : ''}{stock.totalReturn.toFixed(1)}%
                    </div>
                  )}
                  <button 
                    onClick={() => onRemoveStock(symbol)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title={`Remove ${symbol}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {allSymbols.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No stocks added yet.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
