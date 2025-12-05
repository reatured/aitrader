import React, { useState, useEffect, useMemo } from 'react';
import { subYears, format } from 'date-fns';
import { fetchStockData } from './services/api';
import { calculateReturns } from './utils/simulator';
import ConfigForm from './components/ConfigForm';
import StatsCard from './components/StatsCard';
import StockTable from './components/StockTable';
import PortfolioChart from './components/PortfolioChart';
import { LayoutDashboard, PieChart, AlertCircle } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Persistent State
  const [globalConfig, setGlobalConfig] = useState(() => {
    const saved = localStorage.getItem('sim_config');
    return saved ? JSON.parse(saved) : {
      contribution: 100,
      startDate: format(subYears(new Date(), 1), 'yyyy-MM-dd'), // Default to 1 year ago
    };
  });

  const [symbols, setSymbols] = useState(() => {
    const saved = localStorage.getItem('sim_symbols');
    return saved ? JSON.parse(saved) : [];
  });

  // Data State
  const [marketData, setMarketData] = useState({});

  // Persist config changes
  useEffect(() => {
    localStorage.setItem('sim_config', JSON.stringify(globalConfig));
  }, [globalConfig]);

  useEffect(() => {
    localStorage.setItem('sim_symbols', JSON.stringify(symbols));
  }, [symbols]);

  // Fetch Data for Symbols
  useEffect(() => {
    const loadData = async () => {
      const missingSymbols = symbols.filter(s => !marketData[s]);
      if (missingSymbols.length === 0) return;

      setLoading(true);
      setError('');
      
      try {
        const newData = { ...marketData };
        for (const symbol of missingSymbols) {
           const data = await fetchStockData(symbol);
           newData[symbol] = data;
        }
        setMarketData(newData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbols, marketData]);

  const handleAddStock = (symbol) => {
    if (!symbols.includes(symbol)) {
      setSymbols([...symbols, symbol]);
    }
  };

  const handleRemoveStock = (symbol) => {
    setSymbols(symbols.filter(s => s !== symbol));
    // Optional: Clear marketData[symbol] if you want to free memory
  };

  const handleUpdateConfig = (key, value) => {
    setGlobalConfig(prev => ({ ...prev, [key]: value }));
  };

  // Derived State: Calculations
  const results = useMemo(() => {
    return symbols.map(symbol => {
      const data = marketData[symbol];
      if (!data) return null;
      
      const result = calculateReturns(
        data, 
        parseFloat(globalConfig.contribution), 
        globalConfig.startDate
      );
      
      return { ...result, symbol };
    }).filter(Boolean);
  }, [symbols, marketData, globalConfig]);

  // Derived State: Aggregates for Dashboard
  const aggregates = useMemo(() => {
    if (results.length === 0) return { 
      totalInvested: 0, 
      currentValue: 0, 
      totalReturn: 0, 
      chartData: [] 
    };

    const totalInvested = results.reduce((sum, r) => sum + r.totalInvested, 0);
    const currentValue = results.reduce((sum, r) => sum + r.currentValue, 0);
    const totalReturn = totalInvested > 0 
      ? ((currentValue - totalInvested) / totalInvested) * 100 
      : 0;

    // Merge histories for chart
    // We create a map of date -> { invested, value } summing up all stocks
    const dateMap = {};
    
    results.forEach(stock => {
      stock.history.forEach(point => {
        if (!dateMap[point.date]) {
          dateMap[point.date] = { date: point.date, invested: 0, value: 0 };
        }
        dateMap[point.date].invested += point.invested;
        dateMap[point.date].value += point.value;
      });
    });

    const chartData = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    return { totalInvested, currentValue, totalReturn, chartData };
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <LayoutDashboard size={24} />
            <h1 className="text-xl font-bold tracking-tight">Weekly Investment Simulator</h1>
          </div>
          <div className="text-sm text-gray-500">
            DCA Strategy Backtester
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center border border-red-100">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            title="Total Invested" 
            value={aggregates.totalInvested} 
            subValue={`${symbols.length} Active Positions`}
          />
          <StatsCard 
            title="Portfolio Value" 
            value={aggregates.currentValue} 
            trend={aggregates.totalReturn}
          />
          <StatsCard 
            title="Net Profit/Loss" 
            value={aggregates.currentValue - aggregates.totalInvested} 
            trend={null}
          />
        </div>

        {/* Configuration */}
        <ConfigForm 
          onAddStock={handleAddStock} 
          globalConfig={globalConfig} 
          onUpdateGlobalConfig={handleUpdateConfig} 
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Fetching market data...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && results.length > 0 && (
          <>
            <PortfolioChart data={aggregates.chartData} />
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <PieChart className="mr-2" size={20}/> 
              Portfolio Breakdown
            </h2>
            <StockTable stocks={results} onRemoveStock={handleRemoveStock} />
          </>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Add a stock symbol above to start simulating your returns.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;