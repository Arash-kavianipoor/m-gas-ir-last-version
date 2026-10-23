import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Security, CORS, and Caching Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range, Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    // 1. Redirect HTTP to HTTPS in production behind reverse proxies
    const proto = req.headers['x-forwarded-proto'];
    const host = (req.headers.host || '').toLowerCase();

    if (isProd && proto && proto === 'http') {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }

    // 2. Redirect www.mgas.ir or www.*.mgas.ir to non-www equivalent
    if (host.startsWith('www.') && host.includes('mgas.ir')) {
      const nonWwwHost = host.replace(/^www\./, '');
      return res.redirect(301, `https://${nonWwwHost}${req.originalUrl}`);
    }

    // 3. Typo Redirects for crawler requests
    if (req.path === '/robot.txt') {
      return res.redirect(301, '/robots.txt');
    }
    if (req.path === '/site-map.xml') {
      return res.redirect(301, '/sitemap.xml');
    }

    // 4. ELIMINATE SEO CANNIBALIZATION: Permanent 301 redirect any ?lang= query parameters
    // Focus activity strictly on dedicated subdomains (e.g., https://en.mgas.ir/ or https://de.mgas.ir/)
    if (req.query.lang) {
      const targetLang = String(req.query.lang).toLowerCase();
      const cleanPath = req.path;
      if (targetLang === 'fa') {
        return res.redirect(301, `https://mgas.ir${cleanPath === '/' ? '' : cleanPath}`);
      }
      const validSubdomains = ['en', 'ar', 'de', 'ur', 'tr', 'ru', 'hy'];
      if (validSubdomains.includes(targetLang)) {
        return res.redirect(301, `https://${targetLang}.mgas.ir${cleanPath === '/' ? '' : cleanPath}`);
      }
    }

    next();
  });

  // Health check API
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'mgas-portal', time: new Date().toISOString() });
  });

  // API 404 handler
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'Endpoint Not Found' });
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files with proper caching headers
    app.use(
      express.static(path.resolve(__dirname, 'dist'), {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (filePath.endsWith('.xml') || filePath.endsWith('.txt')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
          }
        },
      })
    );

    // Reject missing asset requests with clean 404 instead of falling back to index.html
    app.get(/\.(png|jpg|jpeg|webp|svg|ico|gif|mp4|webm|woff2|woff|ttf|css|js|map|json)$/, (req, res) => {
      res.status(404).send('Asset Not Found');
    });

    // SPA fallback for HTML pages only
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`M Gas Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
