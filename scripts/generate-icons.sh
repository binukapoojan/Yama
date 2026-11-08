#!/usr/bin/env bash
set -e

mkdir -p public/icons

cat << 'EOF' > public/icons/favicon.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#090807"/>
  <circle cx="256" cy="256" r="184" fill="#14110D" stroke="#C8963E" stroke-width="4" stroke-opacity="0.55"/>
  <rect x="146" y="146" width="220" height="220" fill="none" stroke="#8C1D24" stroke-width="4" transform="rotate(45 256 256)"/>
  <circle cx="256" cy="256" r="112" fill="#090807" stroke="#D49B27" stroke-width="3"/>
  <text x="256" y="286" text-anchor="middle" fill="#D49B27" font-family="Noto Serif Sinhala, serif" font-size="136">෴</text>
</svg>
EOF

cat << 'EOF' > public/icons/monochrome.svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none"/>
  <text x="256" y="286" text-anchor="middle" fill="#FFFFFF" font-family="Noto Serif Sinhala, serif" font-size="136">෴</text>
</svg>
EOF

node scripts/generate-icons.js
