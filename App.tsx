
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import { analyzeText } from './services/geminiService';
import { ProofreadingResult, EditorialTone, Suggestion } from './types';

const SAMPLE_TEXT = "Had governments taken climate change seriously decades ago, the world might not be facing such severe environmental problems today. While some countries is making progress, others continues to ignore scientific warnings, which put future generations at risk. Many scientists believes that if action was took earlier, these problems will not became so serious. However, few governments has done enough to change the situation.";

const Header = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] h-20 flex items-center transition-all duration-300 ${isScrolled || mobileMenuOpen ? 'bg-white border-b border-slate-100 shadow-sm' : 'bg-white border-b border-slate-50'}`}>
      <div className="max-w-[1400px] mx-auto w-full px-8 md:px-12 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }} className="flex items-center gap-2 cursor-pointer group">
            <svg className="w-8 h-8 text-black transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
              <path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z" />
              <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight text-slate-900">outparse</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            <button onClick={() => onNavigate('/grammar-checker')} className="text-[15px] font-medium text-slate-800 hover:text-emerald-700">Grammar checker</button>
            <button onClick={() => onNavigate('/pricing')} className="text-[15px] font-medium text-slate-800 hover:text-emerald-700">Pricing</button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('/signup')} className="px-5 py-2.5 md:px-7 md:py-3 font-bold text-[13px] md:text-[14px] rounded-full transition-all bg-[#2ba37b] text-white hover:opacity-90 shadow-lg shadow-[#2ba37b]/20">Sign up</button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-800 hover:bg-black/5 transition-colors flex items-center justify-center lg:hidden"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute block h-0.5 w-6 bg-black transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : 'top-1'}`}></span>
              <span className={`absolute block h-0.5 w-6 bg-black transition-all duration-300 top-3 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
              <span className={`absolute block h-0.5 w-6 bg-black transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : 'top-5'}`}></span>
            </div>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 bg-white z-[90] p-8 flex flex-col gap-6 lg:hidden animate-in slide-in-from-top-4 duration-300">
          <button onClick={() => { onNavigate('/grammar-checker'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 py-4 border-b border-slate-50 text-left font-arimo">Grammar checker</button>
          <button onClick={() => { onNavigate('/pricing'); setMobileMenuOpen(false); }} className="text-2xl font-bold text-slate-900 py-4 border-b border-slate-50 text-left font-arimo">Pricing</button>
          <div className="mt-auto pb-12 flex flex-col gap-4">
             <button onClick={() => { onNavigate('/login'); setMobileMenuOpen(false); }} className="w-full py-4 font-bold text-slate-600 border border-slate-200 rounded-2xl font-arimo">Log in</button>
             <button onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 font-bold bg-[#2ba37b] text-white rounded-2xl shadow-xl shadow-[#2ba37b]/20 font-arimo">Sign up</button>
          </div>
        </div>
      )}
    </header>
  );
};

const FeatureSection = ({ title, description, category, reverse = false }: any) => {
  return (
    <section className="py-32 bg-white">
      <div className={`max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center gap-20 lg:gap-32`}>
        <div className="flex-1 space-y-8 text-left">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">{title}</h2>
          <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl">{description}</p>
          <button className="text-[#2ba37b] font-bold text-[17px] flex items-center gap-4 group">
            Explore {category.toLowerCase()} suite <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="relative group w-full max-w-[400px]">
            <div className="absolute -inset-16 bg-emerald-100 rounded-[120px] blur-[100px] opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl p-10 w-full max-w-[400px] relative pointer-events-none select-none mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{category}</h4>
              </div>
              <div className="space-y-4 mb-10">
                <div className="text-red-500/50 line-through text-xl font-medium">Original text error</div>
                <div className="text-emerald-600 font-extrabold text-3xl">Perfect suggestion</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "What is grammar checking?", a: "Grammar checking is the process of automatically identifying and correcting grammatical errors in written text. Modern tools use advanced AI to detect nuances that go beyond simple rules." },
    { q: "What does a grammar checker do?", a: "A grammar checker scans your text for mistakes in punctuation, spelling, syntax, and style. It then provides suggestions for improvements." }
  ];

  return (
    <section className="bg-white py-32 border-t border-slate-50">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">Frequently asked questions</h2>
        <div className="border-t border-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-100">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full py-8 flex items-center gap-6 text-left group transition-colors hover:bg-slate-50/50">
                <span className={`transition-transform duration-300 ${openIndex === i ? 'rotate-90' : ''}`}>
                  <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                </span>
                <span className="text-xl font-bold text-slate-900">{faq.q}</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-8' : 'max-h-0'}`}>
                <div className="pl-14 text-slate-600 text-lg leading-relaxed max-w-4xl">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
  <footer className="bg-white text-slate-900 pt-32 pb-12 border-t border-slate-100">
    <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-32">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
              <path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z" />
              <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" />
            </svg>
            <span className="text-xl font-bold">outparse</span>
          </div>
          <p className="text-slate-600 text-sm font-medium">Sophisticated editorial tools for professional precision.</p>
        </div>
      </div>
      <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[12px] font-bold text-slate-400">© 2024 Outparse Suite. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ProofreadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<EditorialTone>('Professional');
  const [credits, setCredits] = useState(3);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleFixGrammar = async () => {
    if (!inputText.trim() || isLoading) return;
    if (credits <= 0) {
      alert("No AI credits left! Please upgrade your plan.");
      return;
    }
    setIsLoading(true);
    try {
      const analysis = await analyzeText(inputText, tone);
      setResult(analysis);
      setCredits(prev => prev - 1);
    } catch (err) {
      console.error('AI scan failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onApplySuggestion = (s: Suggestion) => {
    const newText = inputText.substring(0, s.index) + s.replacement + inputText.substring(s.index + s.original.length);
    setInputText(newText);
    
    // SENIOR PRACTICE: Update existing suggestions to match new indices
    if (result) {
      const diff = s.replacement.length - s.original.length;
      const updatedSuggestions = result.suggestions
        .filter(item => item.id !== s.id) // Remove applied one
        .map(item => {
          // If suggestion was after the current one, shift its index
          if (item.index > s.index) {
            return { ...item, index: item.index + diff };
          }
          return item;
        });
      setResult({ ...result, suggestions: updatedSuggestions });
    }
  };

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const heroBgStyle = {
    background: 'linear-gradient(to right, #f2fcda, #e2fbec)'
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Header onNavigate={handleNavigate} />
      <main className="flex-1">
        <section style={heroBgStyle} className="pt-48 pb-32">
          <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 flex flex-col items-center gap-16">
            <div className="text-center space-y-6 reveal max-w-4xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tighter leading-tight font-arimo">
                Grammar checking
              </h1>
              <p className="text-slate-600/80 text-xl font-medium leading-relaxed max-w-2xl mx-auto font-arimo">
                Use Outparse to improve your writing, catch mistakes, and use best practices to write like a pro.
              </p>
            </div>
            <div className="w-full max-w-5xl reveal delay-1">
              <div className={`rounded-[25px] overflow-hidden shadow-2xl transition-all duration-300 ${isLoading ? 'check-gradient-border' : ''}`}>
                <div className={`${isLoading ? 'check-gradient-inner rounded-[22px]' : ''}`}>
                  <Editor 
                    value={inputText} onChange={(val) => { setInputText(val); if(result) setResult(null); }} 
                    isLoading={isLoading} 
                    credits={credits}
                    onPaste={() => navigator.clipboard.readText().then(setInputText)}
                    onTrySample={() => setInputText(SAMPLE_TEXT)}
                    suggestions={result?.suggestions || []}
                    tone={tone} onToneChange={setTone}
                    onApplySuggestion={onApplySuggestion}
                    onIgnoreSuggestion={(s) => setResult(p => p ? {...p, suggestions: p.suggestions.filter(i => i.id !== s.id)} : null)}
                    onFixGrammar={handleFixGrammar}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-12 bg-white">
          <FeatureSection title="Eliminate grammar mistakes instantly" description="Catch errors as you write." category="Grammar" />
          <FeatureSection title="Refine your style" description="Write with confidence." category="Style" reverse={true} />
        </div>
        <FAQSection />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
