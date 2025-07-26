import axios from 'axios';

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  candlesticks: CandlestickData[];
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  ema20: number;
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  support: number;
  resistance: number;
}

class MarketDataService {
  private readonly BINANCE_API = 'https://api.binance.com/api/v3';
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      // Get current price and 24h stats from Binance
      const tickerResponse = await axios.get(`${this.BINANCE_API}/ticker/24hr`, {
        params: { symbol: symbol.replace('/', '') }
      });

      // Get candlestick data (1h intervals, last 100 candles)
      const candlesResponse = await axios.get(`${this.BINANCE_API}/klines`, {
        params: {
          symbol: symbol.replace('/', ''),
          interval: '1h',
          limit: 100
        }
      });

      const candlesticks: CandlestickData[] = candlesResponse.data.map((candle: any[]) => ({
        timestamp: candle[0],
        open: parseFloat(candle[1]),
        high: parseFloat(candle[2]),
        low: parseFloat(candle[3]),
        close: parseFloat(candle[4]),
        volume: parseFloat(candle[5])
      }));

      return {
        symbol,
        price: parseFloat(tickerResponse.data.lastPrice),
        change24h: parseFloat(tickerResponse.data.priceChangePercent),
        volume24h: parseFloat(tickerResponse.data.volume),
        high24h: parseFloat(tickerResponse.data.highPrice),
        low24h: parseFloat(tickerResponse.data.lowPrice),
        candlesticks
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Return mock data as fallback
      return this.getMockMarketData(symbol);
    }
  }

  calculateTechnicalIndicators(candlesticks: CandlestickData[]): TechnicalIndicators {
    const closes = candlesticks.map(c => c.close);
    const highs = candlesticks.map(c => c.high);
    const lows = candlesticks.map(c => c.low);

    // RSI calculation (14 periods)
    const rsi = this.calculateRSI(closes, 14);

    // Moving averages
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    const ema20 = this.calculateEMA(closes, 20);

    // MACD calculation
    const macd = this.calculateMACD(closes);

    // Bollinger Bands
    const bollinger = this.calculateBollingerBands(closes, 20, 2);

    // Support and Resistance levels
    const support = Math.min(...lows.slice(-20));
    const resistance = Math.max(...highs.slice(-20));

    return {
      rsi,
      macd,
      sma20,
      sma50,
      ema20,
      bollinger,
      support,
      resistance
    };
  }

  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // Signal line (9-period EMA of MACD)
    const macdHistory = [macd]; // Simplified for demo
    const signal = this.calculateEMA(macdHistory, 9);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  private calculateBollingerBands(prices: number[], period: number, stdDev: number) {
    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }

  private getMockMarketData(symbol: string): MarketData {
    const basePrice = symbol.includes('BTC') ? 45000 : symbol.includes('ETH') ? 2800 : 1.0;
    const candlesticks: CandlestickData[] = [];
    
    for (let i = 99; i >= 0; i--) {
      const timestamp = Date.now() - (i * 3600000); // 1 hour intervals
      const open = basePrice + (Math.random() - 0.5) * basePrice * 0.02;
      const close = open + (Math.random() - 0.5) * open * 0.01;
      const high = Math.max(open, close) + Math.random() * Math.abs(open - close);
      const low = Math.min(open, close) - Math.random() * Math.abs(open - close);
      
      candlesticks.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000000
      });
    }

    return {
      symbol,
      price: candlesticks[candlesticks.length - 1].close,
      change24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 50000000,
      high24h: Math.max(...candlesticks.map(c => c.high)),
      low24h: Math.min(...candlesticks.map(c => c.low)),
      candlesticks
    };
  }

  async getSupportedPairs(): Promise<string[]> {
    return [
      'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'XRP/USDT',
      'SOL/USDT', 'DOT/USDT', 'DOGE/USDT', 'AVAX/USDT', 'MATIC/USDT',
      'LINK/USDT', 'UNI/USDT', 'LTC/USDT', 'ATOM/USDT', 'FTM/USDT'
    ];
  }
}

export const marketDataService = new MarketDataService();