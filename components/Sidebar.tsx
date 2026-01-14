
import React from 'react';
import { Suggestion, SuggestionCategory, ProofreadingResult } from '../types';

interface SidebarProps {
  result: ProofreadingResult | null;
  onApplyAll: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ result, onApplyAll }) => {
  if (!result) return null;

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Analysis Summary
          </h3>
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
            {result.stats.level}
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500">Readability</span>
            <span className="text-slate-900">{result.stats.score}/100</span>
          </div>
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500">Tone Detected</span>
            <span className="text-indigo-600 font-bold">{result.overallTone}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-sm font-bold text-slate-800">
            {result.suggestions.length} Improvements
          </h3>
          <button 
            onClick={onApplyAll}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Apply All
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
          {result.suggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-white hover:border-indigo-200 transition-all">
              <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2">{suggestion.category}</div>
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="text-slate-400 line-through">{suggestion.original}</span>
                <span className="text-indigo-600 font-bold px-1.5 py-0.5 bg-indigo-50 rounded">
                  {suggestion.replacement}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{suggestion.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
