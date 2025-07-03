import { useState } from 'react';
import { NewsItem } from '@/app/api/news/route';
import { RefreshCw, ExternalLink, Clock, TrendingUp, TrendingDown, AlertTriangle, Eye, BarChart3 } from 'lucide-react';

interface StockAnalysis {
  stock: string;
  companyName: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  reasoning: string;
  newsCount: number;
  relevantNews: NewsItem[];
}

interface PortfolioNewsSectionProps {
  portfolioStocks: string[];
  stockAnalysis: StockAnalysis[] | null;
  loading: boolean;
  onRefresh: () => void;
}

export function PortfolioNewsSection({ portfolioStocks, stockAnalysis, loading, onRefresh }: PortfolioNewsSectionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-400';
      case 'Negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return TrendingUp;
      case 'Negative': return TrendingDown;
      default: return AlertTriangle;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (portfolioStocks.length === 0) {
    return (
      <div className="glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden card-hover">
        <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Portfolio Stock Analysis
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-full">
                    No Portfolio
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Portfolio Selected</h3>
          <p className="text-gray-400">Create or select a portfolio to see stock-specific predictions and analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Portfolio Stock Analysis
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold rounded-full">
                  {portfolioStocks.length} Stock{portfolioStocks.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-300">
                  Live predictions & sentiment
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="btn-secondary flex items-center space-x-2 px-4 py-2 text-gray-300 rounded-xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse bg-white/5 rounded-xl p-4 h-24"></div>
            ))}
          </div>
        ) : stockAnalysis && stockAnalysis.length > 0 ? (
          <div className="space-y-4">
            {stockAnalysis.map((analysis) => {
              const SentimentIcon = getSentimentIcon(analysis.sentiment);
              const isExpanded = expandedStock === analysis.stock;
              
              return (
                <div key={analysis.stock} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    onClick={() => setExpandedStock(isExpanded ? null : analysis.stock)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{analysis.stock.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-white">{analysis.stock}</h3>
                            <SentimentIcon className={`h-4 w-4 ${getSentimentColor(analysis.sentiment)}`} />
                          </div>
                          <p className="text-sm text-gray-300">{analysis.companyName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${getSentimentColor(analysis.sentiment)}`}>
                              {analysis.sentiment}
                            </span>
                            <span className="text-xs text-gray-400">
                              {Math.round(analysis.confidence * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {analysis.newsCount} news article{analysis.newsCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        <Eye className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-white/10 p-4 bg-white/5">
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Analysis</h4>
                        <p className="text-sm text-gray-300">{analysis.reasoning}</p>
                      </div>
                      
                      {analysis.relevantNews.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-3">Related News</h4>
                          <div className="space-y-3">
                            {analysis.relevantNews.map((item, index) => (
                              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-sm font-medium text-white mb-1 line-clamp-2">
                                      {item.title}
                                    </h5>
                                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                                      {item.summary}
                                    </p>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatTime(item.timestamp)}</span>
                                      <span>•</span>
                                      <span>{item.source}</span>
                                    </div>
                                  </div>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-white transition-colors duration-200"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Analysis Available</h3>
            <p className="text-gray-400">Unable to analyze your portfolio stocks at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
