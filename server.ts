import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MetaConfig {
  lang: string;
  dir: 'rtl' | 'ltr';
  locale: string;
  title: string;
  description: string;
  keywords: string;
  domain: string;
}

const SUBDOMAIN_METADATA: Record<string, MetaConfig> = {
  fa: {
    lang: 'fa',
    dir: 'rtl',
    locale: 'fa_IR',
    domain: 'mgas.ir',
    title: 'کمپانی تولید سیلندر گاز مایع در ایران | کارخانه ام گاز (موسی عمویی)',
    description: 'بزرگترین کمپانی تولید سیلندر گاز مایع در ایران؛ تولیدکننده انواع کپسول گاز خانگی، کارگاهی، صنعتی و مخازن اتوگاز خودرو با آزمون فشار ۳۰ بار هیدرواستاتیک و استاندارد ISO 9001.',
    keywords: 'کمپانی تولید سیلندر گاز مایع در ایران, کارخانه تولید کپسول گاز, تولید کننده سیلندر گاز مایع, مخزن گاز مایع خودرو, کپسول ۱۱ کیلویی',
  },
  en: {
    lang: 'en',
    dir: 'ltr',
    locale: 'en_US',
    domain: 'en.mgas.ir',
    title: 'M Gas | LPG Cylinder Manufacturer in Iran | Domestic, Industrial & Auto Tanks',
    description: 'Official M Gas catalog and technical specifications for LPG cylinders, industrial pressure vessels, and automotive autogas tanks. Contact us for bulk orders and export inquiries.',
    keywords: 'LPG cylinder manufacturer Iran, gas cylinder factory, LPG bottles wholesale, auto LPG tank, cooking gas cylinder, 11kg cylinder, 50kg cylinder, ISO 9001',
  },
  ar: {
    lang: 'ar',
    dir: 'rtl',
    locale: 'ar_SA',
    domain: 'ar.mgas.ir',
    title: 'م غاز | أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران',
    description: 'م غاز (بإدارة موسى عموئي): أكبر مصنّع لأسطوانات وخزانات الغاز المسال (LPG) في إيران، مصنّع لجميع أنواع أسطوانات الغاز المنزلية والصناعية ومصنّع خزانات الغاز المسال للسيارات وفق ISO 9001.',
    keywords: 'مصنع اسطوانات الغاز في ايران, شركة تصنيع اسطوانات الغاز المسال, اسطوانات غاز البترول المسال, خزانات غاز السيارات LPG, اسطوانة ۱۱ كغ, اسطوانة ۵۰ كغ, شراء اسطوانات غاز بالجملة',
  },
  de: {
    lang: 'de',
    dir: 'ltr',
    locale: 'de_DE',
    domain: 'de.mgas.ir',
    title: 'M Gas | Führender Hersteller von Flüssiggasflaschen (LPG) im Iran',
    description: 'M Gas: Führender Hersteller von Flüssiggasflaschen (LPG) & Gaszylindern im Iran, Hersteller aller Arten von Haushalts- und industriellen Gasflaschen sowie Hersteller von Auto-LPG-Tanks nach ISO 9001.',
    keywords: 'LPG Gasflaschen Hersteller Iran, Flüssiggasflaschen Fabrik, Autogas Tank Hersteller, Camping Gasflasche, 11kg Gasflasche, 50kg Zylinder, ISO 9001 Gasbehälter',
  },
  ur: {
    lang: 'ur',
    dir: 'rtl',
    locale: 'ur_PK',
    domain: 'ur.mgas.ir',
    title: 'ایم گیس | ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا بڑا مینوفیکچرر',
    description: 'ایم گیس: ایران میں ایل پی جی گیس سلنڈرز اور کپسولز کا سب سے بڑا مینوفیکچرر، تمام اقسام کے گھریلو اور صنعتی گیس سلنڈرز اور گاڑیوں کے لیے آٹو ایل پی جی مائع گیس ٹینکوں کا مینوفیکچرر۔',
    keywords: 'ایران میں ایل پی جی سلنڈر بنانے والی فیکٹری, گیس سلنڈر مینوفیکچرر, آٹو گیس ٹینک, ۱۱ کلو گیس سلنڈر, ۵۰ کلو گیس سلنڈر, ایل پی جی سلنڈر برآمد',
  },
  hy: {
    lang: 'hy',
    dir: 'ltr',
    locale: 'hy_AM',
    domain: 'hy.mgas.ir',
    title: 'M Gas | Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող',
    description: 'M Gas գործարան: Իրանում հեղուկ գազի (LPG) գազաբալոնների խոշորագույն արտադրող, կենցաղային և արդյունաբերական բոլոր տեսակի գազաբալոնների արտադրող ISO 9001 ստանդարտով:',
    keywords: 'LPG գազաբալոններ արտադրող Իրան, հեղուկ գազի բալոնների գործարան, ավտոգազի բաքեր, 11 կգ գազաբալոն, 50 կգ գազաբալոն, ISO 9001 գազի բալոններ',
  },
  tr: {
    lang: 'tr',
    dir: 'ltr',
    locale: 'tr_TR',
    domain: 'tr.mgas.ir',
    title: "M Gas | İran'ın Büyük LPG Tüpü ve Sıvılaştırılmış Gaz Silindiri Üreticisi",
    description: "M Gas Tüp Fabrikası: İran'ın büyük LPG tüpü ve sıvılaştırılmış gaz silindiri üreticisi, evsel ve endüstriyel her çeşit gaz silindiri ve tüpü üreticisi, araç otogaz tankları üreticisi. ISO 9001 ve EN 1442 standartları.",
    keywords: "İran LPG tüp üreticisi, sıvılaştırılmış gaz silindiri fabrikası, otogaz LPG tankı üreticisi, mutfak tüpü, 11 kg tüp, 50 kg sanayi tüpü, toptan tüp satışı",
  },
  ru: {
    lang: 'ru',
    dir: 'ltr',
    locale: 'ru_RU',
    domain: 'ru.mgas.ir',
    title: 'М Газ | Крупнейший производитель баллонов LPG и емкостей СУГ в Иране',
    description: 'Завод М Газ: Крупнейший производитель баллонов для сжиженного газа (LPG) в Иране, производитель всех видов бытовых и промышленных газовых баллонов и автомобильных емкостей (Auto LPG).',
    keywords: 'производитель газовых баллонов Иран, завод баллонов СУГ, автомобильные баллоны ГБО, бытовой газовый баллон, баллон 11 кг, баллон 50 кг, экспорт баллонов LPG',
  },
};

