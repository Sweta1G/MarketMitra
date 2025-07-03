import { NextRequest, NextResponse } from 'next/server';
import { ZerodhaService, GrowwService, DemoBrokerService, Holding, Position } from '@/lib/brokerServices';

export interface Portfolio {
  id: string;
  name: string;
  brokerId: string;
  brokerName: string;
  stocks: string[];
  holdings: Holding[];
  positions: Position[];
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  isLinked: boolean;
  lastSynced: string;
  createdAt: string;
  updatedAt: string;
}

// Mock broker accounts storage
let brokerAccounts: any[] = [];

// Portfolio storage - starts empty, no demo data
let portfolios: Portfolio[] = [];

// Helper function to sync portfolio with broker
async function syncPortfolioWithBroker(portfolio: Portfolio): Promise<Portfolio> {
  try {
    const brokerAccount = brokerAccounts.find(
      account => account.id === portfolio.brokerId || account.brokerId === portfolio.brokerId
    );

    if (!brokerAccount || !brokerAccount.isActive) {
      return portfolio; // Return unchanged if broker not connected
    }

    let brokerService;
    switch (brokerAccount.brokerId) {
      case 'zerodha':
        brokerService = new ZerodhaService();
        break;
      case 'demo':
        brokerService = new DemoBrokerService();
        break;
      default:
        return portfolio;
    }

    const holdings = await brokerService.getHoldings(brokerAccount.accessToken);
    const positions = await brokerService.getPositions(brokerAccount.accessToken);

    // Calculate totals
    const totalValue = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.lastPrice), 0);
    const totalPnl = holdings.reduce((sum, holding) => sum + holding.pnl, 0) + 
                    positions.reduce((sum, position) => sum + position.pnl, 0);
    const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

    // Extract stock symbols
    const stocks = holdings.map(holding => holding.tradingSymbol);

    const updatedPortfolio: Portfolio = {
      ...portfolio,
      holdings,
      positions,
      stocks,
      totalValue,
      totalPnl,
      totalPnlPercent,
      lastSynced: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return updatedPortfolio;
  } catch (error) {
    console.error('Error syncing portfolio with broker:', error);
    return portfolio; // Return unchanged on error
  }
}

