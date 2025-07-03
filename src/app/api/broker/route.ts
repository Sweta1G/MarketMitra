import { NextRequest, NextResponse } from 'next/server';
import { ZerodhaService, GrowwService, DemoBrokerService } from '@/lib/brokerServices';

// Mock database for storing broker connections
let brokerAccounts: any[] = [
  {
    id: '1',
    userId: 'user123',
    brokerId: 'demo',
    brokerName: 'Demo Broker',
    accessToken: 'demo_access_token',
    isActive: true,
    lastSynced: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user123';

    // Get all broker accounts for the user
    const userAccounts = brokerAccounts.filter(account => account.userId === userId);

    return NextResponse.json({
      success: true,
      data: userAccounts
    });
  } catch (error) {
    console.error('Error fetching broker accounts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch broker accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, brokerId, action } = body;

    if (!userId || !brokerId) {
      return NextResponse.json(
        { success: false, error: 'userId and brokerId are required' },
        { status: 400 }
      );
    }

    if (action === 'getLoginUrl') {
      let loginUrl: string;

      switch (brokerId) {
        case 'zerodha':
          const zerodhaService = new ZerodhaService();
          loginUrl = await zerodhaService.getLoginUrl(userId);
          break;
        case 'groww':
          const growwService = new GrowwService();
          loginUrl = await growwService.getLoginUrl(userId);
          break;
        case 'demo':
          const demoService = new DemoBrokerService();
          loginUrl = await demoService.getLoginUrl(userId);
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Unsupported broker' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        loginUrl
      });
    }

    if (action === 'connect') {
      const { accessToken, requestToken } = body;

      if (!accessToken && !requestToken) {
        return NextResponse.json(
          { success: false, error: 'accessToken or requestToken is required' },
          { status: 400 }
        );
      }

      // Check if account already exists
      const existingAccount = brokerAccounts.find(
        account => account.userId === userId && account.brokerId === brokerId
      );

      if (existingAccount) {
        // Update existing account
        existingAccount.accessToken = accessToken || existingAccount.accessToken;
        existingAccount.isActive = true;
        existingAccount.lastSynced = new Date().toISOString();

        return NextResponse.json({
          success: true,
          data: existingAccount,
          message: 'Broker account updated successfully'
        });
      } else {
        // Create new account
        const newAccount = {
          id: Date.now().toString(),
          userId,
          brokerId,
          brokerName: getBrokerName(brokerId),
          accessToken: accessToken || `${brokerId}_demo_token`,
          isActive: true,
          lastSynced: new Date().toISOString()
        };

        brokerAccounts.push(newAccount);

        return NextResponse.json({
          success: true,
          data: newAccount,
          message: 'Broker account connected successfully'
        });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error handling broker request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    if (!accountId) {
      return NextResponse.json(
        { success: false, error: 'accountId is required' },
        { status: 400 }
      );
    }

    const accountIndex = brokerAccounts.findIndex(account => account.id === accountId);
    if (accountIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Broker account not found' },
        { status: 404 }
      );
    }

    brokerAccounts.splice(accountIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Broker account disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting broker account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect broker account' },
      { status: 500 }
    );
  }
}

function getBrokerName(brokerId: string): string {
  const brokerNames: { [key: string]: string } = {
    'zerodha': 'Zerodha',
    'groww': 'Groww',
    'upstox': 'Upstox',
    'angel': 'Angel One',
    'demo': 'Demo Broker'
  };

  return brokerNames[brokerId] || brokerId;
}
