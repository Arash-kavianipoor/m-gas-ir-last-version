import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Article, TECHNICAL_ARTICLES } from '../data/articles';
import { scrollToElement, scrollToTop as smoothOrInstantScrollToTop } from '../utils/scrollHelper';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Share2,
  Printer,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileText,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onOpenRfq: () => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  onBack,
  onSelectArticle,
  onOpenRfq,
}) => {
  const { currentLanguage, t, isRTL } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  const getLoc = (dict: Record<string, any>) => dict[currentLanguage] || dict.fa || dict.en;

  const title = getLoc(article.title);
  const abstract = getLoc(article.abstract);
  const category = getLoc(article.category);
  const tags: string[] = getLoc(article.tags) || [];
  const takeaways: string[] = getLoc(article.keyTakeaways) || [];
  const authorRole = getLoc(article.author.role);

  // Scroll Progress and Active Section Tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }

      // Check active section
      for (const sec of article.sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) {
            setActiveSectionId(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    smoothOrInstantScrollToTop();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#article=${article.slug}&lang=${currentLanguage}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  const ChevronNext = isRTL ? ChevronLeft : ChevronRight;

  const otherArticles = TECHNICAL_ARTICLES.filter((a) => a.id !== article.id);

  return (
    <div className="min-vh-100 bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white pb-32">
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-slate-900 z-50">
        <div
          className="h-full bg-emerald-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Header / Actions Bar */}
      <header className="sticky top-1.5 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700"
          >
            <ArrowIcon className="w-4 h-4" />
            <span>{t.backToArticles}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title={t.shareArticle}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? (currentLanguage === 'fa' ? 'کپی شد' : 'Copied') : t.shareArticle}</span>
            </button>

            <button
              onClick={handlePrint}
              title={t.printArticle}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.printArticle}</span>
            </button>

            <button
              onClick={onOpenRfq}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-950"
            >
              <span>{t.heroCtaQuote}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Article Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8 font-medium overflow-x-auto whitespace-nowrap pb-2">
          <button onClick={onBack} className="hover:text-emerald-400 transition-colors">
            {t.navHome}
          </button>
          <ChevronNext className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <button onClick={onBack} className="hover:text-emerald-400 transition-colors">
            {t.navArticles}
          </button>
          <ChevronNext className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
          <span className="text-emerald-400 truncate max-w-xs sm:max-w-md">{title}</span>
        </nav>

        {/* Article Header & Hero Banner */}
        <header className="mb-12 border-b border-slate-800 pb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{category}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-6">
            {title}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed mb-8 max-w-4xl bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-800/80">
            {abstract}
          </p>

          {/* Featured High-Res Cover Image */}
          {article.coverImage && (
            <div className="mb-10 rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl relative group aspect-[16/9] max-h-[500px]">
              <img
                src={article.coverImage}
                alt={title}
                width={1200}
                height={675}
                loading="lazy"
                decoding="async"
                style={{ aspectRatio: '16/9' }}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 start-6 text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>M Gas Technical Archive • {category}</span>
              </div>
            </div>
          )}

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-900">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-800 flex-shrink-0 shadow-lg aspect-square">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: '1/1' }}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{article.author.name}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">VERIFIED</span>
                </div>
                <div className="text-xs text-slate-400 max-w-lg mt-0.5">{authorRole}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono">
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">{t.publishedOn}</span>
                <span className="text-slate-300 font-bold">{article.publishDate.split('T')[0]}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">{t.lastUpdated}</span>
                <span className="text-emerald-400 font-bold">{article.modifyDate.split('T')[0]}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 uppercase">{t.readTime}</span>
                <span className="text-slate-300 font-bold">{article.readTimeMinutes} min</span>
              </div>
            </div>
          </div>
        </header>

        {/* Executive Takeaways Box */}
        <section className="mb-14 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-xl">
          <div className="flex items-center gap-2.5 text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-5 h-5" />
            <span>{t.keyHighlights}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {takeaways.map((point, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {point}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Layout: Sidebar TOC + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Table of Contents */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-20 bg-slate-900/80 backdrop-blur-md rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{t.tableOfContents}</span>
              </div>
              <nav className="space-y-1.5">
                {article.sections.map((sec, idx) => {
                  const secTitle = getLoc(sec.title);
                  const isActive = activeSectionId === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToElement(sec.id, 80);
                      }}
                      className={`block px-3 py-2 rounded-xl text-xs transition-all leading-relaxed ${
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-300 font-bold border-r-2 rtl:border-r-0 rtl:border-l-2 border-emerald-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {secTitle}
                    </a>
                  );
                })}
                <a
                  href="#references"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToElement('references', 80);
                  }}
                  className="block px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-all border-t border-slate-800/80 mt-2"
                >
                  {t.referencesTitle}
                </a>
              </nav>

              {/* Quick RFQ Banner in Sidebar */}
              <div className="pt-4 border-t border-slate-800">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/20 text-center">
                  <div className="text-xs font-bold text-white mb-1">
                    {currentLanguage === 'fa' ? 'سفارش سیلندر استاندارد' : 'Standard Cylinder Procurement'}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {currentLanguage === 'fa'
                      ? 'تولید کپسول مطابق کدهای EN 1442 و DOT-4BA'
                      : 'Certified manufacturing per EN 1442 & DOT-4BA'}
                  </p>
                  <button
                    onClick={onOpenRfq}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                  >
                    {t.heroCtaQuote}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Article Sections */}
          <div className="lg:col-span-8 order-1 lg:order-2 space-y-12">
            {article.sections.map((sec, index) => {
              const secTitle = getLoc(sec.title);
              const secContent = getLoc(sec.content);

              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="scroll-mt-28 bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800/80"
                >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 leading-snug flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 border border-emerald-500/20">
                      {index + 1}
                    </span>
                    <span>{secTitle}</span>
                  </h2>

                  <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 mb-6">
                    <p>{secContent}</p>
                  </div>

                  {/* Optional Callout */}
                  {sec.callout && (
                    <div className="my-6 p-4 sm:p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-emerald-300 mb-1">
                          {getLoc(sec.callout.title)}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                          {getLoc(sec.callout.text)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Optional Technical Data Table */}
                  {sec.table && (
                    <div className="my-6 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-inner">
                      <table className="w-full text-xs sm:text-sm text-right rtl:text-right ltr:text-left">
                        <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <tr>
                            {getLoc(sec.table.headers).map((h: string, hIdx: number) => (
                              <th key={hIdx} className="px-4 py-3 font-bold text-emerald-400">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {getLoc(sec.table.rows).map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="hover:bg-slate-900/50 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-4 py-3 ${
                                    cIdx === 0
                                      ? 'font-bold text-white'
                                      : cIdx === 2
                                      ? 'text-emerald-300 font-mono'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}

            {/* References & Works Cited */}
            <section id="references" className="scroll-mt-28 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800">
              <div className="flex items-center gap-2.5 text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{t.referencesTitle}</span>
              </div>
              <ul className="space-y-3">
                {article.references.map((ref) => (
                  <li key={ref.id} className="text-xs sm:text-sm text-slate-400 flex items-start gap-3">
                    <span className="text-emerald-500 font-mono text-xs flex-shrink-0">[{ref.id}]</span>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 break-all text-slate-300"
                    >
                      <span>{ref.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>

            {/* Related Articles Switcher */}
            {otherArticles.length > 0 && (
              <div className="pt-8 border-t border-slate-800">
                <h3 className="text-lg font-bold text-white mb-4">{t.relatedArticles}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherArticles.map((relArt) => (
                    <div
                      key={relArt.id}
                      onClick={() => onSelectArticle(relArt)}
                      className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group overflow-hidden flex flex-col"
                    >
                      {relArt.coverImage && (
                        <div className="h-32 w-full overflow-hidden bg-slate-950 aspect-[16/9]">
                          <img
                            src={relArt.coverImage}
                            alt={getLoc(relArt.title)}
                            width={400}
                            height={225}
                            loading="lazy"
                            decoding="async"
                            style={{ aspectRatio: '16/9' }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase block mb-1">
                          {getLoc(relArt.category)}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 mb-2">
                          {getLoc(relArt.title)}
                        </h4>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-auto">
                          <Clock className="w-3 h-3" />
                          {relArt.readTimeMinutes} {t.readTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
