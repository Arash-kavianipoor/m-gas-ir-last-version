import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateFramedBadge() {
  const originalSvgPath = path.resolve(process.cwd(), 'public/logo/new-logo-mgas-2.svg');
  const originalSvg = fs.readFileSync(originalSvgPath, 'utf-8');

  // Extract the inner content inside <svg ...>...</svg>
  const innerMatch = originalSvg.match(/<defs>[\s\S]*<\/g>\s*<\/svg>/);
  if (!innerMatch) {
    throw new Error('Could not parse inner SVG content');
  }

  // Build the framed badge matching the header card:
  // "rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 shadow-sm"
  const framedBadgeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="540" height="240" viewBox="0 0 540 240">
  <defs>
    <!-- Background Gradient replicating the header's dark emerald/teal glass tone -->
    <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#081e26" />
      <stop offset="50%" stop-color="#0a2a32" />
      <stop offset="100%" stop-color="#05141b" />
    </linearGradient>

    <!-- Emerald-to-Teal Border Gradient -->
    <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.85" />
    </linearGradient>

    <!-- Subtle inner glass glow -->
    <linearGradient id="glassGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
    </linearGradient>
  </defs>

  <!-- Outer Rounded Badge Frame with Emerald Border -->
  <rect x="4" y="4" width="532" height="232" rx="36" ry="36" fill="url(#badgeBg)" stroke="url(#badgeBorder)" stroke-width="4.5" />
  <rect x="7" y="7" width="526" height="110" rx="33" ry="33" fill="url(#glassGlow)" />

  <!-- Embedded Scaled Vector Logo: 1874.35x1080.95 scaled down to fit 460x192 -->
  <g transform="translate(40, 24) scale(0.2454)">
    ${innerMatch[0].replace('</svg>', '')}
  </g>
</svg>`;

  const svgOutputPath = path.resolve(process.cwd(), 'public/logo/mgas-header-badge.svg');
  const pngOutputPath = path.resolve(process.cwd(), 'public/logo/mgas-header-badge.png');

  fs.writeFileSync(svgOutputPath, framedBadgeSvg, 'utf-8');
  console.log(`Saved SVG framed badge to ${svgOutputPath}`);

  // Render high-res PNG using sharp
  await sharp(Buffer.from(framedBadgeSvg))
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(pngOutputPath);

  console.log(`Rendered PNG framed badge to ${pngOutputPath}`);
}

generateFramedBadge().catch(console.error);
