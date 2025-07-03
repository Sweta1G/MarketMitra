import { useState, useEffect } from 'react';
import { Portfolio } from '@/app/api/portfolio/route';
import { Briefcase, Plus, X, Edit2, Save, TrendingUp, TrendingDown, Link, ChevronDown, Settings } from 'lucide-react';

interface PortfolioSectionProps {
  portfolio: Portfolio | null;
  onPortfolioUpdate: (portfolio: Portfolio | null) => void;
}

export function PortfolioSection({ portfolio, onPortfolioUpdate }: PortfolioSectionProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(portfolio?.id || null);
  const [showPortfolioSelector, setShowPortfolioSelector] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [stocks, setStocks] = useState<string[]>([]);

  // Load all portfolios on component mount
  useEffect(() => {
    loadPortfolios();
  }, []);

  // Update local state when portfolio prop changes
  useEffect(() => {
    if (portfolio) {
      setSelectedPortfolioId(portfolio.id);
      setPortfolioName(portfolio.name);
      setStocks(portfolio.stocks);
    } else {
      // Clear selection when portfolio is null
      setSelectedPortfolioId(null);
      setPortfolioName('');
      setStocks([]);
    }
  }, [portfolio]);

  const loadPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolio?userId=user123');
      const data = await response.json();
      if (data.success) {
        setPortfolios(data.data);
        // Only auto-select if no portfolio is currently selected and no portfolio prop exists
        if (!selectedPortfolioId && !portfolio && data.data.length > 0) {
          const firstPortfolio = data.data[0];
          setSelectedPortfolioId(firstPortfolio.id);
          setPortfolioName(firstPortfolio.name);
          setStocks(firstPortfolio.stocks);
          onPortfolioUpdate(firstPortfolio);
        }
      }
    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  };

  const selectPortfolio = (portfolio: Portfolio) => {
    console.log('📋 Portfolio Selected:', { from: selectedPortfolioId, to: portfolio.id, stocks: portfolio.stocks });
    
    // Update local state first
    setSelectedPortfolioId(portfolio.id);
    setPortfolioName(portfolio.name);
    setStocks(portfolio.stocks);
    setShowPortfolioSelector(false);
    
    // Then notify parent component
    onPortfolioUpdate(portfolio);
  };

  const startCreatePortfolio = () => {
    setShowCreateForm(true);
    setPortfolioName('');
    setStocks([]);
    setIsEditing(true);
  };

  const cancelCreatePortfolio = () => {
    setShowCreateForm(false);
    setIsEditing(false);
    setPortfolioName('');
    setStocks([]);
  };

  const handleAddStock = () => {
    if (newStock.trim() && !stocks.includes(newStock.toUpperCase().trim())) {
      const updatedStocks = [...stocks, newStock.toUpperCase().trim()];
      setStocks(updatedStocks);
      setNewStock('');
    }
  };

  const handleRemoveStock = (stockToRemove: string) => {
    const updatedStocks = stocks.filter(stock => stock !== stockToRemove);
    setStocks(updatedStocks);
  };

  const handleSave = async () => {
    console.log('💾 Saving portfolio:', {
      isCreate: showCreateForm,
      method: (portfolio && !showCreateForm) ? 'PUT' : 'POST',
      portfolioId: portfolio?.id,
      name: portfolioName,
      stocks: stocks
    });

    try {
      const method = (portfolio && !showCreateForm) ? 'PUT' : 'POST';
      const body = (portfolio && !showCreateForm)
        ? { id: portfolio.id, name: portfolioName, stocks }
        : { name: portfolioName, stocks, userId: 'user123' };

      console.log('📤 Request body:', body);

      const response = await fetch('/api/portfolio', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      console.log('📥 Response:', { status: response.status, data });

      if (data.success) {
        await loadPortfolios(); // Refresh the portfolio list
        onPortfolioUpdate(data.data);
        setSelectedPortfolioId(data.data.id);
        setIsEditing(false);
        setShowCreateForm(false);
      } else {
        console.error('❌ Portfolio save failed:', data);
        alert(data.error || 'Failed to save portfolio');
      }
    } catch (error) {
      console.error('💥 Error saving portfolio:', error);
      alert('Failed to save portfolio');
    }
  };

  const handleCancel = () => {
    if (showCreateForm) {
      cancelCreatePortfolio();
    } else {
      setStocks(portfolio?.stocks || []);
      setPortfolioName(portfolio?.name || 'My Portfolio');
      setIsEditing(false);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;
    
    try {
      const response = await fetch(`/api/portfolio?id=${portfolioId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await loadPortfolios();
        // If deleted portfolio was selected, clear selection
        if (portfolioId === selectedPortfolioId) {
          setSelectedPortfolioId(null);
          onPortfolioUpdate(null);
        }
      } else {
        alert(data.error || 'Failed to delete portfolio');
      }
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('Failed to delete portfolio');
    }
  };

  const popularStocks = [
    'TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'ITC', 'SBIN', 
    'BAJFINANCE', 'ASIANPAINT', 'MARUTI', 'KOTAKBANK'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="glass rounded-3xl shadow-2xl border border-white/20 overflow-hidden card-hover">
      <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 px-8 py-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1">
              {(isEditing && showCreateForm) ? (
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b-2 border-indigo-400 text-white focus:outline-none focus:border-indigo-300 placeholder-gray-400"
                  placeholder="Portfolio Name"
                />
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    {portfolios.length > 1 && !showCreateForm ? (
                      <div className="relative">
                        <button
                          onClick={() => setShowPortfolioSelector(!showPortfolioSelector)}
                          className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent hover:from-indigo-100 hover:to-white transition-all duration-200"
                        >
                          <span>{portfolio?.name || 'Select Portfolio'}</span>
                          <ChevronDown className="h-5 w-5 text-white" />
                        </button>
                        
                        {showPortfolioSelector && (
                          <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl z-50">
                            <div className="p-3 border-b border-white/10">
                              <h3 className="text-sm font-semibold text-white">Your Portfolios</h3>
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {portfolios.map((p) => (
                                <div
                                  key={p.id}
                                  className={`w-full p-3 hover:bg-white/5 transition-colors duration-200 ${
                                    p.id === selectedPortfolioId ? 'bg-indigo-500/20 border-l-2 border-indigo-400' : ''
                                  }`}
                                >
                                  <div 
                                    onClick={() => selectPortfolio(p)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-white">{p.name}</p>
                                        <p className="text-xs text-gray-400">
                                          {p.stocks.length} stocks • {p.isLinked ? p.brokerName : 'Manual'}
                                        </p>
                                      </div>
                                      {p.isLinked && (
                                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                                          <Link className="h-3 w-3 text-green-400" />
                                          <span className="text-xs text-green-400">Linked</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {!p.isLinked && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deletePortfolio(p.id);
                                      }}
                                      className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        {showCreateForm ? 'Create New Portfolio' : (portfolio?.name || 'Your Portfolio')}
                      </h2>
                    )}
                    
                    {portfolio?.isLinked && !showCreateForm && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                        <Link className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">{portfolio.brokerName}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-300">
                    {showCreateForm ? (
                      'Add stocks to create your custom portfolio'
                    ) : portfolio ? (
                      <>
                        {portfolio.stocks.length} holdings
                        {portfolio.isLinked && portfolio.lastSynced && (
                          <span className="ml-2 text-xs text-gray-400">
                            • Last synced: {new Date(portfolio.lastSynced).toLocaleDateString()}
                          </span>
                        )}
                      </>
                    ) : (
                      'Get started with your investment journey'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {!showCreateForm && !isEditing && (
              <>
                <button
                  onClick={startCreatePortfolio}
                  className="btn-secondary flex items-center space-x-2 px-4 py-2 text-gray-300 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>New</span>
                </button>
                
                {portfolio && !portfolio.isLinked && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center space-x-2 px-4 py-2 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                )}
              </>
            )}
            
            {(isEditing || showCreateForm) && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSave}
                  disabled={!portfolioName.trim() || stocks.length === 0}
                  className="btn-primary flex items-center space-x-2 px-4 py-2 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-2 px-4 py-2 text-gray-300 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Manual Portfolio Creator/Editor */}
        {(showCreateForm || (isEditing && portfolio && !portfolio.isLinked)) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {showCreateForm ? 'Create New Portfolio' : 'Edit Portfolio'}
            </h3>
            
            {showCreateForm && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  placeholder="Enter portfolio name (e.g., My Growth Portfolio)"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                />
              </div>
            )}
            
            <div className="flex space-x-3 mb-4">
              <input
                type="text"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                placeholder="Enter stock symbol (e.g., TCS)"
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
              />
              <button
                onClick={handleAddStock}
                className="btn-primary px-6 py-3 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Popular stocks:</h4>
              <div className="flex flex-wrap gap-2">
                {popularStocks.map((stock) => (
                  <button
                    key={stock}
                    onClick={() => setNewStock(stock)}
                    className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-sm text-indigo-300 hover:bg-indigo-500/30 transition-colors duration-200"
                  >
                    {stock}
                  </button>
                ))}
              </div>
            </div>

            {/* Current stocks display for editing */}
            {stocks.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Selected Stocks ({stocks.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stocks.map((stock) => (
                    <div key={stock} className="stock-card p-4 bg-white/5 border border-white/10 rounded-xl card-hover">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{stock.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{stock}</p>
                            <p className="text-sm text-gray-300">NSE</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStock(stock)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Summary for Broker-Linked Portfolios */}
        {!isEditing && !showCreateForm && portfolio?.isLinked && portfolio.totalValue > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
            <h3 className="text-lg font-semibold text-white mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-300">Total Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">Total P&L</p>
                <div className="flex items-center justify-center space-x-1">
                  {portfolio.totalPnl >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <p className={`text-xl font-bold ${portfolio.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(portfolio.totalPnl)}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-300">P&L %</p>
                <p className={`text-xl font-bold ${portfolio.totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio.totalPnlPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Holdings Display for Broker-Linked Portfolios */}
        {portfolio?.isLinked && portfolio.holdings && portfolio.holdings.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
            <div className="space-y-3">
              {portfolio.holdings.map((holding, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{holding.tradingSymbol.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{holding.tradingSymbol}</p>
                      <p className="text-sm text-gray-300">{holding.quantity} shares</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(holding.lastPrice * holding.quantity)}</p>
                    <div className="flex items-center space-x-1">
                      {holding.pnl >= 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <p className={`text-sm font-medium ${holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(holding.pnl)} ({holding.pnlPercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual Portfolio Display (not editing) */}
        {!isEditing && !showCreateForm && portfolio && !portfolio.isLinked && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Your Stocks ({portfolio.stocks.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.stocks.map((stock) => (
                <div key={stock} className="stock-card p-4 bg-white/5 border border-white/10 rounded-xl card-hover">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{stock}</p>
                      <p className="text-sm text-gray-300">NSE</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!portfolio && !isEditing && !showCreateForm && portfolios.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Portfolio Yet</h3>
            <p className="text-gray-400 mb-6">Create your first portfolio or connect a broker account</p>
            <button
              onClick={startCreatePortfolio}
              className="btn-primary px-8 py-3 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Create Portfolio
            </button>
          </div>
        )}

        {/* Portfolio selection prompt */}
        {!portfolio && !showCreateForm && !isEditing && portfolios.length > 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Portfolio</h3>
            <p className="text-gray-400 mb-6">You have {portfolios.length} portfolio{portfolios.length > 1 ? 's' : ''} available</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowPortfolioSelector(true)}
                className="btn-secondary px-6 py-3 text-gray-300 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Select Portfolio
              </button>
              <button
                onClick={startCreatePortfolio}
                className="btn-primary px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create New
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
