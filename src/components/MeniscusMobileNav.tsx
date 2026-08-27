import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Layers,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { scrollToElement, scrollToTop as smoothOrInstantScrollToTop } from '../utils/scrollHelper';

export interface MeniscusNavProps {
  onOpenRfq?: () => void;
  onExploreProducts?: () => void;
  activeSectionOverride?: string | null;
}

interface NavItem {
  id: string;
  href: string;
  labelKey: 'navHome' | 'navProducts' | 'navQuality' | 'navCalculator';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  gradient: string;
  glowColor: string;
}

export const MeniscusMobileNav: React.FC<MeniscusNavProps> = ({
  onOpenRfq,
  onExploreProducts,
  activeSectionOverride,
}) => {
  const { t, isRTL } = useLanguage();

  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const navItems: NavItem[] = [
    {
      id: 'hero',
      href: '#hero',
      labelKey: 'navHome',
      icon: Flame,
      color: '#10b981',
      gradient: 'from-emerald-400 via-teal-400 to-emerald-600',
      glowColor: 'rgba(16, 185, 129, 0.35)',
    },
    {
      id: 'products',
      href: '#products',
      labelKey: 'navProducts',
      icon: Layers,
      color: '#06b6d4',
      gradient: 'from-cyan-400 via-sky-400 to-blue-600',
      glowColor: 'rgba(6, 182, 212, 0.35)',
    },
    {
      id: 'quality',
      href: '#quality',
      labelKey: 'navQuality',
      icon: ShieldCheck,
      color: '#f59e0b',
      gradient: 'from-amber-400 via-yellow-400 to-orange-600',
      glowColor: 'rgba(245, 158, 11, 0.35)',
    },
    {
      id: 'calculator',
      href: '#calculator',
      labelKey: 'navCalculator',
      icon: Calculator,
      color: '#ec4899',
      gradient: 'from-pink-400 via-rose-400 to-red-500',
      glowColor: 'rgba(236, 72, 153, 0.35)',
    },
  ];

  /*
   * Keep visual order correct for RTL.
   */
  const items = isRTL
    ? [...navItems].reverse()
    : navItems;

  /*
   * Track current section.
   *
   * Important:
   * We deliberately avoid expensive IntersectionObserver /
   * animation calculations here. This keeps mobile scrolling light.
   */
  useEffect(() => {
    if (activeSectionOverride) {
      const idx = items.findIndex(
        (item) => item.id === activeSectionOverride
      );

      if (idx !== -1) {
        setActiveIndex(idx);
      }

      return;
    }

    const SECTION_ORDER = [
      'hero',
      'products',
      'quality',
      'calculator',
    ];

    let lastScrollTime = 0;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const performSectionCheck = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;

      /*
       * Bottom of page.
       */
      if (scrollY + windowHeight >= docHeight - 140) {
        const calcIdx = items.findIndex((item) => item.id === 'calculator');
        if (calcIdx !== -1) {
          setActiveIndex(calcIdx);
        }
        return;
      }

      let currentSectionId = 'hero';
      for (let i = SECTION_ORDER.length - 1; i >= 0; i--) {
        const sectionId = SECTION_ORDER[i];
        const element = document.getElementById(sectionId);
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.45 && rect.bottom > 80) {
          currentSectionId = sectionId;
          break;
        }
      }

      const index = items.findIndex((item) => item.id === currentSectionId);
      if (index !== -1 && index !== activeIndex) {
        setActiveIndex(index);
      }
    };

    const handleScroll = () => {
      const now = Date.now();
      // Throttle to at most once per 120ms to prevent GPU compositor lockup
      if (now - lastScrollTime > 120) {
        lastScrollTime = now;
        performSectionCheck();
      } else {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(performSectionCheck, 120);
      }
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      { passive: true }
    );

    performSectionCheck();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [activeSectionOverride, isRTL]);

  /*
   * Navigation click.
   */
  const handleSelect = (index: number) => {
    setActiveIndex(index);

    const item = items[index];

    if (
      item.id === 'calculator' &&
      onOpenRfq
    ) {
      onOpenRfq();
      return;
    }

    if (
      item.id === 'products' &&
      onExploreProducts
    ) {
      onExploreProducts();
      return;
    }

    if (item.id === 'hero') {
      smoothOrInstantScrollToTop();
    } else {
      scrollToElement(item.id);
    }
  };

  /*
   * Touch slider.
   */
  const handleTouchMove = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    if (!containerRef.current) return;

    const touch = e.touches[0];

    if (!touch) return;

    const rect =
      containerRef.current.getBoundingClientRect();

    const touchX =
      touch.clientX - rect.left;

    const clampedX = Math.max(
      0,
      Math.min(rect.width, touchX)
    );

    const segmentWidth =
      rect.width / items.length;

    const newIndex = Math.min(
      items.length - 1,
      Math.max(
        0,
        Math.floor(
          clampedX / segmentWidth
        )
      )
    );

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleTouchEnd = () => {
    handleSelect(activeIndex);
  };

  const activeItem =
    items[activeIndex] || items[0];

  const ActiveIcon =
    activeItem.icon;

  return (
    <nav
      id="meniscus-mobile-nav"
      aria-label="Mobile Navigation Dock"
      className="
        fixed
        bottom-3
        inset-x-0
        z-40
        lg:hidden
        flex
        flex-col
        items-center
        justify-end
        pointer-events-none
        px-3
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div
        ref={containerRef}
        dir="ltr"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="
          pointer-events-auto
          relative
          w-full
          max-w-[364px]
          h-[56px]
          rounded-full
          bg-[#081219]
          border
          border-slate-700/80
          px-1.5
          flex
          items-center
          justify-between
          select-none
          overflow-visible
          shadow-[0_12px_30px_rgba(0,0,0,0.75)]
        "
        style={{
          boxShadow: `0 12px 30px rgba(0,0,0,0.75), 0 0 12px ${activeItem.glowColor}`,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Top Highlight */}
        <div
          className="
            absolute
            inset-x-8
            top-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/25
            to-transparent
            pointer-events-none
            rounded-full
          "
        />

        {/*
         * Active notch.
         */}
        <motion.div
          className="
            absolute
            -top-[3px]
            h-[16px]
            w-[60px]
            -translate-x-1/2
            pointer-events-none
            z-10
          "
          initial={false}
          animate={{
            left: `${
              ((activeIndex + 0.5) /
                items.length) *
              100
            }%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 30,
            mass: 0.8,
          }}
        >
          <svg
            viewBox="0 0 60 16"
            className="
              w-full
              h-full
              text-[#081219]
              fill-current
            "
            aria-hidden="true"
          >
            <path d="M0,0 C15,0 19,16 30,16 C41,16 45,0 60,0 Z" />
          </svg>
        </motion.div>

        {/*
         * Active floating icon.
         */}
        <motion.div
          className="
            absolute
            -top-[30px]
            w-12
            h-12
            -translate-x-1/2
            rounded-full
            flex
            items-center
            justify-center
            pointer-events-none
            z-20
          "
          initial={false}
          animate={{
            left: `${
              ((activeIndex + 0.5) /
                items.length) *
              100
            }%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 30,
            mass: 0.8,
          }}
        >
          <motion.div
            key={`active-${activeItem.id}`}
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.16,
              ease: 'easeOut',
            }}
            className={`
              w-full
              h-full
              rounded-full
              bg-gradient-to-br
              ${activeItem.gradient}
              p-[2px]
              flex
              items-center
              justify-center
            `}
            style={{
              boxShadow: `0 8px 18px ${activeItem.glowColor}`,
            }}
          >
            <div
              className="
                w-full
                h-full
                rounded-full
                bg-slate-950
                flex
                items-center
                justify-center
                text-white
                border
                border-white/15
              "
            >
              <ActiveIcon
                size={20}
                className="
                  text-white
                "
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation tabs */}
        {items.map((item, index) => {
          const isActive =
            activeIndex === index;

          const rawLabel =
            t[item.labelKey] || item.id;

          const label =
            item.id === 'calculator' &&
            isRTL
              ? 'استعلام'
              : rawLabel;

          return (
            <button
              key={item.id}
              type="button"
              id={`meniscus-tab-${item.id}`}
              onClick={() =>
                handleSelect(index)
              }
              className="
                relative
                flex-1
                h-full
                flex
                flex-col
                items-center
                justify-center
                pt-2.5
                pb-1
                rounded-full
                focus:outline-none
                select-none
                active:scale-[0.98]
                group
                px-1
              "
              aria-label={label}
            >
              <span
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`
                  text-[12px]
                  tracking-tight
                  transition-all
                  duration-150
                  line-clamp-1
                  truncate
                  max-w-[76px]
                  text-center
                  ${
                    isActive
                      ? 'font-bold opacity-100'
                      : 'font-medium text-slate-400 opacity-75 group-hover:opacity-100 group-hover:text-slate-200'
                  }
                `}
                style={{
                  color: isActive
                    ? item.color
                    : undefined,
                  textShadow: isActive
                    ? `0 0 6px ${activeItem.glowColor}`
                    : 'none',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
