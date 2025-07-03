import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { NewsItem } from '../news/route';

export interface AnalysisResult {
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  reasoning: string;
  impactedStocks: string[];
  overallMarketSentiment: string;
}

export interface AnalysisRequest {
  news: NewsItem[];
  portfolio?: string[];
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getMockAnalysis(news: NewsItem[], portfolio: string[] = []): AnalysisResult {
  console.log('🎯 Mock Analysis Starting:', { newsCount: news.length, portfolio });
  
  // More realistic keyword analysis
  const positiveKeywords = ['rises', 'surge', 'rally', 'beats', 'strong', 'growth', 'expansion', 'inflows', 'bullish', 'gains', 'profit', 'buy', 'upgrade'];
  const negativeKeywords = ['falls', 'decline', 'weak', 'concerns', 'drop', 'losses', 'bearish', 'sell', 'downgrade', 'crash', 'plunge', 'deficit'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  let portfolioMentions = 0;
  const impactedStocks: string[] = [];

  news.forEach(item => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) positiveCount++;
    });
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) negativeCount++;
    });

    // Check if any portfolio stocks are mentioned
    portfolio.forEach(stock => {
      if (text.includes(stock.toLowerCase()) || 
          text.includes(getCompanyName(stock).toLowerCase())) {
        if (!impactedStocks.includes(stock)) {
          impactedStocks.push(stock);
          portfolioMentions++;
        }
      }
    });
  });

  console.log('📈 Analysis Metrics:', {
    positiveCount,
    negativeCount,
    portfolioMentions,
    impactedStocks,
    portfolioSize: portfolio.length
  });

  let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
  let confidence = 0.3; // Start with low base confidence
  let reasoning = '';

  // More realistic confidence calculation with much wider ranges
  const totalSentimentSignals = positiveCount + negativeCount;
  const sentimentStrength = totalSentimentSignals > 0 ? Math.abs(positiveCount - negativeCount) / totalSentimentSignals : 0;
  
  // Base confidence from portfolio size (smaller portfolios = lower confidence)
  if (portfolio.length === 0) {
    confidence = 0.15 + Math.random() * 0.1; // 15-25%
  } else if (portfolio.length === 1) {
    confidence = 0.25 + Math.random() * 0.15; // 25-40%
  } else if (portfolio.length <= 3) {
    confidence = 0.35 + Math.random() * 0.2; // 35-55%
  } else if (portfolio.length <= 5) {
    confidence = 0.45 + Math.random() * 0.25; // 45-70%
  } else {
    confidence = 0.55 + Math.random() * 0.2; // 55-75%
  }

  // Add sentiment strength impact
  confidence += sentimentStrength * 0.3;

  // Portfolio mention bonus/penalty
  const mentionRatio = portfolio.length > 0 ? impactedStocks.length / portfolio.length : 0;
  if (mentionRatio > 0.5) {
    confidence += 0.15; // High portfolio relevance
  } else if (mentionRatio > 0) {
    confidence += 0.08; // Some portfolio relevance
  } else {
    confidence -= 0.1; // No portfolio relevance
  }

  // News volume impact
  if (news.length < 5) {
    confidence -= 0.1; // Limited news data
  } else if (news.length > 15) {
    confidence += 0.05; // Rich news data
  }

  // Determine sentiment
  if (positiveCount > negativeCount && (positiveCount - negativeCount) >= 2) {
    sentiment = 'Positive';
  } else if (negativeCount > positiveCount && (negativeCount - positiveCount) >= 2) {
    sentiment = 'Negative';
  } else {
    sentiment = 'Neutral';
    confidence -= 0.05; // Lower confidence for neutral sentiment
  }

  // Final confidence adjustments and capping
  confidence = Math.max(0.1, Math.min(0.85, confidence)); // Cap between 10% and 85%

  // Generate realistic reasoning
  if (sentiment === 'Positive') {
    reasoning = `Positive market signals detected (${positiveCount} vs ${negativeCount} negative). ${impactedStocks.length > 0 ? `${impactedStocks.length} of your stocks (${impactedStocks.join(', ')}) mentioned in news.` : `Your ${portfolio.length} stock portfolio not directly mentioned in current news.`} ${portfolio.length < 3 ? 'Limited diversification may increase risk.' : 'Portfolio diversification provides stability.'}`;
  } else if (sentiment === 'Negative') {
    reasoning = `Market concerns evident (${negativeCount} vs ${positiveCount} positive signals). ${impactedStocks.length > 0 ? `${impactedStocks.length} of your stocks (${impactedStocks.join(', ')}) facing headwinds.` : `Your ${portfolio.length} stock portfolio not directly mentioned in current negative news.`} ${portfolio.length < 3 ? 'Concentrated holdings may amplify volatility.' : 'Diversification may help weather the downturn.'}`;
  } else {
    reasoning = `Mixed market signals (${positiveCount} positive vs ${negativeCount} negative). ${impactedStocks.length > 0 ? `${impactedStocks.length} of your stocks mentioned in current news.` : `Limited news coverage of your ${portfolio.length} stock portfolio.`} Market direction unclear - ${portfolio.length < 3 ? 'consider diversification' : 'maintain cautious optimism'}.`;
  }

  const overallMarketSentiment = `${sentiment.toUpperCase()} outlook with ${Math.round(confidence * 100)}% confidence${portfolio.length > 0 ? ` for your ${portfolio.length}-stock portfolio` : ' - add stocks for better analysis'}`;

  const result = {
    sentiment,
    confidence,
    reasoning,
    impactedStocks,
    overallMarketSentiment
  };

  console.log('✅ Final Analysis Result:', result);
  return result;
}

