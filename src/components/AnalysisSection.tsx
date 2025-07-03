import { AnalysisResult } from '@/app/api/analyze/route';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, XCircle, Sparkles, Target } from 'lucide-react';

interface AnalysisSectionProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  portfolioStocks: string[];
}

export function AnalysisSection({ analysis, loading, portfolioStocks }: AnalysisSectionProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'Negative':
        return <TrendingDown className="h-6 w-6 text-red-500" />;
      default:
        return <Minus className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getSentimentGradient = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20';
      case 'Negative':
        return 'from-red-500/10 via-pink-500/10 to-rose-500/10 dark:from-red-900/20 dark:via-pink-900/20 dark:to-rose-900/20';
      default:
        return 'from-yellow-500/10 via-orange-500/10 to-amber-500/10 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-amber-900/20';
    }
  };

  const getSentimentTextColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'text-green-700 dark:text-green-300';
      case 'Negative':
        return 'text-red-700 dark:text-red-300';
      default:
        return 'text-yellow-700 dark:text-yellow-300';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (confidence >= 0.6) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden card-hover">
      <div className={`bg-gradient-to-r ${analysis ? getSentimentGradient(analysis.sentiment) : 'from-purple-500/20 via-indigo-500/20 to-blue-500/20'} px-8 py-6 border-b border-white/10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                AI Market Analysis
              </h2>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">
                  Real-time insights powered by AI
                </span>
              </div>
            </div>
          </div>
          
          {analysis && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-gray-800/60 px-4 py-2 rounded-2xl backdrop-blur-sm border border-gray-600/50">
                {getSentimentIcon(analysis.sentiment)}
                <span className={`font-bold ${getSentimentTextColor(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/60 px-4 py-2 rounded-2xl backdrop-blur-sm border border-gray-600/50">
                {getConfidenceIcon(analysis.confidence)}
                <span className={`text-sm font-bold ${getConfidenceColor(analysis.confidence)}`}>
                  {Math.round(analysis.confidence * 100)}% confident
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-2xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-700 rounded-lg w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="h-10 bg-gray-700 rounded-xl w-24"></div>
              <div className="h-10 bg-gray-700 rounded-xl w-32"></div>
            </div>
          </div>
        ) : !analysis ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              AI Analysis Loading
            </h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Our AI is analyzing the latest market news to provide you with intelligent insights about your portfolio.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Sentiment */}
            <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-2xl p-6 border border-gray-600 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Market Sentiment Overview
                </h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                {analysis.reasoning}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="bg-gradient-to-r from-gray-800/70 to-gray-700/70 rounded-2xl p-6 border border-gray-600 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  {getConfidenceIcon(analysis.confidence)}
                </div>
                <span>Confidence Analysis</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-300">
                    AI Confidence Score
                  </span>
                  <span className={`text-2xl font-bold ${getConfidenceColor(analysis.confidence)}`}>
                    {Math.round(analysis.confidence * 100)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                      analysis.confidence >= 0.8
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : analysis.confidence >= 0.6
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${analysis.confidence * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-400">
                  {analysis.confidence >= 0.8 
                    ? 'High confidence - Strong signal detected in market data'
                    : analysis.confidence >= 0.6 
                    ? 'Moderate confidence - Mixed signals in market data'
                    : 'Low confidence - Uncertain market conditions detected'
                  }
                </p>
              </div>
            </div>

            {/* Impacted Stocks */}
            {analysis.impactedStocks && analysis.impactedStocks.length > 0 && (
              <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-2xl p-6 border border-blue-700/50 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span>Your Portfolio Impact</span>
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                  {analysis.impactedStocks.map((stock) => (
                    <div
                      key={stock}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {stock}
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-blue-500/30">
                  <p className="text-blue-300 font-medium">
                    📊 <strong>{analysis.impactedStocks.length}</strong> of your <strong>{portfolioStocks.length}</strong> portfolio stocks may be impacted by current market news and trends.
                  </p>
                </div>
              </div>
            )}

            {/* Overall Market Sentiment */}
            <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span>Market Outlook</span>
              </h3>
              <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-purple-500/30">
                <p className="text-purple-300 font-semibold text-lg">
                  🔮 {analysis.overallMarketSentiment}
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-700/50 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-yellow-300 mb-2">
                    ⚠️ Investment Disclaimer
                  </h4>
                  <p className="text-sm text-yellow-200 leading-relaxed">
                    This AI-powered analysis is for informational purposes only and should not be considered as financial advice. 
                    Market conditions can change rapidly. Please consult with a qualified financial advisor before making any investment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
