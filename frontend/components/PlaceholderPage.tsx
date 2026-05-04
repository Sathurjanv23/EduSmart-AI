import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PlaceholderProps {
  title: string;
  description: string;
  features: string[];
}

export function PlaceholderPage({ title, description, features }: PlaceholderProps) {
  return (
    <div className="mx-auto max-w-4xl py-12">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl sm:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>
        
        <p className="text-lg leading-8 text-slate-600 dark:text-slate-300 mb-8">
          {description}
        </p>

        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Upcoming Features in this Module
          </h3>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                  <ArrowRight className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex justify-end">
          <div className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Module Architecture Prepared
          </div>
        </div>
      </div>
    </div>
  );
}
