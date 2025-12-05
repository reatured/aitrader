import React from 'react';
import { Trash2, Eye } from 'lucide-react';

const StockTable = ({ stocks, onRemoveStock, onView }) => {
  if (stocks.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider font-medium">
            <tr>
              <th className="p-4">Symbol</th>
              <th className="p-4">Total Shares</th>
              <th className="p-4">Avg Cost</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">Total Invested</th>
              <th className="p-4">Current Value</th>
              <th className="p-4">Return</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{stock.symbol}</td>
                <td className="p-4">{stock.totalShares.toFixed(4)}</td>
                <td className="p-4">${stock.averageCost.toFixed(2)}</td>
                <td className="p-4">${stock.currentPrice.toFixed(2)}</td>
                <td className="p-4">${stock.totalInvested.toLocaleString()}</td>
                <td className="p-4 font-medium">${stock.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={`p-4 font-medium ${stock.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.totalReturn >= 0 ? '+' : ''}{stock.totalReturn.toFixed(2)}%
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => onView(stock.symbol)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onRemoveStock(stock.symbol)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove Stock"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;
