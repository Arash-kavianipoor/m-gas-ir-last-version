/**
 * Device & Browser Detection Utility
 * Specialized in identifying Mobile Chrome, Android WebViews, and mobile GPU constraints
 * to prevent GPU context loss, Skia raster crashes, and rendering lag.
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isMobileChrome: boolean;
  isAndroid: boolean;
  isiOS: boolean;
  isTouch: boolean;
  lowGpuMode: boolean;
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isMobileChrome: false,
      isAndroid: false,
      isiOS: false,
      isTouch: false,
      lowGpuMode: false,
    };
  }

  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  const isiOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isTouch = navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
  
  // Detect Chrome on Mobile / Android (including Chromium-based Samsung Internet, Edge mobile, etc.)
  const isChrome = /Chrome|CriOS|CrMo/i.test(ua);
  const isMobileUA = /Mobile|Android|iPhone|iPod/i.test(ua);
  const isTabletUA = /iPad|Tablet/i.test(ua) || (isAndroid && !/Mobile/i.test(ua));
  
  const isSmallScreen = window.innerWidth <= 1024;
  const isMobile = (isMobileUA || (isTouch && isSmallScreen)) && !isTabletUA;
  const isTablet = isTabletUA || (isTouch && window.innerWidth > 768 && window.innerWidth <= 1024);
  
  // Target Mobile Chrome specifically (most susceptible to Skia GPU process crashes with large blur & SVG masks)
  const isMobileChrome = (isAndroid && isChrome) || (isMobile && isChrome);

  // If mobile or mobile Chrome, enable lowGpuMode to strip out intensive filters
  const lowGpuMode = isMobile || isTablet || isMobileChrome || isTouch;

  return {
    isMobile,
    isTablet,
    isMobileChrome,
    isAndroid,
    isiOS,
    isTouch,
    lowGpuMode,
  };
}

/**
 * Applies CSS class markers to <html> element to enable zero-overhead CSS rules
 */
export function applyDeviceClassesToHtml(): DeviceInfo {
  const info = detectDevice();
  
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement;
    
    if (info.isMobile) root.classList.add('is-mobile-device');
    if (info.isTablet) root.classList.add('is-tablet-device');
    if (info.isAndroid) root.classList.add('is-android');
    if (info.isiOS) root.classList.add('is-ios');
    if (info.isMobileChrome) root.classList.add('is-mobile-chrome');
    if (info.lowGpuMode) root.classList.add('gpu-safe-mode');
  }

  return info;
}
