import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string, options?: { replace?: boolean; scrollToTop?: boolean }) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function safeReplaceState(url: string) {
  try {
    window.history.replaceState({}, '', url);
  } catch {}
}

function safePushState(url: string) {
  try {
    window.history.pushState({}, '', url);
  } catch {
    safeReplaceState(url);
  }
}

/**
 * Normalizes URL path, stripping trailing slash (except root) and resolving legacy hash anchors
 */
function resolveInitialPath(): string {
  if (typeof window === 'undefined') return '/';

  try {
    const hash = window.location.hash || '';
    const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

    // 1. Upgrade legacy hash URLs to clean canonical paths
    if (hash.startsWith('#article=')) {
      const slug = hash.replace('#article=', '').split('&')[0];
      const cleanPath = `/articles/${slug}`;
      safeReplaceState(cleanPath);
      return cleanPath;
    }

    if (hash.startsWith('#product=')) {
      const slug = hash.replace('#product=', '').split('&')[0];
      const cleanPath = `/products/${slug}`;
      safeReplaceState(cleanPath);
      return cleanPath;
    }

    if (hash.startsWith('#')) {
      const section = hash.replace('#', '').split('&')[0].split('?')[0];
      if (section === 'history') {
        const cleanPath = '/about';
        safeReplaceState(cleanPath);
        return cleanPath;
      }
      const cleanSections = ['products', 'quality', 'factory-tour', 'articles', 'faq', 'calculator', 'contact', 'about', 'certificates'];
      if (cleanSections.includes(section)) {
        const cleanPath = `/${section}`;
        safeReplaceState(cleanPath);
        return cleanPath;
      }
    }

    return pathname;
  } catch {
    return '/';
  }
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(resolveInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname.replace(/\/+$/, '') || '/';
        setCurrentPath(path);
      } catch {}
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean; scrollToTop?: boolean }) => {
    if (typeof window === 'undefined') return;

    const normalizedPath = path.replace(/\/+$/, '') || '/';

    if (options?.replace) {
      safeReplaceState(normalizedPath);
    } else {
      safePushState(normalizedPath);
    }

    setCurrentPath(normalizedPath);

    if (options?.scrollToTop !== false) {
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      } catch {
        try {
          window.scrollTo(0, 0);
        } catch {}
      }
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
