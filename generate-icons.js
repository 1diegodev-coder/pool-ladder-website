// Simple icon generator for PWA
// Creates placeholder PNG icons from SVG

const fs = require('fs');
const path = require('path');

// Simple SVG to create pool ball icon
const createIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="100%" style="stop-color:#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#grad)" rx="80"/>
  <circle cx="256" cy="256" r="180" fill="#000" stroke="#00d4ff" stroke-width="8"/>
  <circle cx="256" cy="256" r="25" fill="#00d4ff"/>
  <text x="256" y="290" text-anchor="middle" fill="#00d4ff" font-family="Arial Black" font-size="48" font-weight="900">8</text>
</svg>`;

// Create basic placeholder PNGs (for now, we'll create SVG files with different sizes)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const svgContent = createIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(__dirname, 'icons', fileName);
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${fileName}`);
});

console.log('Icon generation complete!');
console.log('Note: For production, convert these SVG files to PNG using an online converter or image editing software.');