function getLangFromHost(host: string, queryLang?: string): string {
  if (queryLang) {
    const ql = queryLang.toLowerCase();
    if (['fa', 'en', 'ar', 'de', 'ur', 'tr', 'ru', 'hy'].includes(ql)) {
      return ql;
    }
  }
  const cleanHost = host.split(':')[0].toLowerCase();
  const sub = cleanHost.split('.')[0];
  if (['en', 'ar', 'de', 'ur', 'tr', 'ru', 'hy'].includes(sub)) {
    return sub;
  }
  return 'fa';
}

function injectSubdomainMeta(html: string, host: string, reqPath: string): string {
  const lang = getLangFromHost(host);
  const meta = SUBDOMAIN_METADATA[lang] || SUBDOMAIN_METADATA.fa;
  const canonicalUrl = `https://${meta.domain}${reqPath === '/' ? '' : reqPath}`;

  let result = html;
  // Replace <html lang="..." dir="...">
  result = result.replace(/<html[^>]*>/, `<html lang="${meta.lang}" dir="${meta.dir}">`);
  
  // Replace <title>...</title>
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  
  // Replace description meta
  result = result.replace(/<meta\s+name="description"\s+content="[^"]*"/, `<meta name="description" content="${meta.description}"`);
  
  // Replace keywords meta
  result = result.replace(/<meta\s+name="keywords"\s+content="[^"]*"/, `<meta name="keywords" content="${meta.keywords}"`);
  
  // Replace og:title
  result = result.replace(/<meta\s+property="og:title"\s+content="[^"]*"/, `<meta property="og:title" content="${meta.title}"`);
  
  // Replace og:description
  result = result.replace(/<meta\s+property="og:description"\s+content="[^"]*"/, `<meta property="og:description" content="${meta.description}"`);
  
  // Replace og:locale
  result = result.replace(/<meta\s+property="og:locale"\s+content="[^"]*"/, `<meta property="og:locale" content="${meta.locale}"`);
  
  // Replace og:url
  result = result.replace(/<meta\s+property="og:url"\s+content="[^"]*"/, `<meta property="og:url" content="${canonicalUrl}"`);
  
  // Replace twitter:title
  result = result.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"/, `<meta name="twitter:title" content="${meta.title}"`);
  
  // Replace twitter:description
  result = result.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"/, `<meta name="twitter:description" content="${meta.description}"`);
  
  // Replace canonical link
  result = result.replace(/<link\s+rel="canonical"\s+href="[^"]*"/, `<link rel="canonical" href="${canonicalUrl}"`);

  return result;
}

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

  // Dynamic localized sitemap handler
  app.get('/sitemap.xml', (req, res) => {
    const host = (req.headers.host || '').toLowerCase();
    const lang = getLangFromHost(host, req.query.lang as string);
    const sitemapPath = isProd
      ? path.resolve(__dirname, 'dist', 'sitemap.xml')
      : path.resolve(__dirname, 'public', 'sitemap.xml');

    try {
      if (!fs.existsSync(sitemapPath)) {
        return res.status(404).send('Sitemap not found');
      }
      let content = fs.readFileSync(sitemapPath, 'utf-8');
      if (lang !== 'fa') {
        const subUrl = `https://${lang}.mgas.ir`;
        content = content.replace(/<loc>https:\/\/mgas\.ir\//g, `<loc>${subUrl}/`);
      }
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(content);
    } catch (e) {
      console.error('Error serving localized sitemap:', e);
      return res.status(500).send('Error generating sitemap');
    }
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

    // Development localized HTML middleware for crawlers and preview
    app.use(async (req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && (req.headers.accept || '').includes('text/html')) {
        try {
          const host = (req.headers.host || '').toLowerCase();
          const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
          const localizedHtml = injectSubdomainMeta(rawHtml, host, req.path);
          const transformed = await vite.transformIndexHtml(req.originalUrl, localizedHtml);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.send(transformed);
        } catch (e) {
          next(e);
        }
      } else {
        next();
      }
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

    // SPA fallback with dynamically injected subdomain metadata
    app.get('*', (req, res) => {
      const host = (req.headers.host || '').toLowerCase();
      const indexPath = path.resolve(__dirname, 'dist', 'index.html');
      try {
        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const localizedHtml = injectSubdomainMeta(rawHtml, host, req.path);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        return res.send(localizedHtml);
      } catch (err) {
        res.sendFile(indexPath);
      }
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
