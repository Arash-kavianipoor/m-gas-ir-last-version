/**
 * Utility to perform smooth scrolling on desktop and instant scrolling on mobile
 * to prevent GPU compositor tearing and main-thread layout jank on mobile browsers.
 */

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

export const scrollToElement = (elementOrId: HTMLElement | string, offset = 0): void => {
  if (typeof window === 'undefined') return;

  const target = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!target) return;

  const isMobile = isMobileDevice();

  if (isMobile) {
    // Instant scroll on mobile to avoid compositor lag
    const rect = target.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const targetY = Math.max(0, rect.top + scrollTop - offset);
    try {
      window.scrollTo({
        top: targetY,
        behavior: 'auto',
      });
    } catch {
      window.scrollTo(0, targetY);
    }
  } else {
    // Smooth scroll on desktop with legacy fallback
    try {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } catch {
      try {
        target.scrollIntoView(true);
      } catch {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        window.scrollTo(0, Math.max(0, rect.top + scrollTop - offset));
      }
    }
  }
};

export const scrollToTop = (): void => {
  if (typeof window === 'undefined') return;
  const isMobile = isMobileDevice();
  try {
    window.scrollTo({
      top: 0,
      behavior: isMobile ? 'auto' : 'smooth',
    });
  } catch {
    window.scrollTo(0, 0);
  }
};
