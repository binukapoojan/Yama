import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ICONS_DIR = path.resolve('public/icons');

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#090807"/>
  <circle cx="256" cy="256" r="184" fill="#14110D" stroke="#C8963E" stroke-width="4" stroke-opacity="0.55"/>
  <rect x="146" y="146" width="220" height="220" fill="none" stroke="#8C1D24" stroke-width="4" transform="rotate(45 256 256)"/>
  <circle cx="256" cy="256" r="112" fill="#090807" stroke="#D49B27" stroke-width="3"/>
  <text x="256" y="286" text-anchor="middle" fill="#D49B27" font-family="Noto Serif Sinhala, serif" font-size="136">෴</text>
</svg>`;

const monochromeSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none"/>
  <text x="256" y="286" text-anchor="middle" fill="#FFFFFF" font-family="Noto Serif Sinhala, serif" font-size="136">෴</text>
</svg>`;

async function generate() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // 1. Write SVGs
  const faviconPath = path.join(ICONS_DIR, 'favicon.svg');
  const monochromePath = path.join(ICONS_DIR, 'monochrome.svg');
  fs.writeFileSync(faviconPath, faviconSvg, 'utf-8');
  fs.writeFileSync(monochromePath, monochromeSvg, 'utf-8');
  console.log('✓ Created public/icons/favicon.svg');

  const faviconBuffer = Buffer.from(faviconSvg);
  const monochromeBuffer = Buffer.from(monochromeSvg);

  const targets = [
    { name: 'icon-512x512.png', size: 512, buffer: faviconBuffer },
    { name: 'icon-192x192.png', size: 192, buffer: faviconBuffer },
    { name: 'icon-maskable-512x512.png', size: 512, buffer: faviconBuffer },
    { name: 'icon-maskable-192x192.png', size: 192, buffer: faviconBuffer },
    { name: 'apple-touch-icon.png', size: 180, buffer: faviconBuffer },
    { name: 'icon-monochrome-512x512.png', size: 512, buffer: monochromeBuffer },
    // Backwards-compatibility aliases
    { name: 'icon-512.png', size: 512, buffer: faviconBuffer },
    { name: 'icon-192.png', size: 192, buffer: faviconBuffer },
  ];

  for (const target of targets) {
    const dest = path.join(ICONS_DIR, target.name);
    await sharp(target.buffer)
      .resize(target.size, target.size)
      .png()
      .toFile(dest);
    console.log(`✓ Generated ${target.name} (${target.size}x${target.size})`);
  }

  console.log('✨ All PWA and platform icons generated successfully.');
}

generate().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
