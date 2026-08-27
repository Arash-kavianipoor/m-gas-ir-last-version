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
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - offset;
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'auto',
    });
  } else {
    // Smooth scroll on desktop
    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

export const scrollToTop = (): void => {
  if (typeof window === 'undefined') return;
  const isMobile = isMobileDevice();
  window.scrollTo({
    top: 0,
    behavior: isMobile ? 'auto' : 'smooth',
  });
};
