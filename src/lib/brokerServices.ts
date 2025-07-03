import axios from 'axios';

export interface BrokerAccount {
  id: string;
  brokerId: string;
  brokerName: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  isActive: boolean;
  lastSynced: string;
}

export interface Position {
  tradingSymbol: string;
  exchange: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  instrumentToken?: string;
}

export interface Holding {
  tradingSymbol: string;
  exchange: string;
  isin: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  pnl: number;
  pnlPercent: number;
  collateralQuantity?: number;
  collateralType?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  brokerId: string;
  brokerName: string;
  holdings: Holding[];
  positions: Position[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  lastUpdated: string;
}

// Zerodha Kite Connect Integration
export class ZerodhaService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZERODHA_API_KEY || '';
    this.baseUrl = process.env.ZERODHA_BASE_URL || 'https://api.kite.trade';
  }

  async getLoginUrl(userId: string): Promise<string> {
    const redirectUrl = encodeURIComponent(`${process.env.NEXT_PUBLIC_BASE_URL}/api/broker/zerodha/callback`);
    return `https://kite.zerodha.com/connect/login?api_key=${this.apiKey}&v=3&redirect_url=${redirectUrl}&state=${userId}`;
  }

  async generateAccessToken(requestToken: string, apiSecret: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/session/token`, {
        api_key: this.apiKey,
        request_token: requestToken,
        checksum: this.generateChecksum(this.apiKey + requestToken + apiSecret)
      });

      return response.data;
    } catch (error) {
      console.error('Error generating Zerodha access token:', error);
      throw error;
    }
  }

  async getHoldings(accessToken: string): Promise<Holding[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/portfolio/holdings`, {
        headers: {
          'Authorization': `token ${this.apiKey}:${accessToken}`,
          'X-Kite-Version': '3'
        }
      });

      return response.data.data.map((holding: any) => ({
        tradingSymbol: holding.tradingsymbol,
        exchange: holding.exchange,
        isin: holding.isin,
        quantity: holding.quantity,
        averagePrice: holding.average_price,
        lastPrice: holding.last_price,
        pnl: holding.pnl,
        pnlPercent: holding.pnl_percent || 0,
        collateralQuantity: holding.collateral_quantity,
        collateralType: holding.collateral_type
      }));
    } catch (error) {
      console.error('Error fetching Zerodha holdings:', error);
      throw error;
    }
  }

  async getPositions(accessToken: string): Promise<Position[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/portfolio/positions`, {
        headers: {
          'Authorization': `token ${this.apiKey}:${accessToken}`,
          'X-Kite-Version': '3'
        }
      });

      const allPositions = [...response.data.data.net, ...response.data.data.day];
      return allPositions.map((position: any) => ({
        tradingSymbol: position.tradingsymbol,
        exchange: position.exchange,
        quantity: position.quantity,
        averagePrice: position.average_price,
        currentPrice: position.last_price,
        pnl: position.pnl,
        pnlPercent: position.pnl_percent || 0,
        instrumentToken: position.instrument_token
      }));
    } catch (error) {
      console.error('Error fetching Zerodha positions:', error);
      throw error;
    }
  }

  private generateChecksum(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

// Groww API Integration (using their public endpoints)
export class GrowwService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'https://groww.in/v1/api';
  }

  async getLoginUrl(userId: string): Promise<string> {
    // Groww doesn't have public API yet, so we'll simulate the flow
    return `${process.env.NEXT_PUBLIC_BASE_URL}/broker/groww/login?user=${userId}`;
  }

  async getPortfolioData(userId: string): Promise<any> {
    // Since Groww doesn't have public API, we'll return demo data
    return {
      holdings: [
        {
          tradingSymbol: 'TCS',
          exchange: 'NSE',
          quantity: 10,
          averagePrice: 3500,
          lastPrice: 3650,
          pnl: 1500,
          pnlPercent: 4.28
        }
      ]
    };
  }
}

// Generic broker interface for extensibility
export interface BrokerService {
  getLoginUrl(userId: string): Promise<string>;
  getHoldings(accessToken: string): Promise<Holding[]>;
  getPositions(accessToken: string): Promise<Position[]>;
}

// Broker factory
export class BrokerFactory {
  static createBrokerService(brokerId: string): BrokerService {
    switch (brokerId) {
      case 'zerodha':
        return new ZerodhaService();
      case 'groww':
        return new GrowwService() as any;
      default:
        throw new Error(`Unsupported broker: ${brokerId}`);
    }
  }
}

// Demo/Mock broker for testing
export class DemoBrokerService implements BrokerService {
  async getLoginUrl(userId: string): Promise<string> {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/api/broker/demo/callback?user=${userId}&token=demo_token`;
  }

  async getHoldings(accessToken: string): Promise<Holding[]> {
    // Return realistic demo holdings
    return [
      {
        tradingSymbol: 'TCS',
        exchange: 'NSE',
        isin: 'INE467B01029',
        quantity: 25,
        averagePrice: 3420.50,
        lastPrice: 3650.75,
        pnl: 5756.25,
        pnlPercent: 6.73
      },
      {
        tradingSymbol: 'RELIANCE',
        exchange: 'NSE',
        isin: 'INE002A01018',
        quantity: 15,
        averagePrice: 2850.25,
        lastPrice: 2920.80,
        pnl: 1058.25,
        pnlPercent: 2.47
      },
      {
        tradingSymbol: 'HDFCBANK',
        exchange: 'NSE',
        isin: 'INE040A01034',
        quantity: 20,
        averagePrice: 1580.30,
        lastPrice: 1650.45,
        pnl: 1403.00,
        pnlPercent: 4.44
      },
      {
        tradingSymbol: 'INFY',
        exchange: 'NSE',
        isin: 'INE009A01021',
        quantity: 30,
        averagePrice: 1420.75,
        lastPrice: 1485.20,
        pnl: 1933.50,
        pnlPercent: 4.54
      }
    ];
  }

  async getPositions(accessToken: string): Promise<Position[]> {
    return [
      {
        tradingSymbol: 'NIFTY25JAN24900CE',
        exchange: 'NFO',
        quantity: 50,
        averagePrice: 125.50,
        currentPrice: 142.30,
        pnl: 840.00,
        pnlPercent: 13.38
      }
    ];
  }
}
