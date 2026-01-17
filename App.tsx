
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
          <button onClick={() => onNavigate('/login')} className="hidden md:block px-5 py-2.5 font-bold text-[14px] text-slate-600 hover:text-slate-900">Log in</button>
          <button onClick={() => onNavigate('/signup')} className="px-5 py-2.5 md:px-7 md:py-3 font-bold text-[13px] md:text-[14px] rounded-full transition-all bg-[#2ba37b] text-white hover:opacity-90 shadow-lg shadow-[#2ba37b]/20">Create account</button>
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
             <button onClick={() => { onNavigate('/signup'); setMobileMenuOpen(false); }} className="w-full py-4 font-bold bg-[#2ba37b] text-white rounded-2xl shadow-xl shadow-[#2ba37b]/20 font-arimo">Create account</button>
          </div>
        </div>
      )}
    </header>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { 
      q: "How accurate is Outparse's grammar checking?", 
      a: "Outparse uses advanced AI models with 99% accuracy for common grammar errors. It continuously learns from user corrections and updates to improve its suggestions." 
    },
    { 
      q: "What types of documents can I check?", 
      a: "You can check essays, reports, emails, blog posts, academic papers, business documents, and more. Outparse supports various formats including plain text and will soon support document uploads." 
    },
    { 
      q: "Is my content private and secure?", 
      a: "Yes, we take privacy seriously. Your content is encrypted in transit and at rest. We don't store your text for longer than needed to provide the service, and we never use your content for training without explicit permission." 
    },
    { 
      q: "What languages are supported?", 
      a: "Currently, we support English (US, UK, AU, and CA variants) with plans to add Spanish, French, German, and other major languages in upcoming updates." 
    },
    { 
      q: "What AI technology does Outparse use?", 
      a: "Outparse uses Google's Gemini AI combined with custom NLP models specifically trained for grammar correction. This combination provides both accuracy and context-aware suggestions." 
    }
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

const Footer = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = {
    newsletter: (
      <div className="space-y-4">
        <input 
          type="email" 
          placeholder="Your email address" 
          className="w-full px-5 py-3 rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
        />
        <button className="w-full py-3 bg-[#2ba37b] text-white font-bold rounded-full hover:opacity-90 transition-opacity">
          Subscribe
        </button>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          By subscribing, you agree to our <a href="/privacy-policy" className="underline hover:text-slate-600">Privacy Policy</a> and consent to receive updates from our company.
        </p>
      </div>
    ),
    features: (
      <ul className="space-y-4 text-sm text-slate-500 font-medium">
        <li><button className="hover:text-slate-900">Grammar Checker</button></li>
        <li><button className="hover:text-slate-900">Word Counter</button></li>
        <li><button className="hover:text-slate-900">Translator</button></li>
        <li><button className="hover:text-slate-900">Word Puzzle</button></li>
        <li><button className="hover:text-slate-900">Vocabulary Builder</button></li>
        <li><button className="hover:text-slate-900">Crossword</button></li>
        <li><button className="hover:text-slate-900">Spell Checker</button></li>
      </ul>
    ),
    company: (
      <ul className="space-y-4 text-sm text-slate-500 font-medium">
        <li><button onClick={() => onNavigate('/about-us')} className="hover:text-slate-900">About Us</button></li>
        <li><button className="hover:text-slate-900">Contact Us</button></li>
        <li><button className="hover:text-slate-900">Privacy Policy</button></li>
        <li><button className="hover:text-slate-900">Terms of Service</button></li>
      </ul>
    ),
    connect: (
      <ul className="space-y-4 text-sm text-slate-500 font-medium">
        <li><button className="hover:text-slate-900">Facebook</button></li>
        <li><button className="hover:text-slate-900">Instagram</button></li>
        <li><button className="hover:text-slate-900">LinkedIn</button></li>
        <li><button className="hover:text-slate-900">Twitter</button></li>
        <li><button className="hover:text-slate-900">YouTube</button></li>
      </ul>
    )
  };

  return (
    <footer className="bg-white text-slate-900 pt-32 pb-12 border-t border-slate-100">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24">
        {/* Desktop View */}
        <div className="hidden md:grid md:grid-cols-5 gap-12 mb-32">
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-[17px] font-bold text-slate-900">Sign up for writing tips and product updates</h4>
            {sections.newsletter}
          </div>
          <div className="space-y-6">
            <h4 className="text-[17px] font-bold text-slate-900">Features</h4>
            {sections.features}
          </div>
          <div className="space-y-6">
            <h4 className="text-[17px] font-bold text-slate-900">Company</h4>
            {sections.company}
          </div>
          <div className="space-y-6">
            <h4 className="text-[17px] font-bold text-slate-900">Connect</h4>
            {sections.connect}
          </div>
        </div>

        {/* Mobile Accordion View */}
        <div className="md:hidden space-y-2 mb-20">
          {[
            { id: 'newsletter', title: 'Sign up for writing tips and product updates' },
            { id: 'features', title: 'Features' },
            { id: 'company', title: 'Company' },
            { id: 'connect', title: 'Connect' }
          ].map((item) => (
            <div key={item.id} className="border-b border-slate-100">
              <button 
                onClick={() => toggleSection(item.id)}
                className="w-full py-6 flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold text-slate-900">{item.title}</span>
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${openSection === item.id ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openSection === item.id ? 'max-h-[400px] pb-8' : 'max-h-0'}`}>
                {sections[item.id as keyof typeof sections]}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[13px] font-medium text-slate-400 order-2 md:order-1">
            © 2026 Outparse. All rights reserved.
          </p>
          <div className="flex items-center gap-6 order-1 md:order-2">
            <button className="text-[13px] font-bold text-blue-600 hover:underline">Sitemap</button>
            <button className="text-[13px] font-bold text-blue-600 hover:underline">LLM.txt</button>
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
    
    if (result) {
      const diff = s.replacement.length - s.original.length;
      const updatedSuggestions = result.suggestions
        .filter(item => item.id !== s.id)
        .map(item => {
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
          <div className="max-w-[1400px] mx-auto px-8 md:px-12 lg:px-24 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
            <div className="text-left space-y-6 reveal flex-1 lg:max-w-[45%]">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tighter leading-tight font-arimo">
                Grammar checking
              </h1>
              <p className="text-slate-600/80 text-xl font-medium leading-relaxed font-arimo">
                Use Outparse to improve your writing, catch mistakes, and use best practices to write like a pro.
              </p>
            </div>
            <div className="w-full flex-1 reveal delay-1 lg:max-w-[50%]">
              <div className={`rounded-[25px] overflow-hidden shadow-2xl transition-all duration-300 ${isLoading ? 'check-gradient-border' : ''}`}>
                <div className={`${isLoading ? 'check-gradient-inner rounded-[22px]' : ''}`}>
                  <Editor 
                    value={inputText} onChange={(val) => { setInputText(val); if(result) setResult(null); }} 
                    isLoading={isLoading} 
                    credits={credits}
                    onUploadDoc={() => {}} // This is handled within Editor.tsx via file input
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
        <FAQSection />
      </main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
