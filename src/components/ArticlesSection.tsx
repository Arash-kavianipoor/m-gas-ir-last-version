import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { TECHNICAL_ARTICLES, Article } from '../data/articles';
import { BookOpen, Clock, Calendar, ArrowRight, ArrowLeft, Award, CheckCircle2, ShieldCheck, Tag, ExternalLink } from 'lucide-react';

interface ArticlesSectionProps {
  onSelectArticle: (article: Article) => void;
}

export const ArticlesSection: React.FC<ArticlesSectionProps> = ({ onSelectArticle }) => {
  const { currentLanguage, t, isRTL } = useLanguage();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const getLoc = (dict: Record<string, any>) => dict[currentLanguage] || dict.fa || dict.en;

  const allTags = Array.from(
    new Set(
      TECHNICAL_ARTICLES.flatMap((art) => getLoc(art.tags) || [])
    )
  );

  const filteredArticles = selectedTag
    ? TECHNICAL_ARTICLES.filter((art) => (getLoc(art.tags) || []).includes(selectedTag))
    : TECHNICAL_ARTICLES;

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="articles" className="relative py-24 bg-slate-950 text-white overflow-hidden border-t border-slate-800">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Ambient Glows - desktop GPU only */}
      <div className="hidden lg:block absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>{t.articlesBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
            {t.articlesTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            {t.articlesSubtitle}
          </p>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedTag === null
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
            }`}
          >
            {currentLanguage === 'fa' ? 'همه موضوعات' : 'All Topics'}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedTag === tag
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Tag className="w-3 h-3 opacity-60" />
              <span>{tag}</span>
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredArticles.map((article, idx) => {
            const title = getLoc(article.title);
            const abstract = getLoc(article.abstract);
            const category = getLoc(article.category);
            const tags: string[] = getLoc(article.tags) || [];
            const takeaways: string[] = getLoc(article.keyTakeaways) || [];
            const authorRole = getLoc(article.author.role);

            return (
              <article
                key={article.id}
                className="group relative flex flex-col bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-emerald-500/40 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/20"
              >
                {/* Article Cover Image Banner */}
                <div
                  onClick={() => onSelectArticle(article)}
                  className="relative w-full h-48 sm:h-56 overflow-hidden cursor-pointer bg-slate-950 border-b border-slate-800/80 aspect-[16/9]"
                >
                  <img
                    src={article.coverImage}
                    alt={title}
                    width={600}
                    height={338}
                    loading="lazy"
                    decoding="async"
                    style={{ aspectRatio: '16/9' }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                  
                  {/* Category Pill Overlaid on Image */}
                  <div className="absolute top-4 start-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-lg">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {category}
                    </span>
                  </div>

                  {/* Read Time Pill */}
                  <div className="absolute bottom-3 end-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800 text-[11px] font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {article.readTimeMinutes} {t.readTime}
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-3 mb-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {article.modifyDate.split('T')[0]}
                    </span>
                    <span className="text-emerald-400/80 font-medium">M Gas Technical Directorate</span>
                  </div>

                  {/* Article Title */}
                  <h3
                    onClick={() => onSelectArticle(article)}
                    className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer leading-snug mb-4"
                  >
                    {title}
                  </h3>

                  {/* Abstract */}
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {abstract}
                  </p>

                {/* Key Takeaways Preview */}
                <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 mb-6 space-y-2">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t.keyHighlights}
                  </div>
                  {takeaways.slice(0, 2).map((point, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span className="line-clamp-2">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Tags List */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {tags.slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-slate-800/80 text-slate-300 text-[11px] font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author & CTA Button */}
                <div className="mt-auto pt-5 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-500/30 bg-slate-800 flex-shrink-0 aspect-square">
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        style={{ aspectRatio: '1/1' }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{article.author.name}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{authorRole}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectArticle(article)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-emerald-950 hover:gap-3 flex-shrink-0"
                  >
                    <span>{t.readArticleBtn}</span>
                    <ArrowIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        </div>
      </div>
    </section>
  );
};
