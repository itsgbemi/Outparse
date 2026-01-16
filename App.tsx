
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import { analyzeText, generateSpeech } from './services/geminiService';
import { ProofreadingResult, EditorialTone, Suggestion } from './types';
import { jsPDF } from 'jspdf';

const SAMPLE_TEXT = "I was went to the store yesterday to buy some apple's. The shopkeeper was really friendly, but he didn't have the right change for me. I think they're going to be busier later today so I should have gone earlier. It's important to get fresh fruit if you want to stay healthy and avoid getting sick frequently.";

const PATH_MAP: Record<string, string> = {
  '/': 'home',
  '/grammar-checker': 'grammar',
  '/spell-checker': 'spell',
  '/dictionary': 'dictionary',
  '/blog': 'blog',
  '/writing-tips': 'tips',
  '/phrase-of-the-day': 'phrase',
  '/misspelled-words': 'misspelled',
  '/confused-words': 'confused',
  '/quiz': 'quiz',
  '/pricing': 'pricing',
  '/login': 'login',
  '/signup': 'signup',
  '/about-us': 'about',
  '/careers': 'careers',
  '/partners': 'partners',
  '/privacy-policy': 'privacy',
  '/terms-of-service': 'terms',
};

const GenerateIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
    <path d="M5 3L6 5L8 6L6 7L5 9L4 7L2 6L4 5L5 3Z" />
    <path d="M19 15L20 17L22 18L20 19L19 21L18 19L16 18L18 17L19 15Z" />
  </svg>
);

