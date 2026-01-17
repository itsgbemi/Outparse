
import React, { useRef, useState, useEffect } from 'react';
import { Suggestion, EditorialTone } from '../types';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  isLoading: boolean;
  credits: number;
  onUploadDoc: () => void;
  onTrySample: () => void;
  suggestions: Suggestion[];
  tone: EditorialTone;
  onToneChange: (tone: EditorialTone) => void;
  onApplySuggestion: (suggestion: Suggestion) => void;
  onIgnoreSuggestion: (suggestion: Suggestion) => void;
  onFixGrammar: () => void;
}

const Tooltip: React.FC<{ text: string; visible: boolean }> = ({ text, visible }) => (
  <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 transition-all duration-200 pointer-events-none z-[80] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
    <div className="bg-white border border-slate-200 text-slate-800 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm whitespace-nowrap">
      {text}
    </div>
  </div>
);

const Editor: React.FC<EditorProps> = ({ 
  value, onChange, isLoading, credits, onUploadDoc, onTrySample, suggestions, tone, onToneChange, 
  onApplySuggestion, onIgnoreSuggestion, onFixGrammar 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.docx')) {
      try {
        const mammoth = await import("https://esm.sh/mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onChange(result.value.slice(0, 2000));
      } catch (err) {
        console.error("Error reading docx", err);
        alert("Failed to read .docx file. Please try a .txt file.");
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content.slice(0, 2000));
      };
      reader.readAsText(file);
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditorClick = (e: any) => {
    if (!textareaRef.current) return;
    const cursorIndex = textareaRef.current.selectionStart;
    const found = suggestions.find(s => cursorIndex >= s.index && cursorIndex <= s.index + s.original.length);
    if (found) {
      setActiveSuggestion(found);
      const rect = textareaRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      setPopoverPos({ 
        top: Math.max(10, Math.min(rect.height - 200, clickY - 180)), 
        left: Math.max(10, Math.min(rect.width - 340, clickX - 20)) 
      });
    } else {
      setActiveSuggestion(null);
    }
  };

  const renderHighlightedText = () => {
    if (!value) return null;
    if (!suggestions.length) return value;
    
    const sorted = [...suggestions].sort((a, b) => a.index - b.index);
    let lastIndex = 0;
    const parts = [];
    
    sorted.forEach((s, i) => {
      parts.push(value.substring(lastIndex, s.index));
      parts.push(
        <span key={i} className="border-b-2 border-red-500 bg-red-100/40 rounded-sm">
          {value.substring(s.index, s.index + s.original.length)}
        </span>
      );
      lastIndex = s.index + s.original.length;
    });
    
    parts.push(value.substring(lastIndex));
    return parts;
  };

  const toneOptions: EditorialTone[] = ['Professional', 'Casual', 'Academic', 'Creative', 'Urgent'];

  const sharedStyles: React.CSSProperties = {
    fontFamily: "'Arimo', sans-serif",
    fontSize: '18px',
    lineHeight: '1.8',
    padding: '32px',
    borderWidth: '0px',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textTransform: 'none',
  };

  const hasText = value.length > 0;

  return (
    <div className="flex flex-col min-h-[500px] bg-white rounded-t-[25px] relative font-arimo">
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 512 512" fill="#FFD700">
            <g>
              <path d="M262.203,224.297H257.5h-99.469L78.672,333.438L260.719,512l7.5-7.359L442.75,333.438l-79.344-109.141H262.203 z M345.813,245.75l-14.656,65.109l-51.859-65.109H345.813z M259.984,251.953l56.422,70.797H204.766L259.984,251.953z M240.75,245.75l-50.563,64.844v0.016l-14.563-64.859H240.75z M159.188,259.156L159.188,259.156l14.297,63.594h-60.547 L159.188,259.156z M179.25,341.75l50.063,109.422L117.75,341.75H179.25z M260.719,474.172L200.125,341.75h121.172L260.719,474.172z M292.109,451.172l50.063-109.422h61.484L292.109,451.172z M347.938,322.75l14.313-63.594l0,0l46.234,63.594H347.938z"></path>
              <path d="M501.219,181.906c-25.906,0-34.859-6.5-39.906-11.531c-5.016-5.047-11.531-14-11.531-39.906 c0-0.984-0.094-3.781-3.188-3.781c-3.078,0-3.188,2.797-3.188,3.781c0,25.906-6.516,34.859-11.547,39.906 c-5.047,5.031-14.016,11.531-39.891,11.531c-1,0-3.781,0.109-3.781,3.203c0,3.078,2.781,3.188,3.781,3.188 c25.875,0,34.844,6.516,39.891,11.547c5.031,5.031,11.547,14,11.547,39.906c0,1,0.109,3.766,3.188,3.766 c3.094,0,3.188-2.766,3.188-3.766c0-25.906,6.516-34.875,11.531-39.906c5.047-5.047,14-11.547,39.906-11.547 c1,0,3.781-0.094,3.781-3.203C505,182.031,502.219,181.906,501.219,181.906z"></path>
              <path d="M115.891,84.656c35.609,0,47.922,8.969,54.844,15.875c6.922,6.922,15.859,19.25,15.859,54.859 c0,1.359,0.188,5.172,4.406,5.172c4.25,0,4.375-3.813,4.375-5.172c0-35.609,8.953-47.938,15.875-54.859 c6.906-6.922,19.219-15.875,54.844-15.875c1.359,0,5.188-0.125,5.188-4.375c0-4.219-3.828-4.406-5.188-4.406 c-35.625,0-47.938-8.938-54.844-15.844c-6.922-6.938-15.875-19.234-15.875-54.844C195.375,3.828,195.25,0,191,0 c-4.219,0-4.406,3.828-4.406,5.188c0,35.609-8.938,47.906-15.859,54.844c-6.922,6.906-19.234,15.844-54.844,15.844 c-1.359,0-5.188,0.172-5.188,4.406C110.703,84.5,114.531,84.656,115.891,84.656z"></path>
              <path d="M114.453,196c0-2.828-2.563-2.938-3.469-2.938c-23.828,0-32.078-5.984-36.703-10.609 c-4.625-4.641-10.625-12.875-10.625-36.703c0-0.906-0.094-3.469-2.938-3.469c-2.813,0-2.938,2.563-2.938,3.469 c0,23.828-5.984,32.063-10.609,36.703c-4.641,4.625-12.891,10.609-36.703,10.609C9.547,193.063,7,193.172,7,196 s2.547,2.938,3.469,2.938c23.813,0,32.063,6,36.703,10.625c4.625,4.625,10.609,12.875,10.609,36.719 c0,0.906,0.125,3.453,2.938,3.453c2.844,0,2.938-2.547,2.938-3.453c0-23.844,6-32.094,10.625-36.719 c4.625-4.641,12.875-10.625,36.703-10.625C111.891,198.938,114.453,198.844,114.453,196z"></path>
            </g>
          </svg>
          <span className="text-[13px] font-black text-slate-900 tracking-tight">{credits} credits</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button 
              onClick={handleCopy} 
              onMouseEnter={() => setHoveredBtn('copy')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={!hasText || isLoading}
              className={`p-2 transition-colors ${!hasText || isLoading ? 'text-slate-200 cursor-not-allowed' : 'text-slate-900 hover:text-emerald-600'}`}
            >
              {copied ? (
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="style=stroke">
                    <g id="check-circle">
                      <path id="vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M12 2.75C6.89137 2.75 2.75 6.89137 2.75 12C2.75 17.1086 6.89137 21.25 12 21.25C17.1086 21.25 21.25 17.1086 21.25 12C21.25 6.89137 17.1086 2.75 12 2.75ZM1.25 12C1.25 6.06294 6.06294 1.25 12 1.25C17.9371 1.25 22.75 6.06294 22.75 12C22.75 17.9371 17.9371 22.75 12 22.75C6.06294 22.75 1.25 17.9371 1.25 12Z" fill="#2ba37b"></path>
                      <path id="vector (Stroke)_2" fillRule="evenodd" clipRule="evenodd" d="M16.5303 8.96967C16.8232 9.26256 16.8232 9.73744 16.5303 10.0303L11.9041 14.6566C11.2207 15.34 10.1126 15.34 9.42923 14.6566L7.46967 12.697C7.17678 12.4041 7.17678 11.9292 7.46967 11.6363C7.76256 11.3434 8.23744 11.3434 8.53033 11.6363L10.4899 13.5959C10.5875 13.6935 10.7458 13.6935 10.8434 13.5959L15.4697 8.96967C15.7626 8.67678 16.2374 8.67678 16.5303 8.96967Z" fill="#2ba37b"></path>
                    </g>
                  </g>
                </svg>
              ) : (
                <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ display: 'block' }}>
                  <path d="M5.5 4.63V17.25c0 1.8 1.46 3.25 3.25 3.25h8.62c-.31.88-1.15 1.5-2.13 1.5H8.75A4.75 4.75 0 014 17.25V6.75c0-.98.63-1.81 1.5-2.12zM17.75 2C18.99 2 20 3 20 4.25v13c0 1.24-1 2.25-2.25 2.25h-9c-1.24 0-2.25-1-2.25-2.25v-13C6.5 3.01 7.5 2 8.75 2h9zm0 1.5h-9a.75.75 0 00-.75.75v13c0 .41.34.75.75.75h9c.41 0 .75-.34.75-.75v-13a.75.75 0 00-.75-.75z" fill="currentColor"></path>
                </svg>
              )}
            </button>
            <Tooltip text={copied ? "Copied!" : "Copy text"} visible={hoveredBtn === 'copy'} />
          </div>

          <div className="relative">
            <button 
              onClick={() => onChange('')} 
              onMouseEnter={() => setHoveredBtn('delete')}
              onMouseLeave={() => setHoveredBtn(null)}
              disabled={!hasText || isLoading}
              className={`p-2 transition-colors ${!hasText || isLoading ? 'text-slate-200 cursor-not-allowed' : 'text-slate-900 hover:text-red-500'}`}
            >
              <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false" style={{ display: 'block' }}>
                <path d="M10 5h4a2 2 0 10-4 0zM8.5 5a3.5 3.5 0 117 0h5.75a.75.75 0 010 1.5h-1.32l-1.17 12.11A3.75 3.75 0 0115.03 22H8.97a3.75 3.75 0 01-3.73-3.39L4.07 6.5H2.75a.75.75 0 010-1.5H8.5zm2 4.75a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM14.25 9c.41 0 .75.34.75.75v7.5a.75.75 0 01-1.5 0v-7.5c0-.41.34-.75.75-.75zm-7.52 9.47a2.25 2.25 0 002.24 2.03h6.06c1.15 0 2.12-.88 2.24-2.03L18.42 6.5H5.58l1.15 11.97z" fill="currentColor"></path>
              </svg>
            </button>
            <Tooltip text="Clear text" visible={hoveredBtn === 'delete'} />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              onMouseEnter={() => setHoveredBtn('settings')}
              onMouseLeave={() => setHoveredBtn(null)}
              className="p-2 text-slate-900 hover:opacity-70 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            <Tooltip text="Settings" visible={hoveredBtn === 'settings'} />
            
            {showSettings && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 z-[70] animate-in fade-in zoom-in-95">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Editorial Tone</label>
                    <div className="grid grid-cols-1 gap-1">
                      {toneOptions.map(t => (
                        <button 
                          key={t}
                          onClick={() => { onToneChange(t); setShowSettings(false); }}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${tone === t ? 'bg-emerald-50 text-[#2ba37b] font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
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
          style={sharedStyles}
          className="absolute inset-0 text-transparent whitespace-pre-wrap break-words pointer-events-none overflow-auto select-none"
        >
          {renderHighlightedText()}
        </div>
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 2000))}
          onClick={handleEditorClick}
          onScroll={(e) => { if(backdropRef.current) backdropRef.current.scrollTop = e.currentTarget.scrollTop; }}
          placeholder="Start writing or paste your text here..."
          style={sharedStyles}
          className="absolute inset-0 w-full h-full text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none bg-transparent font-normal transition-colors"
          spellCheck={false}
        />

        {!value && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <button 
              onClick={onTrySample} 
              className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="#1C274C" strokeWidth="1.5"></path>
                <path d="M8 10H16" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
                <path d="M8 14H13" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round"></path>
              </svg>
              Try sample text
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="pointer-events-auto flex items-center gap-3 px-8 py-3 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 3H8.2C7.0799 3 6.51984 3 6.09202 3.21799C5.71569 3.40973 5.40973 3.71569 5.21799 4.09202C5 4.51984 5 5.0799 5 6.2V17.8C5 18.9201 5 19.4802 5.21799 19.908C5.40973 20.2843 5.71569 20.5903 6.09202 20.782C6.51984 21 7.0799 21 8.2 21H12M13 3L19 9M13 3V7.4C13 7.96005 13 8.24008 13.109 8.45399C13.2049 8.64215 13.3578 8.79513 13.546 8.89101C13.7599 9 14.0399 9 14.6 9H19M19 9V10M15 19H21M18 16V22" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Upload doc
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md,.doc,.docx" 
              onChange={handleFileChange} 
            />
          </div>
        )}

        {activeSuggestion && (
          <div 
            className="absolute z-[60] bg-white border border-slate-200 rounded-[20px] shadow-2xl p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200" 
            style={{ top: popoverPos.top, left: popoverPos.left }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#2ba37b] uppercase tracking-widest mb-1">{activeSuggestion.category}</span>
                <div className="text-red-400 line-through text-sm font-medium">{activeSuggestion.original}</div>
                <div className="text-emerald-600 font-extrabold text-xl">{activeSuggestion.replacement}</div>
              </div>
              <p className="text-xs text-slate-500 italic leading-relaxed">"{activeSuggestion.explanation}"</p>
              <div className="flex gap-2">
                <button onClick={() => { onApplySuggestion(activeSuggestion); setActiveSuggestion(null); }} className="flex-1 py-3 bg-[#2ba37b] text-white font-bold text-xs rounded-full hover:opacity-95 transition-all">Accept</button>
                <button onClick={() => { onIgnoreSuggestion(activeSuggestion); setActiveSuggestion(null); }} className="px-4 py-3 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors">Ignore</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-8 py-6 border-t border-slate-50 bg-white flex flex-col items-center gap-4 rounded-b-[25px]">
        <button 
          onClick={onFixGrammar} 
          disabled={!value || isLoading} 
          className={`w-full py-4 rounded-full text-base font-bold transition-all ${value && !isLoading ? 'bg-[#2ba37b] text-white shadow-xl hover:opacity-95 transform active:scale-[0.99]' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Reviewing...
            </div>
          ) : 'Fix Grammar'}
        </button>
        <div className="text-[12px] font-bold text-slate-300">{value.length}/2000 characters</div>
      </div>
    </div>
  );
};

export default Editor;
