const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const createCardBack = () => {
  const canvas = createCanvas(300, 400);
  const ctx = canvas.getContext('2d');
  
  // White background
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, 300, 400);
  
  // Draw circuit board pattern on sides
  ctx.strokeStyle = '#d0d0d0';
  ctx.lineWidth = 1;
  
  // Left side circuit pattern
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(20, 50 + i * 40);
    ctx.lineTo(40, 50 + i * 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(40, 50 + i * 40, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Right side circuit pattern
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(280, 50 + i * 40);
    ctx.lineTo(260, 50 + i * 40);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(260, 50 + i * 40, 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Top border pattern
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(i * 30, 10, 15, 3);
  }
  
  // Bottom border pattern
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(i * 30, 385, 15, 3);
  }
  
  // Top "coup" text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('coup', 150, 80);
  
  // Bottom "coup" text
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('coup', 150, 340);
  
  // Center decorative elements
  ctx.strokeStyle = '#c0c0c0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(80, 180);
  ctx.lineTo(220, 180);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(80, 220);
  ctx.lineTo(220, 220);
  ctx.stroke();
  
  return canvas.toBuffer('image/png');
};

const createCardArtwork = (name, color) => {
  const canvas = createCanvas(300, 400);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color[0]);
  gradient.addColorStop(1, color[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 300, 400);
  
  // Border
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 280, 380);
  
  // Card name
  ctx.fillStyle = '#fcd34d';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(name, 150, 80);
  
  // Icon/symbol
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 120px Arial';
  ctx.fillText('♔', 150, 240);
  
  return canvas.toBuffer('image/png');
};

const createBackgroundTexture = () => {
  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  
  // Base dark color
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1920, 1080);
  
  // Add some pattern/noise
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 1920;
    const y = Math.random() * 1080;
    const size = Math.random() * 200 + 50;
    ctx.fillStyle = `rgba(251, 191, 36, ${Math.random() * 0.05})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  return canvas.toBuffer('image/png');
};

const createLogo = () => {
  const canvas = createCanvas(400, 200);
  const ctx = canvas.getContext('2d');
  
  // Transparent background
  ctx.clearRect(0, 0, 400, 200);
  
  // Gold gradient
  const gradient = ctx.createLinearGradient(0, 0, 400, 200);
  gradient.addColorStop(0, '#fcd34d');
  gradient.addColorStop(1, '#f59e0b');
  ctx.fillStyle = gradient;
  
  // Crown shape (using geometric shapes)
  ctx.font = 'bold 140px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('♔', 200, 140);
  
  // Text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 60px Arial';
  ctx.fillText('COUP', 200, 180);
  
  return canvas.toBuffer('image/png');
};

// Create public/ui directory if it doesn't exist
const uiDir = path.join(__dirname, 'public', 'ui');
if (!fs.existsSync(uiDir)) {
  fs.mkdirSync(uiDir, { recursive: true });
}

try {
  // Generate card artwork
  const cards = [
    { name: 'Duke', colors: ['#1f2937', '#111827'] },
    { name: 'Assassin', colors: ['#4c1d95', '#2e1065'] },
    { name: 'Contessa', colors: ['#831843', '#500724'] },
    { name: 'Captain', colors: ['#1e40af', '#0c3682'] },
    { name: 'Ambassador', colors: ['#15803d', '#15803d'] },
  ];
  
  cards.forEach(card => {
    const buffer = createCardArtwork(card.name, card.colors);
    const filename = path.join(uiDir, `card-${card.name.toLowerCase()}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`✓ Created ${filename}`);
  });
  
  // Generate card back
  const backBuffer = createCardBack();
  fs.writeFileSync(path.join(uiDir, 'card-back.png'), backBuffer);
  console.log(`✓ Created card-back.png`);
  
  // Generate background texture
  const bgBuffer = createBackgroundTexture();
  fs.writeFileSync(path.join(uiDir, 'background-texture.png'), bgBuffer);
  console.log(`✓ Created background-texture.png`);
  
  // Generate logo
  const logoBuffer = createLogo();
  fs.writeFileSync(path.join(uiDir, 'logo.png'), logoBuffer);
  console.log(`✓ Created logo.png`);
  
  console.log('\nAll placeholder images generated successfully!');
} catch (err) {
  console.error('Error generating images:', err.message);
  process.exit(1);
}
