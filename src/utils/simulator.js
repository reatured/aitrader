import { parseISO, isAfter, isBefore, startOfWeek, format } from 'date-fns';

/**
 * Simulates a weekly investment strategy.
 * 
 * @param {Object} weeklyData - The 'Weekly Adjusted Time Series' from Alpha Vantage.
 * @param {number} weeklyContribution - Amount to invest each week.
 * @param {string} startDate - ISO date string (YYYY-MM-DD) to start investing.
 * @returns {Object} Simulation results.
 */
export const calculateReturns = (weeklyData, weeklyContribution, startDate) => {
  const dates = Object.keys(weeklyData).sort(); // Oldest to newest
  const start = parseISO(startDate);
  
  let totalInvested = 0;
  let totalShares = 0;
  const history = [];

  // Filter dates to only include those after the start date
  const validDates = dates.filter(dateStr => {
    const date = parseISO(dateStr);
    return isAfter(date, start) || dateStr === startDate;
  });

  validDates.forEach(dateStr => {
    const weekData = weeklyData[dateStr];
    const closePrice = parseFloat(weekData['5. adjusted close']);
    
    // Buy shares
    const sharesBought = weeklyContribution / closePrice;
    totalShares += sharesBought;
    totalInvested += weeklyContribution;

    const currentValue = totalShares * closePrice;
    const averageCost = totalShares > 0 ? totalInvested / totalShares : 0;
    
    history.push({
      date: dateStr,
      invested: totalInvested,
      value: currentValue,
      price: closePrice,
      shares: totalShares,
      averageCost
    });
  });

  if (history.length === 0) {
     return {
        totalInvested: 0,
        currentValue: 0,
        totalShares: 0,
        totalReturn: 0,
        averageCost: 0,
        currentPrice: 0,
        history: []
     };
  }

  const currentPrice = parseFloat(weeklyData[validDates[validDates.length - 1]]['5. adjusted close']);
  const currentValue = totalShares * currentPrice;
  const totalReturn = ((currentValue - totalInvested) / totalInvested) * 100;
  const averageCost = totalInvested / totalShares;

  return {
    totalInvested,
    currentValue,
    totalShares,
    totalReturn,
    averageCost,
    currentPrice,
    history
  };
};
