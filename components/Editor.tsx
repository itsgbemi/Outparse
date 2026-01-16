
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
  onApplyAll: () => void;
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
  onIgnoreSuggestion,
  onApplyAll
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (!value) return;
    onChange('');
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

  const toneOptions: EditorialTone[] = ['Professional', 'Casual', 'Academic', 'Creative', 'Urgent'];

  return (
    <div className="relative flex-1 flex flex-col min-h-[500px] bg-white rounded-t-[25px] border border-white/20">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50 bg-white z-20 rounded-t-[25px]">
        <div className="flex-1">
          {isLoading && (
            <div className="text-[12px] font-bold text-emerald-600 animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              Checking...
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-0.5">
          {/* Copy Icon with conditional success state */}
          <button 
            onClick={handleCopy}
            disabled={!value}
            className={`p-2 transition-colors flex items-center justify-center ${value ? 'text-slate-600 hover:text-slate-900' : 'text-slate-200 cursor-not-allowed'}`}
            title="Copy text"
          >
            {copied ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="check-circle">
                  <path id="vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z" fill="#10b981"></path>
                  <path id="vector (Stroke)_2" fillRule="evenodd" clipRule="evenodd" d="M16.5303 8.96967C16.8232 9.26256 16.8232 9.73744 16.5303 10.0303L11.9041 14.6566C11.2207 15.34 10.1126 15.34 9.42923 14.6566L7.46967 12.697C7.17678 12.4041 7.17678 11.9292 7.46967 11.6363C7.76256 11.3434 8.23744 11.3434 8.53033 11.6363L10.4899 13.5959C10.5875 13.6935 10.7458 13.6935 10.8434 13.5959L15.4697 8.96967C15.7626 8.67678 16.2374 8.67678 16.5303 8.96967Z" fill="#10b981"></path>
                </g>
              </svg>
            ) : (
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ display: 'block' }}><path d="M5.5 4.63V17.25c0 1.8 1.46 3.25 3.25 3.25h8.62c-.31.88-1.15 1.5-2.13 1.5H8.75A4.75 4.75 0 014 17.25V6.75c0-.98.63-1.81 1.5-2.12zM17.75 2C18.99 2 20 3 20 4.25v13c0 1.24-1 2.25-2.25 2.25h-9c-1.24 0-2.25-1-2.25-2.25v-13C6.5 3.01 7.5 2 8.75 2h9zm0 1.5h-9a.75.75 0 00-.75.75v13c0 .41.34.75.75.75h9c.41 0 .75-.34.75-.75v-13a.75.75 0 00-.75-.75z" fill="currentColor"></path></svg>
            )}
          </button>
          
          {/* Delete Icon */}
          <button 
            onClick={handleDelete}
            disabled={!value}
            className={`p-2 transition-colors ${value ? 'text-slate-600 hover:text-rose-500' : 'text-slate-200 cursor-not-allowed'}`}
            title="Delete all"
          >
            <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ display: 'block' }}><path d="M10 5h4a2 2 0 10-4 0zM8.5 5a3.5 3.5 0 117 0h5.75a.75.75 0 010 1.5h-1.32l-1.17 12.11A3.75 3.75 0 0115.03 22H8.97a3.75 3.75 0 01-3.73-3.39L4.07 6.5H2.75a.75.75 0 010-1.5H8.5zm2 4.75a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM14.25 9c.41 0 .75.34.75.75v7.5a.75.75 0 01-1.5 0v-7.5c0-.41.34-.75.75-.75zm-7.52 9.47a2.25 2.25 0 002.24 2.03h6.06c1.15 0 2.12-.88 2.24-2.03L18.42 6.5H5.58l1.15 11.97z" fill="currentColor"></path></svg>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
            
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-30 animate-in fade-in zoom-in-95">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Language</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tone</label>
                    <div className="grid grid-cols-1 gap-1">
                      {toneOptions.map(t => (
                        <button 
                          key={t}
                          onClick={() => { onToneChange(t); setShowSettings(false); }}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${tone === t ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-white overflow-hidden min-h-[400px]">
        <div 
          ref={backdropRef}
          className="absolute inset-0 p-8 text-[18px] font-normal leading-[1.8] text-transparent whitespace-pre-wrap break-words pointer-events-none overflow-auto select-none"
        >
          {renderHighlightedText()}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 500))}
          onScroll={handleScroll}
          onClick={handleEditorClick}
          onKeyUp={handleEditorClick}
          placeholder="Start writing or paste your text here..."
          className="absolute inset-0 w-full h-full p-8 text-[18px] leading-[1.8] text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none bg-transparent font-normal overflow-auto"
          spellCheck={false}
        />

        {activeSuggestion && (
          <div 
            className="absolute z-50 bg-white border border-slate-200 rounded-[24px] shadow-2xl p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200"
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getCategoryTheme(activeSuggestion.category).dot}`}></div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeSuggestion.category}</h4>
              </div>
              <button onClick={() => setActiveSuggestion(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex flex-col">
                <div className="text-red-500/50 line-through text-base font-semibold mb-1">{activeSuggestion.original}</div>
                <div className="text-emerald-600 font-extrabold text-xl">{activeSuggestion.replacement}</div>
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed italic border-t border-slate-50 pt-3">"{activeSuggestion.explanation}"</p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => { onApplySuggestion(activeSuggestion); setActiveSuggestion(null); }}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold text-xs rounded-full hover:bg-emerald-700 transition-all active:scale-95"
              >
                Accept
              </button>
              <button 
                onClick={() => { onIgnoreSuggestion(activeSuggestion); setActiveSuggestion(null); }}
                className="px-4 py-3 text-slate-400 font-bold text-xs hover:text-slate-900 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        )}

        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
              <button 
                onClick={onTrySample} 
                className="flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="#1C274C" strokeWidth="1.5"></path>
                  <path d="M8 10H16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M8 14H13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                </svg>
                Try sample text
              </button>
              <button 
                onClick={onPaste} 
                className="flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 4.00195C18.175 4.01406 19.3529 4.11051 20.1213 4.87889C21 5.75757 21 7.17179 21 10.0002V16.0002C21 18.8286 21 20.2429 20.1213 21.1215C19.2426 22.0002 17.8284 22.0002 15 22.0002H9C6.17157 22.0002 4.75736 22.0002 3.87868 21.1215C3 20.2429 3 18.8286 3 16.0002V10.0002C3 7.17179 3 5.75757 3.87868 4.87889C4.64706 4.11051 5.82497 4.01406 8 4.00195" stroke="#1C274C" strokeWidth="1.5"></path>
                  <path d="M10.5 14L17 14" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M7 14H7.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M7 10.5H7.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M7 17.5H7.5" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M10.5 10.5H17" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M10.5 17.5H17" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M8 3.5C8 2.67157 8.67157 2 9.5 2H14.5C15.3284 2 16 2.67157 16 3.5V4.5C16 5.32843 15.3284 6 14.5 6H9.5C8.67157 6 8 5.32843 8 4.5V3.5Z" stroke="#1C274C" strokeWidth="1.5"></path>
                </svg>
                Paste text
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="px-8 py-6 border-t border-slate-50 bg-white flex flex-col items-center gap-4 rounded-b-[25px]">
        <button 
          onClick={onApplyAll}
          disabled={suggestions.length === 0}
          className={`w-full py-4 rounded-full text-base font-bold transition-all shadow-lg active:scale-[0.98] ${suggestions.length > 0 ? 'bg-slate-900 text-white hover:bg-black shadow-black/10' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
        >
          Apply all
        </button>
        
        <div className="text-[12px] font-bold text-slate-300">
          {value.length}/500 characters
        </div>
      </div>
    </div>
  );
};

export default Editor;