function getCompanyName(symbol: string): string {
  const companyMap: { [key: string]: string } = {
    'TCS': 'Tata Consultancy Services',
    'INFY': 'Infosys',
    'HDFCBANK': 'HDFC Bank',
    'RELIANCE': 'Reliance Industries',
    'ITC': 'ITC Limited',
    'SBIN': 'State Bank of India',
    'BAJFINANCE': 'Bajaj Finance',
    'ASIANPAINT': 'Asian Paints',
    'MARUTI': 'Maruti Suzuki',
    'KOTAKBANK': 'Kotak Mahindra Bank'
  };
  return companyMap[symbol] || symbol;
}

async function analyzeWithOpenAI(news: NewsItem[], portfolio: string[] = []): Promise<AnalysisResult> {
  try {
    const newsText = news.map(item => `${item.title}: ${item.summary}`).join('\n');
    const portfolioText = portfolio.length > 0 ? `Portfolio stocks: ${portfolio.join(', ')}` : '';

    const prompt = `
Analyze the following Indian stock market news and provide sentiment analysis:

${newsText}

${portfolioText}

Please provide:
1. Overall sentiment (Positive/Negative/Neutral)
2. Confidence score (0-1)
3. Brief reasoning
4. Which portfolio stocks (if any) might be impacted
5. Overall market sentiment summary

Respond in JSON format with keys: sentiment, confidence, reasoning, impactedStocks, overallMarketSentiment
`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial analyst specializing in Indian stock markets. Provide objective, data-driven analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        // If JSON parsing fails, fall back to mock analysis
        return getMockAnalysis(news, portfolio);
      }
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
  }

  // Fallback to mock analysis
  return getMockAnalysis(news, portfolio);
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json();
    const { news, portfolio = [] } = body;

    console.log('🔍 Analysis API Called:', {
      newsCount: news?.length || 0,
      portfolio: portfolio,
      portfolioLength: portfolio.length
    });

    if (!news || !Array.isArray(news) || news.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No news data provided' },
        { status: 400 }
      );
    }

    const analysis = await analyzeWithOpenAI(news, portfolio);
    
    console.log('📊 Analysis Generated:', {
      sentiment: analysis.sentiment,
      confidence: analysis.confidence,
      impactedStocks: analysis.impactedStocks,
      portfolioUsed: portfolio
    });

    return NextResponse.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing news:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze news',
        data: null
      },
      { status: 500 }
    );
  }
}
