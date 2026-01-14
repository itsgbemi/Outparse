
import React, { useRef, useState, useEffect } from 'react';
import { Suggestion, EditorialTone } from '../types';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  isLoading: boolean;
  onPaste: () => void;
  onTrySample: () => void;
  suggestions: Suggestion[];
  tone: EditorialTone;
  onToneChange: (tone: EditorialTone) => void;
  onApplySuggestion: (suggestion: Suggestion) => void;
  onIgnoreSuggestion: (suggestion: Suggestion) => void;
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  isLoading, 
  onPaste, 
  onTrySample, 
  suggestions,
  tone,
  onToneChange,
  onApplySuggestion,
  onIgnoreSuggestion
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLTextAreaElement> | React.FocusEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current) return;
    const cursorIndex = textareaRef.current.selectionStart;
    const found = suggestions.find(s => 
      cursorIndex >= s.index && cursorIndex <= s.index + s.original.length
    );
    if (found) {
      setActiveSuggestion(found);
      const rect = textareaRef.current.getBoundingClientRect();
      const top = Math.max(10, e.clientY - rect.top - 240);
      const left = Math.max(10, Math.min(rect.width - 340, e.clientX - rect.left - 40));
      setPopoverPos({ top, left });
    } else {
      setActiveSuggestion(null);
    }
  };

  const getCategoryTheme = (category: string) => {
    const themes: Record<string, { dot: string; idle: string; active: string }> = {
      Grammar: { dot: 'bg-red-500', idle: 'border-red-400/80 hover:border-red-600', active: 'border-red-500 bg-red-50' },
      Style: { dot: 'bg-indigo-500', idle: 'border-indigo-400/80 hover:border-indigo-600', active: 'border-indigo-500 bg-indigo-50' },
      Clarity: { dot: 'bg-amber-500', idle: 'border-amber-400/80 hover:border-amber-600', active: 'border-amber-500 bg-amber-50' },
      Tone: { dot: 'bg-purple-500', idle: 'border-purple-400/80 hover:border-purple-600', active: 'border-purple-500 bg-purple-50' },
      Vocabulary: { dot: 'bg-emerald-500', idle: 'border-emerald-400/80 hover:border-emerald-600', active: 'border-emerald-500 bg-emerald-50' },
    };
    return themes[category] || themes.Grammar;
  };

  const renderHighlightedText = () => {
    if (!suggestions.length || !value) return value;
    const sorted = [...suggestions].sort((a, b) => a.index - b.index);
    let lastIndex = 0;
    const parts = [];
    sorted.forEach((s, i) => {
      const theme = getCategoryTheme(s.category);
      parts.push(value.substring(lastIndex, s.index));
      parts.push(
        <span 
          key={s.id + i} 
          className={`border-b-2 transition-all cursor-pointer ${
            activeSuggestion?.id === s.id ? theme.active : theme.idle
          }`}
          style={{ textDecoration: 'none' }}
        >
          {value.substring(s.index, s.index + s.original.length)}
        </span>
      );
      lastIndex = s.index + s.original.length;
    });
    parts.push(value.substring(lastIndex));
    return parts;
  };

  const getContextSentence = (s: Suggestion) => {
    const start = Math.max(0, value.lastIndexOf('.', s.index) + 1);
    const end = value.indexOf('.', s.index + s.original.length);
    const sentenceEnd = end === -1 ? value.length : end + 1;
    const sentence = value.substring(start, sentenceEnd).trim();
    const errorPosInSentence = s.index - start;
    return (
      <div className="text-[12px] text-slate-400 leading-relaxed font-normal">
        {sentence.substring(0, errorPosInSentence)}
        <span className="text-red-500/70 line-through decoration-red-500/20">{s.original}</span>
        <span className="text-emerald-600/80 font-bold ml-1">{s.replacement}</span>
        {sentence.substring(errorPosInSentence + s.original.length)}
      </div>
    );
  };

  const toneOptions: EditorialTone[] = ['Professional', 'Casual', 'Academic', 'Creative', 'Urgent'];

  return (
    <div className="relative flex-1 flex flex-col min-h-[550px] bg-white rounded-[12px]">
      {/* Top Bar - Enhanced Pill Selects */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white z-10 flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Language Selector with CIRCLE Flag */}
          <div className="relative group">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-full pl-1.5 pr-8 py-1.5 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer shadow-sm">
              <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-100 text-[12px] leading-none select-none shadow-sm">
                🇺🇸
              </div>
              <span className="text-[13px] font-bold text-slate-700 uppercase">EN-US</span>
              <select className="absolute inset-0 opacity-0 cursor-pointer w-full">
                <option>🇺🇸 EN-US</option>
                <option>🇬🇧 EN-UK</option>
              </select>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative group">
            <select 
              value={tone}
              onChange={(e) => onToneChange(e.target.value as EditorialTone)}
              className="text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-full pl-5 pr-9 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer appearance-none shadow-sm"
            >
              {toneOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-indigo-500 animate-pulse bg-indigo-50 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
            Analyzing content...
          </div>
        )}
      </div>

      <div className="flex-1 relative bg-white overflow-hidden rounded-b-[12px]">
        <div 
          ref={backdropRef}
          className="absolute inset-0 p-10 text-[18px] font-normal leading-[1.8] text-transparent whitespace-pre-wrap break-words pointer-events-none overflow-auto select-none"
          style={{ fontKerning: 'normal' }}
        >
          {renderHighlightedText()}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onClick={handleEditorClick}
          onKeyUp={handleEditorClick}
          placeholder="Start writing or paste your text here..."
          className="absolute inset-0 w-full h-full p-10 text-[18px] leading-[1.8] text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none bg-transparent font-normal overflow-auto"
          spellCheck={false}
        />

        {activeSuggestion && (
          <div 
            className="absolute z-50 bg-white border border-slate-200 rounded-[32px] shadow-[0_25px_60px_rgba(0,0,0,0.15)] p-7 w-[340px] animate-in fade-in zoom-in-95 duration-200"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${getCategoryTheme(activeSuggestion.category).dot}`}></div>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{activeSuggestion.category}</h4>
              </div>
              <button onClick={() => setActiveSuggestion(null)} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-5 mb-7">
              <div className="flex flex-col">
                <div className="text-red-500/50 line-through text-lg font-semibold leading-tight mb-1">{activeSuggestion.original}</div>
                <div className="text-emerald-600 font-extrabold text-2xl leading-tight">{activeSuggestion.replacement}</div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                <p className="text-[13px] text-slate-600 mb-3 italic leading-relaxed">"{activeSuggestion.explanation}"</p>
                {getContextSentence(activeSuggestion)}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => { onApplySuggestion(activeSuggestion); setActiveSuggestion(null); }}
                className="flex-1 py-3.5 bg-emerald-600 text-white font-bold text-sm rounded-full hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
              >
                Accept
              </button>
              <button 
                onClick={() => { onIgnoreSuggestion(activeSuggestion); setActiveSuggestion(null); }}
                className="px-6 py-3.5 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        )}

        {!value && (
          <div className="absolute inset-x-0 top-[110px] flex justify-center pointer-events-none p-4">
            <div className="flex flex-row items-center gap-3 pointer-events-auto flex-wrap justify-center">
              <button 
                onClick={onTrySample} 
                className="flex items-center gap-2.5 px-4.5 py-2 border border-slate-200 text-slate-600 font-bold text-[12px] rounded-full hover:bg-slate-50 hover:border-indigo-300 transition-all bg-white shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Try example text
              </button>
              <button 
                onClick={onPaste} 
                className="flex items-center gap-2.5 px-4.5 py-2 border border-slate-200 text-slate-600 font-bold text-[12px] rounded-full hover:bg-slate-50 hover:border-indigo-300 transition-all bg-white shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.5 4h1.59c.2.58.76 1 1.41 1h3c.65 0 1.2-.42 1.41-1h1.59c.28 0 .5.22.5.5v1a.5.5 0 001 0v-1c0-.83-.67-1.5-1.5-1.5h-1.59c-.2-.58-.76-1-1.41-1h-3c-.65 0-1.2.42-1.41 1H4.5C3.67 3 3 3.67 3 4.5v12c0 .83.67 1.5 1.5 1.5h3a.5.5 0 000-1h-3a.5.5 0 01-.5-.5v-12c0-.28.22-.5.5-.5zm3 0a.5.5 0 010-1h3a.5.5 0 010 1h-3zm3 3C9.67 7 9 7.67 9 8.5v8c0 .83.67 1.5 1.5 1.5h5c.83 0 1.5-.67 1.5-1.5v-8c0-.83-.67-1.5-1.5-1.5h-5zM10 8.5c0-.28.22-.5.5-.5h5c.28 0 .5.22.5.5v8a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5v-8z" />
                </svg>
                Paste text
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