// Helper function to create portfolio from broker
async function createPortfolioFromBroker(brokerAccount: any, userId: string): Promise<Portfolio | null> {
  try {
    let brokerService;
    switch (brokerAccount.brokerId) {
      case 'zerodha':
        brokerService = new ZerodhaService();
        break;
      case 'demo':
        brokerService = new DemoBrokerService();
        break;
      default:
        return null;
    }

    const holdings = await brokerService.getHoldings(brokerAccount.accessToken);
    const positions = await brokerService.getPositions(brokerAccount.accessToken);

    // Calculate totals
    const totalValue = holdings.reduce((sum, holding) => sum + (holding.quantity * holding.lastPrice), 0);
    const totalPnl = holdings.reduce((sum, holding) => sum + holding.pnl, 0) + 
                    positions.reduce((sum, position) => sum + position.pnl, 0);
    const totalPnlPercent = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

    // Extract stock symbols
    const stocks = holdings.map(holding => holding.tradingSymbol);

    const newPortfolio: Portfolio = {
      id: `${userId}_${brokerAccount.brokerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${brokerAccount.brokerName} Portfolio`,
      brokerId: brokerAccount.brokerId,
      brokerName: brokerAccount.brokerName,
      stocks,
      holdings,
      positions,
      totalValue,
      totalPnl,
      totalPnlPercent,
      isLinked: true,
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newPortfolio;
  } catch (error) {
    console.error('Error creating portfolio from broker:', error);
    return null;
  }
}

// Indian stock symbols for validation
const VALID_STOCKS = [
  'TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'ITC', 'SBIN', 'BAJFINANCE',
  'ASIANPAINT', 'MARUTI', 'KOTAKBANK', 'WIPRO', 'ONGC', 'NTPC', 'POWERGRID',
  'ULTRACEMCO', 'AXISBANK', 'ICICIBANK', 'BHARTIARTL', 'HINDUNILVR', 'NESTLEIND',
  'LT', 'SUNPHARMA', 'DRREDDY', 'CIPLA', 'APOLLOHOSP', 'TATAMOTORS', 'M&M',
  'JSWSTEEL', 'TATASTEEL', 'COALINDIA', 'ADANIPORTS', 'BPCL', 'IOC', 'GAIL'
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || 'user123';
    const sync = searchParams.get('sync') === 'true';

    if (id) {
      const portfolio = portfolios.find(p => p.id === id);
      if (!portfolio) {
        return NextResponse.json(
          { success: false, error: 'Portfolio not found' },
          { status: 404 }
        );
      }

      // Sync portfolio if requested
      if (sync && portfolio.isLinked) {
        const syncedPortfolio = await syncPortfolioWithBroker(portfolio);
        return NextResponse.json({
          success: true,
          data: syncedPortfolio
        });
      }

      return NextResponse.json({
        success: true,
        data: portfolio
      });
    }

    // Get all portfolios for user and sync if needed
    const userPortfolios = portfolios.filter(p => p.id.startsWith(userId) || portfolios.length === 0);
    
    // If no portfolios exist, create one from connected brokers
    if (userPortfolios.length === 0) {
      const connectedBrokers = brokerAccounts.filter(account => 
        account.userId === userId && account.isActive
      );

      if (connectedBrokers.length > 0) {
        // Create portfolios from connected brokers (only if not already exists)
        for (const broker of connectedBrokers) {
          // Check if portfolio for this broker already exists
          const existingPortfolio = portfolios.find(p => 
            p.brokerId === broker.brokerId && p.id.includes(userId)
          );
          
          if (!existingPortfolio) {
            const syncedPortfolio = await createPortfolioFromBroker(broker, userId);
            if (syncedPortfolio) {
              portfolios.push(syncedPortfolio);
              userPortfolios.push(syncedPortfolio);
            }
          }
        }
      }
    }

    // Sync existing linked portfolios if requested
    if (sync) {
      for (let i = 0; i < userPortfolios.length; i++) {
        if (userPortfolios[i].isLinked) {
          userPortfolios[i] = await syncPortfolioWithBroker(userPortfolios[i]);
          // Update in main array
          const mainIndex = portfolios.findIndex(p => p.id === userPortfolios[i].id);
          if (mainIndex !== -1) {
            portfolios[mainIndex] = userPortfolios[i];
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: userPortfolios
    });

  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, stocks, userId = 'user123', brokerId } = body;

    console.log('📝 Creating portfolio:', { name, stocks, userId, brokerId });

    if (!name) {
      console.log('❌ Missing portfolio name');
      return NextResponse.json(
        { success: false, error: 'Portfolio name is required' },
        { status: 400 }
      );
    }

    // If brokerId is provided, sync with broker
    if (brokerId) {
      const brokerAccount = brokerAccounts.find(
        account => account.brokerId === brokerId && account.userId === userId && account.isActive
      );

      if (!brokerAccount) {
        return NextResponse.json(
          { success: false, error: 'Broker account not found or not active' },
          { status: 400 }
        );
      }

      const syncedPortfolio = await createPortfolioFromBroker(brokerAccount, userId);
      if (syncedPortfolio) {
        syncedPortfolio.name = name; // Use custom name
        portfolios.push(syncedPortfolio);
        return NextResponse.json({
          success: true,
          data: syncedPortfolio
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Failed to sync with broker' },
          { status: 500 }
        );
      }
    }

    // Create manual portfolio
    if (!stocks || !Array.isArray(stocks)) {
      return NextResponse.json(
        { success: false, error: 'Stocks array is required for manual portfolio' },
        { status: 400 }
      );
    }

    // Basic validation for stock symbols (should be non-empty strings)
    const invalidStocks = stocks.filter(stock => !stock || typeof stock !== 'string' || stock.trim().length === 0);
    if (invalidStocks.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All stock symbols must be valid non-empty strings'
        },
        { status: 400 }
      );
    }

    const newPortfolio: Portfolio = {
      id: `${userId}_manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      brokerId: 'manual',
      brokerName: 'Manual Entry',
      stocks: stocks.map((s: string) => s.toUpperCase()),
      holdings: [],
      positions: [],
      totalValue: 0,
      totalPnl: 0,
      totalPnlPercent: 0,
      isLinked: false,
      lastSynced: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    portfolios.push(newPortfolio);

    console.log('✅ Portfolio created successfully:', newPortfolio.id);

    return NextResponse.json({
      success: true,
      data: newPortfolio
    });

  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, stocks } = body;

    console.log('📝 Updating portfolio:', { id, name, stocks });

    if (!id) {
      console.log('❌ Missing portfolio ID');
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const portfolioIndex = portfolios.findIndex(p => p.id === id);
    if (portfolioIndex === -1) {
      console.log('❌ Portfolio not found:', id);
      console.log('📋 Available portfolios:', portfolios.map(p => ({ id: p.id, name: p.name })));
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    if (stocks && Array.isArray(stocks)) {
      // Basic validation for stock symbols (should be non-empty strings)
      const invalidStocks = stocks.filter(stock => !stock || typeof stock !== 'string' || stock.trim().length === 0);
      if (invalidStocks.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'All stock symbols must be valid non-empty strings'
          },
          { status: 400 }
        );
      }
    }

    // Update portfolio
    if (name) portfolios[portfolioIndex].name = name;
    if (stocks) portfolios[portfolioIndex].stocks = stocks.map((s: string) => s.toUpperCase());
    portfolios[portfolioIndex].updatedAt = new Date().toISOString();

    console.log('✅ Portfolio updated successfully:', portfolios[portfolioIndex].id);

    return NextResponse.json({
      success: true,
      data: portfolios[portfolioIndex]
    });

  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Portfolio ID is required' },
        { status: 400 }
      );
    }

    const portfolioIndex = portfolios.findIndex(p => p.id === id);
    if (portfolioIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    portfolios.splice(portfolioIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}
