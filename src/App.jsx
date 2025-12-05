import React, { useState, useEffect, useMemo } from 'react';
import { subYears, format } from 'date-fns';
import { fetchStockData } from './services/api';
import { calculateReturns } from './utils/simulator';
import Sidebar from './components/Sidebar';
import StatsCard from './components/StatsCard';
import PortfolioChart from './components/PortfolioChart';
import StockCard from './components/StockCard';
import { PieChart, AlertCircle, Menu } from 'lucide-react'; // Added Menu

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // General app errors (e.g., API key)
  const [stockErrors, setStockErrors] = useState({}); // { symbol: "Error message" }
  const [sortBy, setSortBy] = useState('symbol'); // 'symbol' | 'return' | 'value'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // New state for sidebar

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
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
      // Symbols that we need to fetch data for (not in marketData and no existing error)
      const symbolsToFetch = symbols.filter(s => !marketData[s] && !stockErrors[s]);

      // Also re-fetch if a symbol that previously had an error is now "cleared" by the user adding it again, or if it changed
      const symbolsToRecheck = symbols.filter(s => stockErrors[s] && !symbolsToFetch.includes(s));

      if (symbolsToFetch.length === 0 && symbolsToRecheck.length === 0) return;

      setLoading(true);
      setError(''); // Clear general error

      let newMarketData = { ...marketData };
      let newStockErrors = { ...stockErrors };
      const symbolsToRemove = new Set(); // New set to collect symbols to remove

      // Clear errors for symbols we are about to re-fetch
      symbolsToRecheck.forEach(s => delete newStockErrors[s]);
      
      const allSymbolsToProcess = [...new Set([...symbolsToFetch, ...symbolsToRecheck])];

      for (const symbol of allSymbolsToProcess) {
        try {
          const data = await fetchStockData(symbol);
          newMarketData[symbol] = data;
          // Clear any previous error for this symbol if fetch was successful
          delete newStockErrors[symbol];
        } catch (err) {
          console.error(`Error fetching data for ${symbol}:`, err);
          // Check if the error indicates an invalid symbol
          if (err.message && err.message.includes('Invalid symbol')) {
            symbolsToRemove.add(symbol);
          } else {
            newStockErrors[symbol] = err.message;
            // Ensure this symbol is not in marketData if it failed
            delete newMarketData[symbol];
          }
        }
      }

      // After the loop, remove the identified invalid symbols and update states
      if (symbolsToRemove.size > 0) {
        setSymbols(prevSymbols => prevSymbols.filter(s => !symbolsToRemove.has(s)));
        setStockErrors(prevErrors => {
          const updatedErrors = { ...newStockErrors }; // Start with current errors from loop
          symbolsToRemove.forEach(s => delete updatedErrors[s]);
          return updatedErrors;
        });
        setMarketData(prevData => {
          const updatedData = { ...newMarketData }; // Start with current data from loop
          symbolsToRemove.forEach(s => delete updatedData[s]);
          return updatedData;
        });
      } else {
        setMarketData(newMarketData);
        setStockErrors(newStockErrors); // Update errors after the loop
      }
      setLoading(false);
    };

    loadData();
  }, [symbols, marketData, globalConfig.startDate, stockErrors]); // Add stockErrors and globalConfig.startDate to dependencies

  const handleAddStock = (symbol) => {
    if (!symbols.includes(symbol)) {
      setSymbols(prevSymbols => [...prevSymbols, symbol]);
      // If a symbol is added that previously had an error, clear that error
      setStockErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[symbol];
        return newErrors;
      });
    }
  };

  const handleRemoveStock = (symbol) => {
    setSymbols(symbols.filter(s => s !== symbol));
    // Also clear error and market data for the removed symbol
    setStockErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      delete newErrors[symbol];
      return newErrors;
    });
    setMarketData(prevData => {
      const newData = { ...prevData };
      delete newData[symbol];
      return newData;
    });
  };

  const handleUpdateConfig = (key, value) => {
    setGlobalConfig(prev => ({ ...prev, [key]: value }));
  };

  // Derived State: Calculations
  const results = useMemo(() => {
    const unsorted = symbols.map(symbol => {
      // If there's an error for this symbol, or no data yet, skip it for calculations
      if (stockErrors[symbol] || !marketData[symbol]) return null; 

      const data = marketData[symbol];
      
      const result = calculateReturns(
        data, 
        parseFloat(globalConfig.contribution), 
        globalConfig.startDate
      );
      
      return { ...result, symbol };
    }).filter(Boolean); // Filter out nulls (errored or pending)

    return unsorted.sort((a, b) => {
      if (sortBy === 'value') return b.currentValue - a.currentValue;
      if (sortBy === 'return') return b.totalReturn - a.totalReturn;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [symbols, marketData, globalConfig, sortBy, stockErrors]);

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
    <div className="relative flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      <Sidebar 
        stocks={results}
        allSymbols={symbols} // Pass all symbols including those with errors for sidebar list
        stockErrors={stockErrors} // Pass stock errors to sidebar
        onAddStock={handleAddStock}
        onRemoveStock={handleRemoveStock} // Allow removal from sidebar list
        globalConfig={globalConfig}
        onUpdateGlobalConfig={handleUpdateConfig}
        sortBy={sortBy}
        onSortChange={setSortBy}
        isSidebarOpen={isSidebarOpen} // Pass sidebar state
        toggleSidebar={toggleSidebar} // Pass toggle function
      />

      <main className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen lg:ml-80">
        {/* Mobile Hamburger Menu */}
        <div className="lg:hidden flex justify-end mb-4">
          <button 
            onClick={toggleSidebar} 
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* General Error Display */}
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
            subValue={`${symbols.length - Object.keys(stockErrors).length} Active Positions`}
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
              Individual Holdings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {results.map(stock => (
                <StockCard 
                  key={stock.symbol} 
                  stock={stock} 
                  onRemove={() => handleRemoveStock(stock.symbol)} 
                />
              ))}
            </div>
          </>
        )}

        {!loading && results.length === 0 && !Object.keys(stockErrors).length && !error && (
          <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-xl border border-dashed border-gray-300 text-center p-12">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
               <PieChart size={48} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Portfolio</h3>
            <p className="text-gray-500 max-w-md">
              Use the sidebar to add your first stock symbol (e.g., AAPL, GOOGL) and configure your weekly investment strategy.
            </p>
          </div>
        )}

        {/* Display stock errors in main content if no results are shown and there are errors */}
        {!loading && results.length === 0 && Object.keys(stockErrors).length > 0 && (
          <div className="bg-orange-50 border border-orange-100 text-orange-700 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Some stocks could not be loaded:</h3>
            <ul className="list-disc list-inside">
              {Object.entries(stockErrors).map(([symbol, msg]) => (
                <li key={symbol}>{symbol}: {msg}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">Please check the symbols in the sidebar and remove/re-add them if necessary.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;