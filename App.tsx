
import React, { useState, useCallback, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import { analyzeText, generateSpeech } from './services/geminiService';
import { ProofreadingResult, EditorialTone, Suggestion } from './types';
import { jsPDF } from 'jspdf';

const SAMPLE_TEXT = "I was went to the store yesterday to buy some apple's. The shopkeeper was really friendly, but he didn't have the right change for me. I think they're going to be busier later today so I should have gone earlier. It's important to get fresh fruit if you want to stay healthy and avoid getting sick frequently.";

const PATH_MAP: Record<string, string> = {
  '/': 'home',
  '/grammar-checker': 'grammar',
  '/paraphrasing-tool': 'paraphrasing',
  '/plagiarism-checker': 'plagiarism',
  '/ai-writer': 'aiwriter',
  '/summarizer': 'summarizer',
  '/citation-generator': 'citation',
  '/word-counter': 'wordcounter',
  '/translator': 'translator',
  '/for-teams': 'teams',
  '/pricing': 'pricing',
  '/about-us': 'about',
  '/careers': 'careers',
  '/partners': 'partners',
  '/privacy-policy': 'privacy',
  '/terms-of-service': 'terms',
  '/cookie-policy': 'cookies',
  '/login': 'login',
  '/signup': 'signup',
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

  const DropdownLink = ({ to, label, desc }: { to: string, label: string, desc: string }) => (
    <button onClick={() => { onNavigate(to); setMobileMenuOpen(false); }} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors group/link">
      <div className="text-[13px] font-semibold text-slate-800 group-hover/link:text-emerald-600">{label}</div>
      <div className="text-[11px] text-slate-400 font-medium">{desc}</div>
    </button>
  );

  return (
    <header className={`${isHome ? 'bg-transparent' : 'bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm'} sticky top-0 z-[100] h-20 flex items-center transition-all duration-300`}>
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div onClick={() => onNavigate('/')} className="flex items-center gap-2 cursor-pointer group">
            <div className={`rounded-xl flex items-center justify-center transition-transform group-hover:scale-105`}>
              <GenerateIcon className="w-7 h-7 text-black" />
            </div>
            <span className={`text-2xl font-bold tracking-tight ${isHome ? 'text-slate-900' : 'text-slate-800'}`}>outparse</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-9">
            <NavItem label="Platform">
              <DropdownLink to="/grammar-checker" label="Grammar Checker" desc="AI-powered error detection" />
              <DropdownLink to="/paraphrasing-tool" label="Paraphrasing Tool" desc="Rephrase sentences instantly" />
              <DropdownLink to="/plagiarism-checker" label="Plagiarism Checker" desc="Scan for duplicate content" />
            </NavItem>
            <NavItem label="Solutions">
              <DropdownLink to="/summarizer" label="Summarizer" desc="Condense long texts fast" />
              <DropdownLink to="/translator" label="Translator" desc="Localize your writing" />
            </NavItem>
            <button onClick={() => onNavigate('/pricing')} className={`text-[15px] font-medium transition-colors ${isHome ? 'text-slate-800 hover:text-emerald-700' : 'text-slate-600 hover:text-emerald-600'}`}>Pricing</button>
            <NavItem label="Resources">
              <DropdownLink to="/about-us" label="Blog" desc="Editorial insights" />
              <DropdownLink to="/careers" label="Careers" desc="Join the team" />
            </NavItem>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate('/login')} className={`hidden sm:block text-[15px] font-medium transition-colors ${isHome ? 'text-slate-800 hover:text-emerald-700' : 'text-slate-600 hover:text-emerald-600'}`}>Sign in</button>
          <button onClick={() => onNavigate('/signup')} className={`px-7 py-3 font-semibold text-[14px] rounded-full transition-all ${isHome ? 'bg-slate-900 text-white hover:bg-black' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>Sign up</button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg ${isHome ? 'text-slate-800 hover:bg-black/5' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-8 flex flex-col gap-6 lg:hidden shadow-2xl animate-in slide-in-from-top-2">
          <button onClick={() => { onNavigate('/grammar-checker'); setMobileMenuOpen(false); }} className="text-left text-[18px] font-semibold text-slate-800">Grammar Checker</button>
          <button onClick={() => { onNavigate('/paraphrasing-tool'); setMobileMenuOpen(false); }} className="text-left text-[18px] font-semibold text-slate-800">Paraphrasing Tool</button>
          <button onClick={() => { onNavigate('/pricing'); setMobileMenuOpen(false); }} className="text-left text-[18px] font-semibold text-slate-800 border-b border-slate-50 pb-6">Pricing</button>
          <button onClick={() => { onNavigate('/login'); setMobileMenuOpen(false); }} className="w-full py-4 text-slate-600 font-semibold border border-slate-200 rounded-2xl">Sign in</button>
          <button onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-2xl">Sign up</button>
        </div>
      )}
    </header>
  );
};

const PageContent = ({ title, desc, children }: { title: string, desc: string, children?: React.ReactNode }) => (
  <div className="min-h-[60vh] bg-white py-24 px-6 reveal">
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-5">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h1>
        <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-2xl">{desc}</p>
      </div>
      <div className="prose prose-slate max-w-none font-normal">
        {children || <p className="text-slate-400">Content for {title} is coming soon.</p>}
      </div>
    </div>
  </div>
);

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
    <div className="bg-white border border-slate-200 rounded-[40px] shadow-2xl p-8 w-full max-w-[360px] relative pointer-events-none select-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${getDot(category)}`}></div>
          <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">{category}</h4>
        </div>
      </div>
      <div className="space-y-6 mb-8">
        <div className="flex flex-col">
          <div className="text-red-500/50 line-through text-lg font-medium leading-tight mb-2">{original}</div>
          <div className="text-emerald-600 font-extrabold text-2xl leading-tight">{replacement}</div>
        </div>
        <div className="pt-5 border-t border-slate-50">
          <p className="text-[14px] text-slate-600 mb-4 italic leading-relaxed">"{explanation}"</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 py-4 bg-emerald-600 text-white font-semibold text-[15px] rounded-full text-center opacity-85">Accept</div>
        <div className="px-6 py-4 text-slate-300 font-semibold text-[15px]">Ignore</div>
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
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={ref} 
      className={`py-32 bg-white transition-all duration-1000 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className={`max-w-7xl mx-auto px-8 flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-20`}>
        <div className="flex-1 space-y-8">
          <h2 className="text-4xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">{title}</h2>
          <p className="text-xl text-slate-500 leading-relaxed font-medium">{description}</p>
          <button className="text-emerald-600 font-semibold text-[16px] flex items-center gap-3 group">
            See {category.toLowerCase()} in action <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </button>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="relative group">
            <div className="absolute -inset-10 bg-emerald-100 rounded-[100px] blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
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
    <div className="flex items-center justify-between md:block py-4 md:py-0 border-b border-slate-200/20 md:border-0 cursor-pointer md:cursor-default" onClick={() => toggle(id)}>
      <h4 className="text-[15px] font-semibold text-slate-900 uppercase tracking-wider">{title}</h4>
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
    <footer className="bg-slate-100 text-slate-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 md:gap-16 mb-24">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <div onClick={() => onNavigate('/')} className="flex items-center gap-2 cursor-pointer">
              <GenerateIcon className="w-7 h-7 text-black" />
              <span className="text-2xl font-bold tracking-tight">outparse</span>
            </div>
            <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-sm">
              The world's most sophisticated editorial suite for high-impact communication.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <FooterHeading title="Company" id="company" />
            <FooterLinks id="company">
              <li><button onClick={() => onNavigate('/about-us')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">About us</button></li>
              <li><button onClick={() => onNavigate('/careers')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Careers</button></li>
              <li><button onClick={() => onNavigate('/partners')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Partners</button></li>
            </FooterLinks>
          </div>
          
          <div>
            <FooterHeading title="Product" id="product" />
            <FooterLinks id="product">
              <li><button onClick={() => onNavigate('/grammar-checker')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Grammar</button></li>
              <li><button onClick={() => onNavigate('/paraphrasing-tool')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Paraphrasing</button></li>
              <li><button onClick={() => onNavigate('/pricing')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Pricing</button></li>
            </FooterLinks>
          </div>

          <div>
            <FooterHeading title="Legal" id="legal" />
            <FooterLinks id="legal">
              <li><button onClick={() => onNavigate('/privacy-policy')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Privacy policy</button></li>
              <li><button onClick={() => onNavigate('/terms-of-service')} className="text-[15px] font-normal text-slate-600 hover:text-slate-900 transition-colors">Terms of service</button></li>
            </FooterLinks>
          </div>

          <div className="col-span-1 md:col-span-1">
            <FooterHeading title="Newsletter" id="newsletter" />
            <div className={`pt-4 md:pt-8 space-y-4 ${openSection === 'newsletter' ? 'block' : 'hidden md:block'}`}>
              <p className="text-[13px] text-slate-500 font-medium">Get writing tips and product updates.</p>
              <div className="flex flex-col gap-2">
                <input type="email" placeholder="Email address" className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                <button className="bg-slate-900 text-white rounded-xl py-2 px-4 text-[13px] font-bold hover:bg-black transition-all">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[13px] font-medium text-slate-500">© {currentYear} Outparse Suite. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <span className="text-[13px] font-semibold text-slate-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> All systems operational</span>
          </div>
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
  const [readingStatus, setReadingStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [tone, setTone] = useState<EditorialTone>('Professional');
  const [showMenu, setShowMenu] = useState(false);
  const [menuView, setMenuView] = useState<'main' | 'download'>('main');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const timeoutRef = useRef<number | null>(null);
  useEffect(() => {
    if (!inputText.trim() || currentPath !== '/') {
      setResult(null);
      return;
    }
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
    }, 1200);
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, [inputText, tone, currentPath]);

  const handleToggleReadAloud = async () => {
    if (!inputText) return;

    if (readingStatus === 'playing') {
      audioContextRef.current?.suspend();
      setReadingStatus('paused');
      return;
    }

    if (readingStatus === 'paused') {
      audioContextRef.current?.resume();
      setReadingStatus('playing');
      return;
    }

    setReadingStatus('playing');
    try {
      const base64Audio = await generateSpeech(inputText);
      if (!base64Audio) throw new Error();
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) view[i] = audioData.charCodeAt(i);
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();
      
      const dataInt16 = new Int16Array(arrayBuffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => {
        setReadingStatus('idle');
        audioSourceRef.current = null;
      };
      audioSourceRef.current = source;
      source.start();
    } catch (err) {
      setReadingStatus('idle');
    }
  };

  const handleStopReadAloud = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setReadingStatus('idle');
  };

  const handleCopy = async () => {
    if (!inputText) return;
    await navigator.clipboard.writeText(inputText);
    setShowMenu(false);
  };

  const handleDownload = (type: 'docx' | 'pdf' | 'txt') => {
    if (!inputText) return;
    if (type === 'pdf') {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const splitText = doc.splitTextToSize(inputText, pageWidth - (margin * 2));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(splitText, margin, 30);
      doc.save("outparse-export.pdf");
    } else if (type === 'docx') {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + inputText.replace(/\n/g, '<br>') + footer;
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = 'outparse-export.doc';
      fileDownload.click();
      document.body.removeChild(fileDownload);
    } else {
      const blob = new Blob([inputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `outparse-export.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowMenu(false);
    setMenuView('main');
  };

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

  const errorCount = result?.suggestions.length || 0;

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
            <main className="brand-gradient min-h-[90vh] flex items-center relative overflow-hidden pb-20">
              <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center relative z-10">
                
                <div className="space-y-8 reveal delay-1 py-10 lg:py-0">
                  <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tighter leading-[1] drop-shadow-sm">
                    Grammar checking
                  </h1>
                  <p className="text-slate-600/80 text-xl lg:text-2xl font-medium max-w-xl leading-relaxed">
                    Use Outparse to improve your writing, catch mistakes, and use best practices to write like a pro.
                  </p>
                </div>

                <div className="w-full reveal delay-3">
                  <div className={`overflow-hidden rounded-[25px] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-300 ${isLoading ? 'check-gradient-border' : ''}`}>
                    <div className={`${isLoading ? 'check-gradient-inner rounded-[22px]' : ''}`}>
                      <Editor 
                        value={inputText} onChange={setInputText} isLoading={isLoading} 
                        onPaste={() => navigator.clipboard.readText().then(setInputText)}
                        onTrySample={() => setInputText(SAMPLE_TEXT)}
                        suggestions={result?.suggestions || []}
                        tone={tone} onToneChange={setTone}
                        onApplySuggestion={applySingleSuggestion}
                        onIgnoreSuggestion={(s) => setResult(p => p ? {...p, suggestions: p.suggestions.filter(i => i.id !== s.id)} : null)}
                      />
                      <div className="px-8 py-7 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleToggleReadAloud} 
                            disabled={!inputText} 
                            className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-full text-slate-600 hover:text-emerald-600 font-semibold text-[13px] border border-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-30"
                          >
                            {readingStatus === 'playing' ? (
                              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>Pause</>
                            ) : readingStatus === 'paused' ? (
                              <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>Resume</>
                            ) : (
                              <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>Listen</>
                            )}
                          </button>
                          {readingStatus !== 'idle' && (
                            <button onClick={handleStopReadAloud} className="p-3 bg-white text-rose-500 rounded-full border border-slate-200 shadow-sm hover:bg-rose-50 transition-colors">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setInputText(result?.correctedText || inputText); setResult(null); }} disabled={isLoading || !inputText.trim() || errorCount === 0} className={`px-10 py-4 rounded-full font-bold text-[16px] transition-all border shadow-lg active:scale-95 ${errorCount > 0 ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'}`}>
                            {isLoading ? 'Checking...' : `Refine text ${errorCount > 0 ? `(${errorCount})` : ''}`}
                          </button>
                          <div className="relative">
                            <button onClick={() => { setShowMenu(!showMenu); setMenuView('main'); }} className="p-4 bg-white text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                            </button>
                            {showMenu && (
                              <div className="absolute bottom-full mb-4 right-0 bg-white border border-slate-200 rounded-[32px] shadow-2xl p-4 z-30 min-w-[240px] animate-in slide-in-from-bottom-4 zoom-in-95">
                                {menuView === 'main' ? (
                                  <>
                                    <button onClick={handleCopy} className="w-full text-left px-5 py-4 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 rounded-2xl flex items-center gap-4 transition-colors">
                                      <svg fill="currentColor" width="22" height="22" viewBox="0 0 24 24" className="text-slate-700"><path d="M5.5 4.63V17.25c0 1.8 1.46 3.25 3.25 3.25h8.62c-.31.88-1.15 1.5-2.13 1.5H8.75A4.75 4.75 0 014 17.25V6.75c0-.98.63-1.81 1.5-2.12zM17.75 2C18.99 2 20 3 20 4.25v13c0 1.24-1 2.25-2.25 2.25h-9c-1.24 0-2.25-1-2.25-2.25v-13C6.5 3.01 7.5 2 8.75 2h9zm0 1.5h-9a.75.75 0 00-.75.75v13c0 .41.34.75.75.75h9c.41 0 .75-.34.75-.75v-13a.75.75 0 00-.75-.75z" /></svg>
                                      Copy text
                                    </button>
                                    <button onClick={() => setMenuView('download')} className="w-full text-left px-5 py-4 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 rounded-2xl flex items-center justify-between transition-colors group">
                                      <span className="flex items-center gap-4"><svg className="w-5.5 h-5.5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1" /></svg>Export...</span>
                                      <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                    <div className="h-px bg-slate-100 my-2 mx-2"></div>
                                    <button onClick={() => { setInputText(''); setResult(null); setShowMenu(false); }} className="w-full text-left px-5 py-4 text-[14px] font-semibold text-rose-600 hover:bg-rose-50 rounded-2xl flex items-center gap-4 transition-colors">
                                      <svg fill="currentColor" width="22" height="22" viewBox="0 0 24 24" className="text-rose-500"><path d="M10 5h4a2 2 0 10-4 0zM8.5 5a3.5 3.5 0 117 0h5.75a.75.75 0 010 1.5h-1.32l-1.17 12.11A3.75 3.75 0 0115.03 22H8.97a3.75 3.75 0 01-3.73-3.39L4.07 6.5H2.75a.75.75 0 010-1.5H8.5zm2 4.75a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM14.25 9c.41 0 .75.34.75.75v7.5a.75.75 0 01-1.5 0v-7.5c0-.41.34-.75.75-.75zm-7.52 9.47a2.25 2.25 0 002.24 2.03h6.06c1.15 0 2.12-.88 2.24-2.03L18.42 6.5H5.58l1.15 11.97z" /></svg>
                                      Clear
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => setMenuView('main')} className="w-full text-left px-4 py-2 text-[11px] font-bold text-emerald-500 hover:text-emerald-700 flex items-center gap-2 mb-2 bg-emerald-50 rounded-xl">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                      Back
                                    </button>
                                    <button onClick={() => handleDownload('pdf')} className="w-full text-left px-5 py-3.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">PDF Document</button>
                                    <button onClick={() => handleDownload('docx')} className="w-full text-left px-5 py-3.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Word (.doc)</button>
                                    <button onClick={() => handleDownload('txt')} className="w-full text-left px-5 py-3.5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">Plain Text (.txt)</button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            <div className="bg-white">
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
          </>
        );
      case 'pricing':
        return (
          <PageContent title="Simple, transparent pricing" desc="Choose the plan that's right for your writing goals.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-16">
              <div className="border border-slate-200 p-12 rounded-[48px] space-y-8 bg-slate-50 shadow-sm reveal">
                <h3 className="text-3xl font-extrabold">Free</h3>
                <p className="text-slate-500 text-lg">Essential tools for basic writing improvement.</p>
                <div className="text-5xl font-extrabold">$0<span className="text-xl text-slate-400">/mo</span></div>
                <ul className="space-y-5">
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ 5,000 words / month</li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ Basic grammar checker</li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ Paraphrasing tool</li>
                </ul>
                <button className="w-full py-5 bg-white border border-slate-200 rounded-full font-bold text-lg shadow-sm hover:bg-slate-100 transition-colors">Get started</button>
              </div>
              <div className="border-[6px] border-slate-900 p-12 rounded-[48px] space-y-8 shadow-2xl relative bg-white reveal">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-2 rounded-full text-sm font-bold uppercase tracking-widest">Recommended</div>
                <h3 className="text-3xl font-extrabold">Premium</h3>
                <p className="text-slate-500 text-lg">The full power of the AI editorial engine.</p>
                <div className="text-5xl font-extrabold">$12<span className="text-xl text-slate-400">/mo</span></div>
                <ul className="space-y-5">
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ Unlimited volume</li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ Advanced style guide</li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ Deep plagiarism scanning</li>
                  <li className="flex items-center gap-3 text-lg font-medium text-slate-600">✓ 24/7 VIP support</li>
                </ul>
                <button className="w-full py-5 bg-slate-900 text-white rounded-full font-bold text-lg shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform">Upgrade now</button>
              </div>
            </div>
          </PageContent>
        );
      default:
        return <PageContent title={internalPage.charAt(0).toUpperCase() + internalPage.slice(1)} desc={`Information about ${internalPage}.`} />;
    }
  };

  const isHome = currentPath === '/';

  return (
    <div className={`min-h-screen flex flex-col ${isHome ? 'brand-gradient' : 'bg-white'}`}>
      <Header onNavigate={handleNavigate} currentPage={currentPath} />
      {renderCurrentPage()}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;