const Header = ({ onNavigate, currentPage }: { onNavigate: (path: string) => void, currentPage: string }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = currentPage === '/';

  const NavItem = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="group relative py-4">
      <button className={`flex items-center gap-1 text-[15px] font-medium transition-colors ${isHome ? 'text-slate-800 hover:text-emerald-700' : 'text-slate-600 hover:text-emerald-600'}`}>
        {label} <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {children && (
        <div className="absolute top-full left-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-[110]">
          {children}
        </div>
      )}
    </div>
  );

  const DropdownLink = ({ to, label }: { to: string, label: string }) => (
    <button onClick={() => { onNavigate(to); setMobileMenuOpen(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors group/link">
      <div className="text-[14px] font-semibold text-slate-800 group-hover/link:text-emerald-600">{label}</div>
    </button>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] h-20 flex items-center transition-all duration-300 ${isScrolled ? 'bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto w-full px-8 md:px-12 lg:px-24 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }} className="flex items-center gap-2 cursor-pointer group">
            <GenerateIcon className="w-8 h-8 text-black transition-transform group-hover:scale-110" />
            <span className={`text-2xl font-bold tracking-tight text-slate-900`}>outparse</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <NavItem label="Features">
              <DropdownLink to="/grammar-checker" label="Grammar checker" />
              <DropdownLink to="/spell-checker" label="Spell checker" />
              <DropdownLink to="/dictionary" label="Dictionary" />
            </NavItem>
            <NavItem label="Resources">
              <DropdownLink to="/blog" label="Blog" />
              <DropdownLink to="/writing-tips" label="Writing Tips" />
              <DropdownLink to="/phrase-of-the-day" label="Phrase of the Day" />
              <DropdownLink to="/misspelled-words" label="Misspelled Words" />
              <DropdownLink to="/confused-words" label="Confused Words" />
              <DropdownLink to="/quiz" label="Quiz" />
            </NavItem>
            <button onClick={() => onNavigate('/pricing')} className={`text-[15px] font-medium transition-colors text-slate-800 hover:text-emerald-700`}>Pricing</button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-5">
            <button onClick={() => onNavigate('/login')} className={`text-[15px] font-medium transition-colors text-slate-800 hover:text-emerald-700`}>Log in</button>
            <button onClick={() => onNavigate('/signup')} className={`px-7 py-3 font-semibold text-[14px] rounded-full transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20`}>Sign up</button>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => onNavigate('/signup')} className={`px-5 py-2.5 font-semibold text-[13px] rounded-full transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/10`}>Sign up</button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg text-slate-800 hover:bg-black/5 transition-colors flex items-center justify-center`}
            >
              {mobileMenuOpen ? (
                <svg className="w-7 h-7" viewBox="0 0 512 512" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" fill="#000000">
                  <g id="_x37_12-_close__x2C__cross__x2C__cancel__x2C_">
                    <g>
                      <line style={{fill:'none',stroke:'#000000',strokeWidth:24,strokeLinecap:'round',strokeLinejoin:'round',strokeMiterlimit:2.6131}} x1="486.21" x2="26.739" y1="26.814" y2="486.139"></line>
                      <line style={{fill:'none',stroke:'#000000',strokeWidth:24,strokeLinecap:'round',strokeLinejoin:'round',strokeMiterlimit:2.6131}} x1="486.21" x2="26.739" y1="486.139" y2="26.814"></line>
                    </g>
                  </g>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.2027 4.90036V6.43657H2.79727V4.90036H17.2027Z" fill="currentColor"></path>
                  <path d="M10.9604 13.0635V14.5997H2.79727V13.0635H10.9604Z" fill="currentColor"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-2xl p-6 lg:hidden flex flex-col gap-1 max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
          <div>
            <button 
              onClick={() => setExpandedSection(expandedSection === 'features' ? null : 'features')}
              className="w-full flex items-center justify-between py-4 text-lg font-bold text-slate-900 px-3 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Features <svg className={`w-5 h-5 transition-transform ${expandedSection === 'features' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedSection === 'features' && (
              <div className="pl-6 pb-2 grid gap-1 mt-1">
                <DropdownLink to="/grammar-checker" label="Grammar checker" />
                <DropdownLink to="/spell-checker" label="Spell checker" />
                <DropdownLink to="/dictionary" label="Dictionary" />
              </div>
            )}
          </div>

          <div>
            <button 
              onClick={() => setExpandedSection(expandedSection === 'resources' ? null : 'resources')}
              className="w-full flex items-center justify-between py-4 text-lg font-bold text-slate-900 px-3 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Resources <svg className={`w-5 h-5 transition-transform ${expandedSection === 'resources' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {expandedSection === 'resources' && (
              <div className="pl-6 pb-2 grid gap-1 mt-1">
                <DropdownLink to="/blog" label="Blog" />
                <DropdownLink to="/writing-tips" label="Writing Tips" />
                <DropdownLink to="/phrase-of-the-day" label="Phrase of the Day" />
                <DropdownLink to="/misspelled-words" label="Misspelled Words" />
                <DropdownLink to="/confused-words" label="Confused Words" />
                <DropdownLink to="/quiz" label="Quiz" />
              </div>
            )}
          </div>

          <button onClick={() => { onNavigate('/pricing'); setMobileMenuOpen(false); }} className="text-left text-lg font-bold text-slate-900 py-4 px-3 hover:bg-slate-50 rounded-xl transition-colors">Pricing</button>
          
          <div className="pt-6 mt-4 border-t border-slate-50 flex flex-col gap-3">
            <button onClick={() => { onNavigate('/login'); setMobileMenuOpen(false); }} className="w-full py-4 text-slate-600 font-bold border border-slate-200 rounded-2xl">Log in</button>
            <button onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/20">Sign up</button>
          </div>
        </div>
      )}
    </header>
  );
};

