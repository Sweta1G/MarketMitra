import { useState } from 'react';
import { NewsItem } from '@/app/api/news/route';
import { RefreshCw, ExternalLink, Clock, Building2, TrendingUp, Globe } from 'lucide-react';

interface NewsSectionProps {
  title: string;
  news: NewsItem[];
  loading: boolean;
  onRefresh: () => void;
  emptyMessage?: string;
}

export function NewsSection({ title, news, loading, onRefresh, emptyMessage }: NewsSectionProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIconForTitle = (title: string) => {
    if (title.includes('Portfolio')) return TrendingUp;
    return Globe;
  };

  const IconComponent = getIconForTitle(title);

  return (
    <div className="glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {title}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-full">
                  {showAll ? news.length : Math.min(news.length, 3)} articles
                </span>
                <span className="text-sm font-medium text-gray-300">
                  Updated now
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none"
          >
            <RefreshCw className={`h-4 w-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            <span>{loading || refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-700 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No News Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {emptyMessage || "Check back later for the latest market updates and news."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-6">
              {(showAll ? news : news.slice(0, 3)).map((item, index) => (
              <article
                key={index}
                className="group relative bg-gradient-to-r from-gray-800/70 to-gray-700/70 p-6 rounded-2xl border-2 border-gray-600 hover:border-blue-500 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 backdrop-blur-sm cursor-pointer"
                onClick={() => window.open(item.url, '_blank')}
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-indigo-600 rounded-l-2xl"></div>
                
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-white leading-tight pr-4 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                
                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 text-blue-300 rounded-xl font-semibold text-sm backdrop-blur-sm border border-blue-500/30">
                      {item.source}
                    </span>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{formatTime(item.timestamp)}</span>
                    </div>
                  </div>
                  <a 
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-blue-300"
                  >
                    <span className="text-xs font-medium text-blue-400">
                      Click to read more →
                    </span>
                  </a>
                </div>
              </article>
              ))}
            </div>
            
            {/* See More/See Less Button */}
            {news.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <span>{showAll ? 'See Less' : `See More (${news.length - 3} more)`}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
