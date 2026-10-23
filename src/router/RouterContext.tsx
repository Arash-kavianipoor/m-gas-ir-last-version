import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean; scrollToTop?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

/**
 * Normalizes URL path, stripping trailing slash (except root) and resolving legacy hash anchors
 */
function resolveInitialPath(): string {
  if (typeof window === 'undefined') return '/';

  const hash = window.location.hash;
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  // 1. Upgrade legacy hash URLs to clean canonical paths
  if (hash.startsWith('#article=')) {
    const slug = hash.replace('#article=', '').split('&')[0];
    const cleanPath = `/articles/${slug}`;
    window.history.replaceState({}, '', cleanPath);
    return cleanPath;
  }

  if (hash.startsWith('#product=')) {
    const slug = hash.replace('#product=', '').split('&')[0];
    const cleanPath = `/products/${slug}`;
    window.history.replaceState({}, '', cleanPath);
    return cleanPath;
  }

  if (hash.startsWith('#')) {
    const section = hash.replace('#', '').split('&')[0].split('?')[0];
    if (section === 'history') {
      const cleanPath = '/about';
      window.history.replaceState({}, '', cleanPath);
      return cleanPath;
    }
    const cleanSections = ['products', 'quality', 'factory-tour', 'articles', 'faq', 'calculator', 'contact', 'about'];
    if (cleanSections.includes(section)) {
      const cleanPath = `/${section}`;
      window.history.replaceState({}, '', cleanPath);
      return cleanPath;
    }
  }

  return pathname;
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(resolveInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean; scrollToTop?: boolean }) => {
    if (typeof window === 'undefined') return;

    const normalizedPath = path.replace(/\/+$/, '') || '/';

    if (options?.replace) {
      window.history.replaceState({}, '', normalizedPath);
    } else {
      window.history.pushState({}, '', normalizedPath);
    }

    setCurrentPath(normalizedPath);

    if (options?.scrollToTop !== false) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

/**
 * Semantic Link component that supports both SEO crawler discovery (href) and instant SPA navigation
 */
export const Link: React.FC<{
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  title?: string;
  rel?: string;
  'aria-label'?: string;
}> = ({ to, className, children, onClick, title, rel, 'aria-label': ariaLabel }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // If middle-click or modifier keys (Ctrl/Cmd) are used, let browser open in new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    // Only intercept local paths starting with /
    if (to.startsWith('/')) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a
      href={to}
      onClick={handleClick}
      className={className}
      title={title}
      rel={rel}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
};
