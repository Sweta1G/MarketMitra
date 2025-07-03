import { TrendingUp, BarChart3, Bell, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="glass backdrop-blur-xl shadow-2xl border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-2xl shadow-lg gradient-animate">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                MarketMitra
              </h1>
              <p className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                <Sparkles className="h-3 w-3" />
                <span>AI-Powered Investment Intelligence</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span>Live Data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <span>Smart Alerts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 px-4 py-2 rounded-2xl border border-green-700/50 backdrop-blur-sm">
              <div className="relative">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-sm font-semibold text-green-300">
                Live Updates
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
