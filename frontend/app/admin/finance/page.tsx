"use client";

import { motion } from "framer-motion";
import { DollarSign, CreditCard, ArrowRight, Wallet, PieChart } from 'lucide-react';
import Link from "next/link";

export default function FinanceOverview() {
  const cards = [
    { 
      title: "Fee Management", 
      desc: "Manage student dues, collections, and fee structures.",
      href: "/admin/finance/fees", 
      icon: DollarSign,
      color: "bg-emerald-500",
      stats: "₹42.5L Collected"
    },
    { 
      title: "Staff Salary", 
      desc: "Process payroll, bonuses, and salary disbursements.",
      href: "/admin/finance/salary", 
      icon: CreditCard,
      color: "bg-rose-500",
      stats: "₹18.4L Payout"
    }
  ];

  return (
    <div className="p-6 lg:p-10 max-w-[1200px] mx-auto min-h-[80vh] flex flex-col justify-center">
      
      <div className="text-center mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6"
        >
          <Wallet className="w-10 h-10" />
        </motion.div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Finance Department</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto">Select a module to manage school accounts, student fees, or staff payroll.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card, idx) => (
          <Link href={card.href} key={idx}>
            <motion.div 
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-rose-500 transition-all cursor-pointer group h-full flex flex-col justify-between"
            >
              <div>
                <div className={`w-14 h-14 ${card.color} text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-current/20`}>
                  <card.icon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  {card.title}
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-2 transition-all" />
                </h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">{card.desc}</p>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <PieChart className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{card.stats}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

    </div>
  );
}
