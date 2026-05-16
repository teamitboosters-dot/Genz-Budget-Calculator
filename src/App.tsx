/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Zap, TrendingUp, TrendingDown, DollarSign, Sun, Moon, Download } from 'lucide-react';

type Transaction = {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
};

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('isDark');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'PKR';
  });

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const remaining = income - expenses;

  useEffect(() => {
    localStorage.setItem('isDark', JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const exportToCSV = () => {
    const headers = ['Name', 'Amount', 'Type', 'Currency'];
    const rows = transactions.map(t => [t.name, t.amount, t.type, currency]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `budget_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const addTransaction = () => {
    if (!name || !amount) return;
    setTransactions([
      ...transactions,
      { id: Date.now().toString(), name, amount: parseFloat(amount), type },
    ]);
    setName('');
    setAmount('');
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const getVibeStatus = () => {
    if (remaining > 500) return { text: "Main Character Energy", color: "text-emerald-600 dark:text-emerald-400" };
    if (remaining > 0) return { text: "Doing Okay Bestie", color: "text-cyan-700 dark:text-cyan-400" };
    return { text: "Bro Is Broke", color: "text-rose-600 dark:text-rose-500" };
  };

  const vibe = getVibeStatus();

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-fuchsia-900 text-neutral-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-500">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <header className="flex flex-wrap justify-between items-center border-b border-neutral-300 dark:border-white/10 pb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold track-tight text-neutral-950 dark:text-white flex items-center gap-2">
            <Zap className="text-yellow-500 dark:text-yellow-300 shrink-0" />
            Gen Z Budget Calculator
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10">
                {isDark ? <Sun className="text-yellow-300" /> : <Moon className="text-indigo-900" />}
            </button>
            <select
              className="bg-neutral-200 dark:bg-white/10 p-2 rounded-xl text-neutral-900 dark:text-white outline-none border border-neutral-300 dark:border-white/20"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`px-4 py-2 rounded-full bg-neutral-200/50 dark:bg-white/10 backdrop-blur-md border border-neutral-300 dark:border-white/20 font-semibold shadow-lg ${vibe.color}`}
            >
              {vibe.text}
            </motion.div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SummaryCard title="Total Income" amount={income} currency={currency} icon={<TrendingUp className="text-emerald-600 dark:text-emerald-300 w-6 h-6" />} />
          <SummaryCard title="Total Expenses" amount={expenses} currency={currency} icon={<TrendingDown className="text-rose-600 dark:text-rose-300 w-6 h-6" />} />
          <SummaryCard title="Remaining" amount={remaining} currency={currency} icon={<DollarSign className="text-cyan-600 dark:text-cyan-300 w-6 h-6" />} />
        </section>

        <section className="bg-white dark:bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-neutral-200 dark:border-white/10 space-y-6 shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="What's the vibe?"
              className="sm:col-span-2 lg:col-span-2 bg-neutral-100 dark:bg-black/20 p-4 rounded-xl border border-neutral-300 dark:border-white/10 focus:ring-2 focus:ring-pink-500 outline-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-white/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount"
              className="bg-neutral-100 dark:bg-black/20 p-4 rounded-xl border border-neutral-300 dark:border-white/10 focus:ring-2 focus:ring-pink-500 outline-none text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-white/50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select
              className="bg-neutral-100 dark:bg-black/20 p-4 rounded-xl border border-neutral-300 dark:border-white/10 focus:ring-2 focus:ring-pink-500 outline-none text-neutral-900 dark:text-white"
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            >
              <option value="expense" className="bg-white dark:bg-purple-900">Expense</option>
              <option value="income" className="bg-white dark:bg-purple-900">Income</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addTransaction}
              className="lg:col-span-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold p-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              <Plus /> Add Vibe
            </motion.button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-display font-semibold text-neutral-900 dark:text-white/90">Transactions</h2>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-neutral-200 dark:bg-white/10 px-4 py-2 rounded-xl hover:bg-neutral-300 dark:hover:bg-white/20 transition-colors"
            >
              <Download size={18} /> Export CSV
            </button>
          </div>
          <AnimatePresence>
            {transactions.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-neutral-200 dark:border-white/10 flex justify-between items-center shadow-lg"
              >
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">{t.name}</p>
                  <p className="text-sm text-neutral-500 dark:text-white/50 capitalize">{t.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                    {t.type === 'income' ? `+ ${currency} ` : `- ${currency} `}{t.amount.toFixed(2)}
                  </span>
                  <motion.button 
                    whileHover={{ scale: 1.2, color: '#f43f5e' }}
                    onClick={() => removeTransaction(t.id)} 
                    className="text-neutral-400 dark:text-white/40"
                  >
                    <Trash2 />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </motion.div>
    </div>
  );
}

function SummaryCard({ title, amount, currency, icon }: { title: string; amount: number; currency: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-neutral-200 dark:border-white/10 space-y-2 shadow-lg hover:shadow-cyan-500/10 transition-all"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-neutral-500 dark:text-indigo-200 text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-display font-bold text-neutral-900 dark:text-white">{currency} {amount.toFixed(2)}</p>
    </motion.div>
  );
}