const PageContent = ({ title, desc, children }: { title: string, desc: string, children?: React.ReactNode }) => (
  <div className="min-h-[60vh] py-24 px-8 md:px-20 lg:px-24 reveal">
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="space-y-6">
        <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
        <p className="text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl">{desc}</p>
      </div>
      <div className="prose prose-slate max-w-none font-normal">
        {children || <p className="text-slate-400">Content for {title} is coming soon.</p>}
      </div>
    </div>
  </div>
);

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      q: "What is grammar checking?",
      a: "Grammar checking is the process of automatically identifying and correcting grammatical errors in written text. Modern tools use advanced AI to detect nuances that go beyond simple rules."
    },
    {
      q: "What does a grammar checker do?",
      a: "A grammar checker scans your text for mistakes in punctuation, spelling, syntax, and style. It then provides suggestions for improvements to make your writing clearer and more professional."
    },
    {
      q: "What are the advantages of online grammar checking?",
      a: "Online grammar checking provides instant feedback, allows you to access your tools from any device, and leverages the latest AI models that are continuously updated for better accuracy."
    },
    {
      q: "Why use grammar checking software?",
      a: "Grammar checking software ensures your communication is error-free, saves time on proofreading, and helps you learn better writing habits over time."
    }
  ];

  return (
    <section className="bg-white py-32">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-12 tracking-tight">Frequently asked questions</h2>
        
        <div className="flex gap-4 mb-8 text-[14px]">
          <button onClick={() => setOpenIndex(null)} className="text-blue-500 font-medium hover:underline">Collapse all</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setOpenIndex(0)} className="text-blue-500 font-medium hover:underline">Expand all</button>
        </div>

        <div className="border-t border-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-slate-100">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full py-8 flex items-center gap-6 text-left group transition-colors hover:bg-slate-50/50"
              >
                <span className={`transition-transform duration-300 ${openIndex === i ? 'rotate-90' : ''}`}>
                  <svg className="w-4 h-4 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span className="text-xl font-bold text-slate-900">{faq.q}</span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96 pb-8' : 'max-h-0'}`}>
                <div className="pl-14 text-slate-600 text-lg leading-relaxed max-w-4xl">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeatureReplica = ({ category, original, replacement, explanation }: { category: string, original: string, replacement: string, explanation: string }) => {
  const getDot = (cat: string) => {
    switch(cat) {
      case 'Grammar': return 'bg-red-500';
      case 'Style': return 'bg-indigo-500';
      case 'Clarity': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl p-10 w-full max-w-[400px] relative pointer-events-none select-none mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${getDot(category)}`}></div>
          <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">{category}</h4>
        </div>
      </div>
      <div className="space-y-8 mb-10">
        <div className="flex flex-col">
          <div className="text-red-500/50 line-through text-xl font-medium leading-tight mb-2">{original}</div>
          <div className="text-emerald-600 font-extrabold text-3xl leading-tight">{replacement}</div>
        </div>
        <div className="pt-6 border-t border-slate-50">
          <p className="text-[15px] text-slate-600 mb-4 italic leading-relaxed">"{explanation}"</p>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex-1 py-4.5 bg-emerald-600 text-white font-bold text-[16px] rounded-full text-center opacity-90 shadow-lg">Accept</div>
        <div className="px-8 py-4.5 text-slate-300 font-bold text-[16px]">Ignore</div>
      </div>
    </div>
  );
};

const FeatureSection = ({ title, description, category, original, replacement, explanation, reverse = false }: any) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={ref} 
      className={`py-32 transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className={`max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 flex flex-col md:flex-row ${reverse ? 'md:flex-row-reverse' : ''} items-center gap-20 lg:gap-32`}>
        <div className="flex-1 space-y-8 text-left">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">{title}</h2>
          <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-2xl">{description}</p>
          <button className="text-emerald-600 font-bold text-[17px] flex items-center gap-4 group">
            Explore {category.toLowerCase()} suite <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center w-full">
          <div className="relative group w-full max-w-[400px]">
            <div className="absolute -inset-16 bg-emerald-100 rounded-[120px] blur-[100px] opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <FeatureReplica category={category} original={original} replacement={replacement} explanation={explanation} />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggle = (section: string) => setOpenSection(openSection === section ? null : section);

  const FooterHeading = ({ title, id }: { title: string, id: string }) => (
    <div className="flex items-center justify-between md:block py-4 md:py-0 border-b border-slate-300 md:border-0 cursor-pointer md:cursor-default" onClick={() => toggle(id)}>
      <h4 className="text-[15px] font-bold text-slate-900">{title}</h4>
      <span className="md:hidden text-slate-600 font-medium text-xl">
        <svg className={`w-5 h-5 transition-transform duration-300 ${openSection === id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </div>
  );

  const FooterLinks = ({ children, id }: { children?: React.ReactNode, id: string }) => (
    <ul className={`${openSection === id ? 'block' : 'hidden'} md:block space-y-4 pt-4 md:pt-8 animate-in fade-in duration-300`}>
      {children}
    </ul>
  );

  return (
    <footer className="bg-slate-200 text-slate-900 pt-32 pb-12 border-t border-slate-300">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-24 mb-32">
          <div className="col-span-1 md:col-span-2 space-y-10">
            <div onClick={() => onNavigate('/')} className="flex items-center gap-3 cursor-pointer">
              <GenerateIcon className="w-8 h-8 text-black" />
              <span className="text-3xl font-bold tracking-tight">outparse</span>
            </div>
            <p className="text-slate-600 text-xl font-medium leading-relaxed max-w-sm">
              The world's most sophisticated editorial suite for high-impact communication.
            </p>
          </div>
          
          <div>
            <FooterHeading title="Company" id="company" />
            <FooterLinks id="company">
              <li><button onClick={() => onNavigate('/about-us')} className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">About us</button></li>
              <li><button onClick={() => onNavigate('/careers')} className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">Careers</button></li>
            </FooterLinks>
          </div>
          
          <div>
            <FooterHeading title="Product" id="product" />
            <FooterLinks id="product">
              <li><button onClick={() => onNavigate('/grammar-checker')} className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">Grammar checker</button></li>
              <li><button onClick={() => onNavigate('/pricing')} className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</button></li>
            </FooterLinks>
          </div>

          <div>
            <FooterHeading title="Legal" id="legal" />
            <FooterLinks id="legal">
              <li><button onClick={() => onNavigate('/privacy-policy')} className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors">Privacy policy</button></li>
            </FooterLinks>
          </div>
        </div>

        <div className="pt-16 border-t border-slate-300 flex flex-col md:flex-row items-center justify-between gap-10">
          <p className="text-[14px] font-semibold text-slate-400">© {currentYear} Outparse Suite. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<ProofreadingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<EditorialTone>('Professional');
  
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    // If text is cleared or route changed, stop checking and reset results immediately
    if (!inputText.trim() || currentPath !== '/') {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setResult(null);
      setIsLoading(false);
      return;
    }

    // Debounce analysis to avoid rapid API calls (reduced to 700ms for better responsiveness)
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    
    timeoutRef.current = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const analysis = await analyzeText(inputText, tone);
        setResult(analysis);
      } catch (err) {
        console.error('Analysis failed');
      } finally {
        setIsLoading(false);
      }
    }, 700);

    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [inputText, tone, currentPath]);

  const handleApplyAll = useCallback(() => {
    if (result?.correctedText) {
      setInputText(result.correctedText);
      setResult(null);
    }
  }, [result]);

  const applySingleSuggestion = useCallback((s: Suggestion) => {
    setInputText(prev => {
      const before = prev.substring(0, s.index);
      const after = prev.substring(s.index + s.original.length);
      return before + s.replacement + after;
    });
    setResult(prev => {
      if (!prev) return null;
      const shift = s.replacement.length - s.original.length;
      return {
        ...prev,
        suggestions: prev.suggestions.filter(item => item.id !== s.id).map(item => 
          item.index > s.index ? { ...item, index: item.index + shift } : item
        )
      };
    });
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    const internalPage = PATH_MAP[currentPath] || 'home';

    switch (internalPage) {
      case 'home':
        return (
          <>
            <main className="min-h-[100vh] flex flex-col items-center relative overflow-hidden pt-48 pb-32">
              <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 w-full flex flex-col items-center gap-16 relative z-10">
                
                <div className="text-center space-y-6 reveal delay-1 max-w-3xl">
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tighter leading-[1.1]">
                    Grammar checking
                  </h1>
                  <p className="text-slate-600/80 text-lg lg:text-xl font-medium leading-relaxed">
                    Use Outparse to improve your writing, catch mistakes, and use best practices to write like a pro.
                  </p>
                </div>

                <div className="w-full max-w-5xl reveal delay-3">
                  <div className={`overflow-hidden rounded-[25px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] transition-all duration-300 ${isLoading ? 'check-gradient-border' : ''}`}>
                    <div className={`${isLoading ? 'check-gradient-inner rounded-[22px]' : ''}`}>
                      <Editor 
                        value={inputText} onChange={setInputText} isLoading={isLoading} 
                        onPaste={() => navigator.clipboard.readText().then(setInputText)}
                        onTrySample={() => setInputText(SAMPLE_TEXT)}
                        suggestions={result?.suggestions || []}
                        tone={tone} onToneChange={setTone}
                        onApplySuggestion={applySingleSuggestion}
                        onIgnoreSuggestion={(s) => setResult(p => p ? {...p, suggestions: p.suggestions.filter(i => i.id !== s.id)} : null)}
                        onApplyAll={handleApplyAll}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <div className="bg-transparent space-y-32">
              <FeatureSection 
                title="Eliminate grammar mistakes instantly"
                description="Our advanced neural networks detect complex grammatical errors that traditional checkers miss. From subject-verb agreement to nuanced punctuation, we ensure your text is technically flawless."
                category="Grammar"
                original="I was went"
                replacement="I went"
                explanation="Corrected verb tense: 'was went' is grammatically incorrect. Use 'went' for the simple past."
              />
              <FeatureSection 
                title="Refine your professional style"
                description="Maintain the perfect tone for every situation. Whether you need to sound academic, creative, or urgent, Outparse adjusts your vocabulary to suit your audience perfectly."
                category="Style"
                original="really friendly"
                replacement="exceptionally welcoming"
                explanation="Elevated vocabulary: Replaced a common modifier with a more sophisticated, descriptive phrase."
                reverse={true}
              />
              <FeatureSection 
                title="Crystal clear communication"
                description="Don't let confusing sentence structures hide your message. We identify wordy phrases and ambiguous constructions to help you write with maximum clarity and impact."
                category="Clarity"
                original="the shopkeeper was really friendly, but he didn't have the right change for me."
                replacement="Despite being friendly, the shopkeeper lacked the correct change."
                explanation="Conciseness: Streamlined the sentence to be more direct and impactful."
              />
            </div>

            <FAQSection />

            <section className="py-48 bg-transparent">
              <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 text-left space-y-12">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">Writing tips and product updates</h2>
                <p className="text-slate-600 text-xl font-medium max-w-4xl">Join 100,000+ writers receiving our weekly editorial insights.</p>
                <div className="flex flex-col sm:flex-row gap-6 max-w-2xl pt-8">
                  <input type="email" placeholder="Email address" className="flex-1 px-10 py-6 rounded-full border border-slate-200 focus:ring-4 focus:ring-emerald-500/10 text-xl shadow-2xl bg-white focus:outline-none" />
                  <button className="px-12 py-6 bg-slate-900 text-white font-extrabold rounded-full hover:bg-black transition-all text-xl shadow-2xl">Subscribe</button>
                </div>
              </div>
            </section>
          </>
        );
      case 'about':
        return (
          <PageContent title="About Us" desc="Outparse is dedicated to refining the world's communication through sophisticated, AI-driven editorial tools.">
            <div className="space-y-12 text-slate-700 leading-relaxed text-lg max-w-4xl">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
                <p>To empower every individual and organization to communicate with clarity, precision, and confidence. We believe that professional-grade editing should be accessible to everyone, everywhere.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">The Technology</h2>
                <p>Outparse leverages cutting-edge Large Language Models (LLMs) and custom editorial neural networks. Our systems are trained on millions of high-quality professional documents to understand the nuances of grammar, style, and tone better than any traditional rule-based checker.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">Our Story</h2>
                <p>Founded by a team of linguistic experts and software engineers, Outparse started as a small project to solve the inconsistencies of common word processors. Today, it serves thousands of users daily, from professional journalists to students around the globe.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">The Team</h2>
                <p>We are a distributed team of engineers, designers, and linguists passionate about the intersection of human language and artificial intelligence. We work tirelessly to ensure that Outparse remains the gold standard in editorial assistance.</p>
              </section>
            </div>
          </PageContent>
        );
      case 'privacy':
        return (
          <PageContent title="Privacy Policy" desc="Your privacy is our priority. We are committed to protecting your personal data and your right to privacy.">
            <div className="space-y-12 text-slate-700 leading-relaxed text-lg max-w-4xl">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">1. Introduction</h2>
                <p>Welcome to Outparse. We respect your privacy and want you to understand how we collect, use, and share data about you. This Privacy Policy covers our data collection practices and describes your rights to access, correct, or restrict our use of your personal data.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">2. Data We Collect</h2>
                <p>When you use our editor, we process the text you input to provide grammar and style suggestions. This processing is performed in real-time. We also collect basic account information if you choose to sign up, such as your email address and preferred editorial settings.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">3. How We Use Your Data</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and improve our proofreading services.</li>
                  <li>To personalize your writing experience based on your chosen tone.</li>
                  <li>To communicate with you about product updates (only if you subscribe).</li>
                  <li>To ensure the security and integrity of our platform.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">4. Data Security</h2>
                <p>We use appropriate security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data. We do not sell your personal data to third parties.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
                <p>You have the right to access, update, or delete your account information at any time. If you have questions about your data or wish to exercise your rights, please contact our support team.</p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-900">6. Contact Us</h2>
                <p>If you have any questions, concerns, or feedback about our privacy practices, please reach out to us at privacy@outparse.ai.</p>
              </section>
            </div>
          </PageContent>
        );
      case 'pricing':
        return (
          <PageContent title="Simple, transparent pricing" desc="Choose the plan that's right for your writing goals. All plans support USDT payments.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 py-24">
              <div className="border border-slate-200 p-16 rounded-[64px] space-y-10 bg-white/40 shadow-xl reveal">
                <h3 className="text-4xl font-extrabold">Free</h3>
                <p className="text-slate-500 text-xl">Essential tools for basic writing improvement.</p>
                <div className="text-6xl font-extrabold">$0<span className="text-2xl text-slate-400 font-medium">/mo</span></div>
                <button onClick={() => handleNavigate('/signup')} className="w-full py-6 bg-white border border-slate-200 rounded-full font-extrabold text-xl shadow-lg hover:bg-slate-50 transition-colors">Get started</button>
              </div>
              <div className="border-[8px] border-slate-900 p-16 rounded-[64px] space-y-10 shadow-3xl relative bg-white reveal">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-12 py-3 rounded-full text-sm font-black uppercase tracking-[0.2em]">Best Value</div>
                <h3 className="text-4xl font-extrabold">Premium</h3>
                <p className="text-slate-500 text-xl">The full power of the AI editorial engine with unlimited checks.</p>
                <div className="text-6xl font-extrabold">3<span className="text-2xl text-slate-900 font-medium"> USDT</span><span className="text-2xl text-slate-400 font-medium">/mo</span></div>
                <button onClick={() => handleNavigate('/signup')} className="w-full py-6 bg-slate-900 text-white rounded-full font-extrabold text-xl shadow-2xl hover:scale-[1.02] transition-transform">Upgrade now</button>
              </div>
            </div>
          </PageContent>
        );
      default:
        return <PageContent title={internalPage.charAt(0).toUpperCase() + internalPage.slice(1)} desc={`Information about ${internalPage}.`} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col brand-gradient overflow-x-hidden`}>
      <Header onNavigate={handleNavigate} currentPage={currentPath} />
      {renderCurrentPage()}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
