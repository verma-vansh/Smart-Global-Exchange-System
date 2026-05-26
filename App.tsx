/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  History, 
  Star, 
  Volume2, 
  RotateCcw, 
  Copy, 
  Search, 
  Moon, 
  Sun, 
  TrendingUp,
  ChevronDown,
  Check,
  Loader2,
  Globe,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCIES, FINANCE_FACTS } from './constants';

interface ConversionHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  result: number;
  timestamp: number;
}

export default function App() {
  // App State
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['USD', 'EUR', 'GBP', 'INR']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [fact, setFact] = useState('');
  const [showFlash, setShowFlash] = useState(false);

  // Load saved history and favorites from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('exchangeHistory');
    const savedFavorites = localStorage.getItem('exchangeFavorites');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Save history and favorites to localStorage
  useEffect(() => {
    localStorage.setItem('exchangeHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('exchangeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Fetch rates
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
        const data = await response.json();
        if (data.result === 'success') {
          setRates(data.rates);
          setLastUpdated(new Date(data.time_last_update_utc).toLocaleTimeString());
        }
      } catch (error) {
        console.error('Failed to fetch rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [fromCurrency]);

  // Rupee Flash Effect
  useEffect(() => {
    if (fromCurrency === 'INR' || toCurrency === 'INR') {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [fromCurrency, toCurrency]);

  // Set random fact on mount
  useEffect(() => {
    setFact(FINANCE_FACTS[Math.floor(Math.random() * FINANCE_FACTS.length)]);
  }, []);

  const convertedAmount = useMemo(() => {
    if (!rates[toCurrency] || isNaN(parseFloat(amount))) return 0;
    return parseFloat(amount) * rates[toCurrency];
  }, [amount, toCurrency, rates]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleConvert = async () => {
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return;
    
    // Local history storage
    const newEntry: ConversionHistory = {
      id: Math.random().toString(36).substr(2, 9),
      from: fromCurrency,
      to: toCurrency,
      amount: parseFloat(amount),
      result: convertedAmount,
      timestamp: Date.now(),
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 10));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedAmount.toFixed(2));
  };

  const handleReset = () => {
    setAmount('1');
    setFromCurrency('USD');
    setToCurrency('EUR');
  };

  const speakResult = () => {
    const text = `${amount} ${fromCurrency} is equal to ${convertedAmount.toFixed(2)} ${toCurrency}`;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const toggleFavorite = (code: string) => {
    const newFavorites = favorites.includes(code) 
      ? favorites.filter(c => c !== code) 
      : [...favorites, code];
    
    setFavorites(newFavorites);
  };


  const getCurrencyData = (code: string) => CURRENCIES.find(c => c.code === code) || CURRENCIES[0];

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-emerald-500/30`}>
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-emerald-500' : 'bg-emerald-200'}`} />
        <div className={`absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 ${darkMode ? 'bg-blue-500' : 'bg-blue-200'}`} />
      </div>

      {/* Rupee Flash Overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[100px]"
            />
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              className="absolute flex flex-col items-center"
            >
              <div className="text-8xl mb-4">🇮🇳</div>
              <div className="text-4xl font-black tracking-tighter bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent">
                RUPEE POWER
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Smart Global Exchange</h1>
            <p className={`text-xs uppercase tracking-widest opacity-50 font-medium`}>Currency Converter</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${darkMode ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-black/5 hover:bg-black/10 border-black/5'} border`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-20 grid lg:grid-cols-[1fr_350px] gap-12">
        {/* Main Converter Section */}
        <section className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-[32px] border relative overflow-hidden ${darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-xl shadow-black/5'} backdrop-blur-xl`}
          >
            {/* Rupee Flash Background Pulse */}
            {showFlash && (
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-white/5 to-green-500/10 pointer-events-none"
              />
            )}

            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-end">
              {/* From */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-50 ml-1">Amount to Convert</label>
                <div className="relative group">
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full text-3xl font-bold bg-transparent border-b-2 py-4 focus:outline-none transition-all ${darkMode ? 'border-white/10 focus:border-emerald-500' : 'border-black/10 focus:border-emerald-500'}`}
                    placeholder="0.00"
                  />
                  <div className="absolute right-0 bottom-4 flex items-center gap-2">
                    <button 
                      onClick={() => setShowFromDropdown(!showFromDropdown)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-2xl">{getCurrencyData(fromCurrency).flag}</span>
                      <span className="font-bold">{fromCurrency}</span>
                      <ChevronDown size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center pb-2">
                <button 
                  onClick={handleSwap}
                  className={`p-4 rounded-full transition-all duration-500 hover:rotate-180 ${darkMode ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}
                >
                  <ArrowLeftRight size={24} />
                </button>
              </div>

              {/* To */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider opacity-50 ml-1">Converted Amount</label>
                <div className="relative group">
                  <div className={`w-full text-3xl font-bold border-b-2 py-4 transition-all ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
                    {loading ? (
                      <Loader2 className="animate-spin text-emerald-500" />
                    ) : (
                      <motion.span
                        key={convertedAmount}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        {getCurrencyData(toCurrency).symbol} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </motion.span>
                    )}
                  </div>
                  <div className="absolute right-0 bottom-4 flex items-center gap-2">
                    <button 
                      onClick={() => setShowToDropdown(!showToDropdown)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-2xl">{getCurrencyData(toCurrency).flag}</span>
                      <span className="font-bold">{toCurrency}</span>
                      <ChevronDown size={16} className="opacity-50" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-3">
                <button 
                  onClick={handleConvert}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold shadow-lg shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <Zap size={20} />
                  Convert Now
                </button>
                <button 
                  onClick={handleReset}
                  className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`}
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="flex gap-2">
                <button onClick={handleCopy} className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`} title="Copy Result">
                  <Copy size={18} />
                </button>
                <button onClick={speakResult} className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/5 hover:bg-black/10'}`} title="Voice Output">
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

            {/* Rate Info & Sparkline */}
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 opacity-60">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span className="text-sm">1 {fromCurrency} = {rates[toCurrency]?.toFixed(4)} {toCurrency}</span>
                </div>
                {/* Sparkline Visual */}
                <svg width="80" height="20" className="opacity-40">
                  <path 
                    d="M0 15 Q 10 5, 20 12 T 40 8 T 60 15 T 80 5" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="text-emerald-500"
                  />
                </svg>
              </div>
              <div className="flex items-center gap-2 opacity-40 text-xs">
                <Globe size={12} />
                <span>Last updated: {lastUpdated}</span>
              </div>
            </div>
          </motion.div>

          {/* Popular Currencies Quick Access */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favorites.map(code => {
              const data = getCurrencyData(code);
              return (
                <motion.button
                  key={code}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    if (fromCurrency !== code) setToCurrency(code);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/5 shadow-sm hover:shadow-md'}`}
                >
                  {code === 'INR' && (
                    <motion.div 
                      animate={{ opacity: [0, 0.2, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-orange-500/20 pointer-events-none"
                    />
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{data.flag}</span>
                    <TrendingUp size={14} className="text-emerald-500 opacity-50" />
                  </div>
                  <div className="font-bold">{code}</div>
                  <div className="text-xs opacity-50">{data.name}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Did You Know? Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-6 rounded-3xl border flex gap-4 items-start ${darkMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'}`}
          >
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
              <Sparkles className="text-blue-500" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold mb-1">Financial Insight</h4>
              <p className="text-sm opacity-70 leading-relaxed">{fact}</p>
            </div>
          </motion.div>
        </section>

        {/* Sidebar: History & Favorites */}
        <aside className="space-y-8">
          {/* History */}
          <div className={`p-6 rounded-[32px] border h-fit ${darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={18} className="opacity-50" />
                <h3 className="font-bold">Recent Activity</h3>
              </div>
              <button onClick={() => setHistory([])} className="text-xs opacity-40 hover:opacity-100 transition-opacity">Clear</button>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {history.length === 0 ? (
                  <div className="py-12 text-center opacity-30 text-sm">No recent conversions</div>
                ) : (
                  history.map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-black/5'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium opacity-50">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-xs font-bold text-emerald-500">Success</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="font-bold">
                          {item.amount} {item.from}
                        </div>
                        <div className="text-lg font-black">
                          {item.result.toFixed(2)} {item.to}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* All Currencies List / Search */}
          <div className={`p-6 rounded-[32px] border h-fit ${darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-black/5 shadow-xl shadow-black/5'}`}>
            <div className="flex items-center gap-2 mb-6">
              <Star size={18} className="text-amber-400" />
              <h3 className="font-bold">Market Watch</h3>
            </div>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
              <input 
                type="text"
                placeholder="Search currency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:border-emerald-500' : 'bg-slate-50 border-black/5 focus:border-emerald-500'}`}
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredCurrencies.map(c => (
                <div 
                  key={c.code}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <div>
                      <div className="text-sm font-bold">{c.code}</div>
                      <div className="text-[10px] opacity-40 uppercase tracking-wider">{c.name}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleFavorite(c.code)}
                    className={`p-2 rounded-lg transition-all ${favorites.includes(c.code) ? 'text-amber-400 opacity-100' : 'opacity-0 group-hover:opacity-30 hover:opacity-100'}`}
                  >
                    <Star size={14} fill={favorites.includes(c.code) ? "currentColor" : "none"} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Dropdown Modals */}
      <AnimatePresence>
        {(showFromDropdown || showToDropdown) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowFromDropdown(false); setShowToDropdown(false); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md max-h-[80vh] overflow-hidden rounded-[40px] border z-[101] shadow-2xl ${darkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-black/5'}`}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Select Currency</h2>
                  <button onClick={() => { setShowFromDropdown(false); setShowToDropdown(false); }} className="p-2 opacity-50 hover:opacity-100 transition-opacity">
                    <RotateCcw size={20} />
                  </button>
                </div>
                
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by name or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-12 pr-6 py-4 rounded-2xl text-lg border focus:outline-none transition-all ${darkMode ? 'bg-white/5 border-white/10 focus:border-emerald-500' : 'bg-slate-50 border-black/5 focus:border-emerald-500'}`}
                  />
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                  {filteredCurrencies.map(c => (
                    <button 
                      key={c.code}
                      onClick={() => {
                        if (showFromDropdown) setFromCurrency(c.code);
                        else setToCurrency(c.code);
                        setShowFromDropdown(false);
                        setShowToDropdown(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${darkMode ? 'hover:bg-white/5' : 'hover:bg-black/5'} ${(showFromDropdown ? fromCurrency : toCurrency) === c.code ? (darkMode ? 'bg-white/10' : 'bg-black/5') : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{c.flag}</span>
                        <div className="text-left">
                          <div className="font-bold text-lg">{c.code}</div>
                          <div className="text-xs opacity-50">{c.name}</div>
                        </div>
                      </div>
                      {(showFromDropdown ? fromCurrency : toCurrency) === c.code && (
                        <Check className="text-emerald-500" size={20} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(128, 128, 128, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(128, 128, 128, 0.4);
        }
      `}</style>
    </div>
  );
}
