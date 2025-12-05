import axios from 'axios';

const API_KEY = '46YNNQXIHAQ59HLH'; // Using the key from your configuration
const BASE_URL = 'https://www.alphavantage.co/query';

const CACHE_PREFIX = 'alphavantage_cache_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const fetchStockData = async (symbol) => {
  const cacheKey = `${CACHE_PREFIX}${symbol}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const parsedCache = JSON.parse(cachedData);
    if (Date.now() - parsedCache.timestamp < CACHE_DURATION) {
      console.log(`Using cached data for ${symbol}`);
      return parsedCache.data;
    }
  }

  try {
    console.log(`Fetching fresh data for ${symbol}`);
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_WEEKLY_ADJUSTED',
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    // Check for API limits or errors in the response body
    if (response.data['Note'] || response.data['Information']) {
      throw new Error(response.data['Note'] || response.data['Information']);
    }
    
    if (response.data['Error Message']) {
      throw new Error(`Invalid symbol: ${symbol}`);
    }

    const data = response.data['Weekly Adjusted Time Series'];
    if (!data) {
       throw new Error(`No data found for ${symbol}`);
    }

    // Cache the successful response
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      data: data,
    }));

    return data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};
