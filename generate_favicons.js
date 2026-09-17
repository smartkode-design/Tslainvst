const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Sleek TSLA 'T' SVG with transparent background & maximum visibility
// Fits 100x100 viewBox, perfectly centered, vibrant indigo-to-sky gradient + hot orange lightning accent
const svgLogoTransparent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <defs>
    <linearGradient id="tsla-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4f46e5" />
      <stop offset="50%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#0ea5e9" />
    </linearGradient>
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.35" />
    </filter>
  </defs>

  <g filter="url(#drop-shadow)">
    <!-- Sleek Geometric 'T' -->
    <path 
      d="M8 18 h84 v20 h-30 v52 h-24 v-52 h-30 z" 
      fill="url(#tsla-grad)" 
    />
    
    <!-- Dynamic Lightning Accent -->
    <path 
      d="M62 38 l22 -20 v20 z" 
      fill="#f97316" 
    />
  </g>
</svg>`;

// Also a version with a subtle, sleek rounded container with glowing border for Apple Touch Icon & App Icon
const svgLogoFramed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0f172a" />
      <stop offset="100%" stopColor="#020617" />
    </linearGradient>
    <linearGradient id="tsla-grad-lg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#4f46e5" />
      <stop offset="40%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#0ea5e9" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#6366f1" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Sleek backdrop with subtle indigo border -->
  <rect width="512" height="512" rx="120" fill="url(#bg-grad)"/>
  <rect x="4" y="4" width="504" height="504" rx="116" stroke="url(#tsla-grad-lg)" stroke-width="8" stroke-opacity="0.5"/>

  <!-- Glowing Geometric 'T' -->
  <g filter="url(#glow)" transform="translate(56, 56) scale(4)">
    <path d="M8 18 h84 v20 h-30 v52 h-24 v-52 h-30 z" fill="url(#tsla-grad-lg)" />
    <path d="M62 38 l22 -20 v20 z" fill="#f97316" />
  </g>
</svg>`;

// Helper to create a Windows ICO binary containing 16x16, 32x32, 48x48 PNG frames
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type = 1 (ICO)
  header.writeUInt16LE(count, 4); // Number of images

  let currentOffset = 6 + count * 16;
  const dirEntries = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Size of image
    entry.writeUInt32LE(currentOffset, 12); // Offset
    dirEntries.push(entry);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
  console.log("Generating high-definition TSLA favicons and icons...");

  // Write SVGs
  fs.writeFileSync('src/app/icon.svg', svgLogoTransparent);
  fs.writeFileSync('public/tsla-logo.svg', svgLogoTransparent);

  // Generate PNGs from transparent SVG
  const png16 = await sharp(Buffer.from(svgLogoTransparent)).resize(16, 16).png().toBuffer();
  const png32 = await sharp(Buffer.from(svgLogoTransparent)).resize(32, 32).png().toBuffer();
  const png48 = await sharp(Buffer.from(svgLogoTransparent)).resize(48, 48).png().toBuffer();
  const png64 = await sharp(Buffer.from(svgLogoTransparent)).resize(64, 64).png().toBuffer();
  const png180 = await sharp(Buffer.from(svgLogoFramed)).resize(180, 180).png().toBuffer();
  const png512 = await sharp(Buffer.from(svgLogoFramed)).resize(512, 512).png().toBuffer();

  // Create crisp multi-resolution ICO file
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  // Write ICO files
  fs.writeFileSync('src/app/favicon.ico', icoBuffer);
  fs.writeFileSync('public/favicon.ico', icoBuffer);
  console.log("✓ Saved src/app/favicon.ico & public/favicon.ico");

  // Write PNG files
  fs.writeFileSync('src/app/icon.png', png512);
  fs.writeFileSync('src/app/apple-icon.png', png180);
  fs.writeFileSync('public/tsla-logo.png', png512);
  fs.writeFileSync('public/favicon-32x32.png', png32);
  fs.writeFileSync('public/favicon-16x16.png', png16);
  fs.writeFileSync('public/apple-touch-icon.png', png180);
  console.log("✓ Saved icon.png, apple-icon.png, and public PNG assets");

  console.log("All favicon and logo assets successfully created!");
}

run().catch(console.error);
