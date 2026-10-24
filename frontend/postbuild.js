const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');
const fourOhFourPath = path.join(buildDir, '404.html');

if (fs.existsSync(indexPath)) {
  // 1. Copy index.html to 404.html for SPA static host fallbacks
  fs.copyFileSync(indexPath, fourOhFourPath);
  console.log('[postbuild] Successfully copied build/index.html to build/404.html');

  // 2. Pre-generate index.html inside common client-side route directories
  const routes = [
    'login',
    'register',
    'dashboard',
    'admin',
    'mentor',
    'intern',
    'track',
    'onboarding',
    'meetings',
    'breakout-rooms',
    'status'
  ];

  for (const route of routes) {
    const routeDir = path.join(buildDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
  }
  console.log('[postbuild] Successfully pre-generated SPA route fallbacks for Render static site!');
} else {
  console.error('[postbuild] Error: build/index.html not found');
}
