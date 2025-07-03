import { NextRequest, NextResponse } from 'next/server';

// This handles the OAuth callback from brokers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestToken = searchParams.get('request_token');
    const state = searchParams.get('state'); // This is the userId
    const status = searchParams.get('status');
    const broker = searchParams.get('broker') || 'demo';

    if (status === 'success' || requestToken || broker === 'demo') {
      // For demo purposes, we'll redirect with success
      const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?broker_connected=${broker}&user=${state}&token=${requestToken || 'demo_token'}`;
      
      return NextResponse.redirect(callbackUrl);
    } else {
      // Handle error case
      const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?broker_error=true&broker=${broker}`;
      return NextResponse.redirect(errorUrl);
    }
  } catch (error) {
    console.error('Error in broker callback:', error);
    const errorUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?broker_error=true`;
    return NextResponse.redirect(errorUrl);
  }
}
