'use client';

import { useState, useEffect } from 'react';
import { NewsSection } from '@/components/NewsSection';
import { PortfolioSection } from '@/components/PortfolioSection';
import { AnalysisSection } from '@/components/AnalysisSection';
import { PortfolioNewsSection } from '@/components/PortfolioNewsSection';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
// import { BrokerConnection } from '@/components/BrokerConnection';
import { NewsItem } from './api/news/route';
import { Portfolio } from './api/portfolio/route';
import { AnalysisResult } from './api/analyze/route';

export default function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
    // Note: Portfolio loading is handled by PortfolioSection component
  }, []);

  // Analyze news when news or portfolio changes
  useEffect(() => {
    console.log('🔍 Analysis useEffect triggered:', {
      newsCount: news.length,
      portfolioId: portfolio?.id,
      portfolioStocks: portfolio?.stocks,
      portfolioName: portfolio?.name
    });
    
    if (news.length > 0 && portfolio?.stocks && portfolio.stocks.length > 0) {
      analyzeNews();
    } else if (!portfolio || !portfolio.stocks || portfolio.stocks.length === 0) {
      console.log('📭 Clearing analysis (no portfolio or no stocks)');
      setAnalysis(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [news, portfolio?.stocks?.join(','), portfolio?.id]);

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news');
      const data = await response.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeNews = async () => {
    if (news.length === 0) return;
    
    setAnalysisLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          news,
          portfolio: portfolio?.stocks || []
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Error analyzing news:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handlePortfolioUpdate = async (updatedPortfolio: Portfolio | null) => {
    console.log('🔄 Portfolio Update Triggered:', {
      oldPortfolio: portfolio?.id,
      newPortfolio: updatedPortfolio?.id,
      oldStocks: portfolio?.stocks || [],
      newStocks: updatedPortfolio?.stocks || [],
      newsCount: news.length
    });
    
    // Update the portfolio state
    setPortfolio(updatedPortfolio);
    
    // Trigger analysis immediately when portfolio changes
    if (updatedPortfolio && updatedPortfolio.stocks && updatedPortfolio.stocks.length > 0 && news.length > 0) {
      console.log('📊 Starting analysis with updated portfolio...', {
        portfolioId: updatedPortfolio.id,
        portfolioName: updatedPortfolio.name,
        stocks: updatedPortfolio.stocks
      });
      setAnalysisLoading(true);
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            news,
            portfolio: updatedPortfolio.stocks || []
          }),
        });
        const data = await response.json();
        console.log('📈 Analysis Result:', data);
        if (data.success) {
          setAnalysis(data.data);
        }
      } catch (error) {
        console.error('Error analyzing news after portfolio update:', error);
      } finally {
        setAnalysisLoading(false);
      }
    } else if (!updatedPortfolio) {
      // Clear analysis if no portfolio
      console.log('🗑️ Clearing analysis (no portfolio)');
      setAnalysis(null);
    }
  };

  const getPortfolioStockAnalysis = () => {
    if (!portfolio || portfolio.stocks.length === 0) return null;
    
    const stockAnalysis = portfolio.stocks.map(stock => {
      const relevantNews = news.filter(item => {
        const text = `${item.title} ${item.summary}`.toLowerCase();
        const stockLower = stock.toLowerCase();
        const companyName = getCompanyName(stock).toLowerCase();
        
        // More sophisticated matching
        return text.includes(stockLower) || 
               text.includes(companyName) ||
               text.includes(companyName.split(' ')[0]) || // First word of company name
               (stockLower === 'tcs' && text.includes('tata consultancy')) ||
               (stockLower === 'infy' && text.includes('infosys')) ||
               (stockLower === 'hdfcbank' && (text.includes('hdfc') || text.includes('hdfc bank'))) ||
               (stockLower === 'reliance' && text.includes('ril')) ||
               (stockLower === 'sbin' && (text.includes('sbi') || text.includes('state bank'))) ||
               (stockLower === 'bajfinance' && text.includes('bajaj')) ||
               (stockLower === 'asianpaint' && text.includes('asian paint')) ||
               (stockLower === 'kotakbank' && text.includes('kotak'));
      });

      // Advanced sentiment analysis with weighted keywords
      let sentiment: 'Positive' | 'Negative' | 'Neutral' = 'Neutral';
      let confidence = 0.2; // Start with low base confidence
      let reasoning = '';

      if (relevantNews.length > 0) {
        // Weighted positive indicators
        const positiveIndicators = [
          { keywords: ['beats', 'beat', 'exceeded', 'surpassed'], weight: 3 },
          { keywords: ['growth', 'rises', 'surge', 'rally', 'soared'], weight: 2.5 },
          { keywords: ['strong', 'robust', 'solid', 'impressive'], weight: 2 },
          { keywords: ['profit', 'revenue', 'earnings', 'income'], weight: 2 },
          { keywords: ['buy', 'upgrade', 'outperform', 'overweight'], weight: 2.5 },
          { keywords: ['expansion', 'acquire', 'merger', 'partnership'], weight: 1.5 },
          { keywords: ['record', 'highest', 'milestone', 'achievement'], weight: 2 }
        ];

        // Weighted negative indicators
        const negativeIndicators = [
          { keywords: ['falls', 'decline', 'plunge', 'crash'], weight: 3 },
          { keywords: ['weak', 'poor', 'disappointing', 'missed'], weight: 2.5 },
          { keywords: ['loss', 'deficit', 'debt', 'liability'], weight: 2.5 },
          { keywords: ['concerns', 'risks', 'challenges', 'issues'], weight: 2 },
          { keywords: ['sell', 'downgrade', 'underperform', 'underweight'], weight: 2.5 },
          { keywords: ['layoffs', 'cuts', 'reduction', 'closure'], weight: 2 },
          { keywords: ['regulatory', 'investigation', 'probe', 'fine'], weight: 1.5 }
        ];

        let positiveScore = 0;
        let negativeScore = 0;

        relevantNews.forEach(item => {
          const text = `${item.title} ${item.summary}`.toLowerCase();
          
          // Calculate positive score
          positiveIndicators.forEach(indicator => {
            indicator.keywords.forEach(keyword => {
              if (text.includes(keyword)) {
                positiveScore += indicator.weight;
              }
            });
          });

          // Calculate negative score
          negativeIndicators.forEach(indicator => {
            indicator.keywords.forEach(keyword => {
              if (text.includes(keyword)) {
                negativeScore += indicator.weight;
              }
            });
          });
        });

        // Determine sentiment based on weighted scores
        const scoreDifference = Math.abs(positiveScore - negativeScore);
        const totalScore = positiveScore + negativeScore;

        if (totalScore === 0) {
          sentiment = 'Neutral';
          confidence = 0.25 + (relevantNews.length * 0.05);
          reasoning = `${relevantNews.length} news article${relevantNews.length > 1 ? 's' : ''} found but no clear sentiment indicators detected`;
        } else if (positiveScore > negativeScore) {
          sentiment = 'Positive';
          // Higher confidence with stronger positive signals
          confidence = Math.min(0.85, 0.4 + (scoreDifference / totalScore) * 0.3 + (relevantNews.length * 0.05));
          reasoning = `Strong positive sentiment detected (score: +${positiveScore.toFixed(1)}) across ${relevantNews.length} article${relevantNews.length > 1 ? 's' : ''}. Key indicators suggest favorable outlook.`;
        } else if (negativeScore > positiveScore) {
          sentiment = 'Negative';
          confidence = Math.min(0.85, 0.4 + (scoreDifference / totalScore) * 0.3 + (relevantNews.length * 0.05));
          reasoning = `Negative sentiment detected (score: -${negativeScore.toFixed(1)}) across ${relevantNews.length} article${relevantNews.length > 1 ? 's' : ''}. Risk factors and concerns identified.`;
        } else {
          sentiment = 'Neutral';
          confidence = 0.35 + (relevantNews.length * 0.05);
          reasoning = `Mixed signals detected (positive: ${positiveScore.toFixed(1)}, negative: ${negativeScore.toFixed(1)}) in ${relevantNews.length} article${relevantNews.length > 1 ? 's' : ''}. Market sentiment unclear.`;
        }

        // Boost confidence for high-volume coverage
        if (relevantNews.length >= 3) {
          confidence = Math.min(0.85, confidence + 0.1);
        }

        // Add sector-specific intelligence
        const sectorBoosts = getSectorSpecificAnalysis(stock, relevantNews);
        confidence = Math.min(0.85, confidence + sectorBoosts.confidenceBoost);
        if (sectorBoosts.reasoning) {
          reasoning += ` ${sectorBoosts.reasoning}`;
        }

      } else {
        reasoning = `No recent news coverage found for ${getCompanyName(stock)}. Limited market visibility may indicate stable but unremarkable performance.`;
        confidence = 0.15;
      }

      return {
        stock,
        companyName: getCompanyName(stock),
        sentiment,
        confidence,
        reasoning,
        newsCount: relevantNews.length,
        relevantNews: relevantNews.slice(0, 3) // Top 3 most relevant news
      };
    });

    return stockAnalysis;
  };

  const getSectorSpecificAnalysis = (stock: string, relevantNews: NewsItem[]) => {
    let confidenceBoost = 0;
    let reasoning = '';

    // Tech stocks (TCS, INFY)
    if (['TCS', 'INFY'].includes(stock)) {
      const techKeywords = ['digital', 'cloud', 'ai', 'technology', 'software', 'contract', 'client'];
      const techMentions = relevantNews.reduce((count, item) => {
        const text = `${item.title} ${item.summary}`.toLowerCase();
        return count + techKeywords.filter(keyword => text.includes(keyword)).length;
      }, 0);
      
      if (techMentions > 0) {
        confidenceBoost = 0.05;
        reasoning = 'Technology sector exposure provides additional context.';
      }
    }

    // Banking stocks (HDFCBANK, SBIN, KOTAKBANK)
    if (['HDFCBANK', 'SBIN', 'KOTAKBANK'].includes(stock)) {
      const bankingKeywords = ['rbi', 'interest rate', 'npa', 'deposits', 'loans', 'credit', 'banking'];
      const bankingMentions = relevantNews.reduce((count, item) => {
        const text = `${item.title} ${item.summary}`.toLowerCase();
        return count + bankingKeywords.filter(keyword => text.includes(keyword)).length;
      }, 0);
      
      if (bankingMentions > 0) {
        confidenceBoost = 0.05;
        reasoning = 'Banking sector dynamics provide additional insight.';
      }
    }

    // Auto stocks (MARUTI)
    if (stock === 'MARUTI') {
      const autoKeywords = ['sales', 'vehicle', 'auto', 'car', 'suv', 'domestic', 'export'];
      const autoMentions = relevantNews.reduce((count, item) => {
        const text = `${item.title} ${item.summary}`.toLowerCase();
        return count + autoKeywords.filter(keyword => text.includes(keyword)).length;
      }, 0);
      
      if (autoMentions > 0) {
        confidenceBoost = 0.05;
        reasoning = 'Automotive sector indicators considered.';
      }
    }

    return { confidenceBoost, reasoning };
  };

  const getCompanyName = (symbol: string): string => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/50 via-blue-900/30 to-indigo-950/50 backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-purple-400/5 to-pink-600/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass rounded-2xl p-6 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Portfolio Value</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ₹{portfolio?.totalValue 
                      ? portfolio.totalValue.toLocaleString() 
                      : portfolio?.stocks?.length 
                        ? (portfolio.stocks.length * 25000).toLocaleString() 
                        : '0'
                    }
                  </p>
                  {portfolio?.totalPnl !== undefined && portfolio.totalPnl !== 0 && (
                    <p className={`text-sm font-medium ${portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {portfolio.totalPnl >= 0 ? '+' : ''}₹{portfolio.totalPnl.toLocaleString()} ({portfolio.totalPnlPercent?.toFixed(2)}%)
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Holdings</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {portfolio?.stocks.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="glass rounded-2xl p-6 card-hover backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">News Updates</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                    {news.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Broker Connection Section - Coming Soon */}
          {/* <BrokerConnection onPortfolioUpdate={handlePortfolioUpdate} /> */}

          {/* Portfolio Section */}
          <PortfolioSection 
            portfolio={portfolio} 
            onPortfolioUpdate={handlePortfolioUpdate}
          />

          {/* Analysis Section */}
          <AnalysisSection 
            analysis={analysis} 
            loading={analysisLoading}
            portfolioStocks={portfolio?.stocks || []}
          />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* General News Section */}
            <NewsSection 
              title="General Market News"
              news={news}
              loading={loading}
              onRefresh={fetchNews}
            />

            {/* Portfolio Stock Analysis Section */}
            <PortfolioNewsSection
              portfolioStocks={portfolio?.stocks || []}
              stockAnalysis={getPortfolioStockAnalysis()}
              loading={loading}
              onRefresh={fetchNews}
            />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
