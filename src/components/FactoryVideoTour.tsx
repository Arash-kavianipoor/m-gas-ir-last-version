import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  UserCheck,
  Factory,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Video as VideoIcon,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../i18n/LanguageContext';
import { FACTORY_VIDEOS, FactoryVideo } from '../data/factoryVideos';

export const FactoryVideoTour: React.FC = () => {
  const { currentLanguage, isRTL } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<FactoryVideo>(FACTORY_VIDEOS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getLoc = (record: Record<string, string> | undefined) => {
    if (!record) return '';
    return record[currentLanguage] || record['fa'] || record['en'] || '';
  };

  const getLocArray = (record: Record<string, string[]> | undefined) => {
    if (!record) return [];
    return record[currentLanguage] || record['fa'] || record['en'] || [];
  };

  const handleSelectVideo = (video: FactoryVideo) => {
    setSelectedVideo(video);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  };

  const isFa = currentLanguage === 'fa';

  return (
    <section id="factory-tour" className="py-20 bg-gradient-to-b from-[#050D12] via-[#07131A] to-[#050D12] relative overflow-hidden border-t border-slate-800/60">
      {/* Ambient background glows - desktop GPU only */}
      <div className="hidden lg:block absolute top-1/4 -start-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 -end-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-4 shadow-lg">
            <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isFa ? 'تور تصویری و مستند خطوط تولید' : 'Factory Video Tour & Production Process'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            {isFa ? (
              <>
                مشاهده مستقیم <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">فرآیند تولید و کارخانه</span>
              </>
            ) : (
              <>
                Inside <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">M Gas Factory & Production Lines</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-base text-slate-300 mt-3 leading-relaxed">
            {isFa
              ? 'بازدید از سالن‌های مجهز قالب‌گیری، پرس‌های تناژ بالا، ربات‌های جوشکاری استاندارد و نظارت مستقیم مدیریت کارخانه بر کیفیت کپسول‌ها'
              : 'Explore our high-tonnage hydraulic presses, automated welding lines, oven powder coating, and executive leadership supervision.'}
          </p>
        </div>

        {/* Main Video Theater Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Video Player Screen (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div
              ref={containerRef}
              className="relative rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500/30 shadow-2xl group"
            >
              {/* HTML5 Video Element */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={selectedVideo.videoSrc}
                  poster={selectedVideo.thumbnail}
                  playsInline
                  muted={isMuted}
                  loop
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={togglePlay}
                />

                {/* Video screen area (clicking video toggles play/pause) */}

                {/* Top Badge Overlay */}
                <div className="absolute top-4 start-4 z-20 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md ${
                    selectedVideo.isManagerTour
                      ? 'bg-amber-500/90 text-slate-950 border border-amber-300'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {selectedVideo.isManagerTour ? (
                      <UserCheck className="w-4 h-4 text-slate-950" />
                    ) : (
                      <Factory className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{getLoc(selectedVideo.badge)}</span>
                  </span>

                  {selectedVideo.isManagerTour && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950/80 text-amber-300 border border-amber-500/40 text-xs font-mono backdrop-blur-md">
                      Mousa Amooie
                    </span>
                  )}
                </div>

                {/* Floating Bottom Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex items-center justify-between gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-500 hover:text-slate-950 text-white border border-white/20 backdrop-blur-md transition-colors"
                      title={isPlaying ? 'توقف' : 'پخش'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur-md transition-colors"
                      title={isMuted ? 'صدا' : 'بی‌صدا'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <span className="text-xs font-mono text-slate-300 hidden sm:inline-block px-2">
                      M Gas Factory • HD 1080p
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-white/20 backdrop-blur-md transition-colors"
                    title="تمام صفحه"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Details Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  {selectedVideo.subtitle && (
                    <span className="text-xs font-bold text-amber-400 block mb-1">
                      {getLoc(selectedVideo.subtitle)}
                    </span>
                  )}
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    {getLoc(selectedVideo.title)}
                  </h3>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs font-semibold shrink-0 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4" />
                  {isFa ? 'استاندارد معتبر' : 'ISO & ISIRI Certified'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {getLoc(selectedVideo.description)}
              </p>

              {/* Highlights Pill Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                {getLocArray(selectedVideo.highlights).map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Playlist & Video Cards (4 Cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{isFa ? 'فهرست ویدیوهای کارخانه (۴ ویدیو)' : 'Factory Video Gallery (4 Videos)'}</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30">
                {FACTORY_VIDEOS.length} Videos
              </span>
            </div>

            <div className="space-y-3">
              {FACTORY_VIDEOS.map((video, vIdx) => {
                const isSelected = selectedVideo.id === video.id;

                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleSelectVideo(video)}
                    className={`w-full text-start p-3.5 rounded-2xl border transition-all duration-200 flex gap-3.5 items-center group relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-900 border-amber-400/90 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/40'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/90 hover:border-emerald-500/40'
                    }`}
                  >
                    {/* Thumbnail with mini play icon */}
                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-white/10 group-hover:border-emerald-400/40 transition-colors aspect-[16/10]">
                      <img
                        src={video.thumbnail}
                        alt={getLoc(video.title)}
                        width={112}
                        height={72}
                        loading="lazy"
                        decoding="async"
                        style={{ aspectRatio: '16/10' }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        isSelected ? 'bg-amber-500/20' : 'bg-black/30 group-hover:bg-black/10'
                      }`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow ${
                          isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/80 text-white group-hover:bg-emerald-500 group-hover:text-slate-950'
                        } transition-colors`}>
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      {video.isManagerTour && (
                        <div className="absolute top-1 start-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px]">
                          VIP
                        </div>
                      )}

                      {video.duration && (
                        <div className="absolute bottom-1 end-1 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[9px] border border-white/20">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          video.isManagerTour
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {getLoc(video.badge)}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-amber-400 animate-pulse">
                            {isFa ? 'در حال پخش' : 'Playing'}
                          </span>
                        )}
                      </div>

                      <h5 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                        {getLoc(video.title)}
                      </h5>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {getLoc(video.description)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
