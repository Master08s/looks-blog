#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 3000;
const DIST_DIR = path.join(__dirname, '../dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

async function buildSite() {
  try {
    console.log('🔨 Building site...');
    const BlogBuilder = require('./build.js');
    const builder = new BlogBuilder();
    await builder.build();
    console.log('✅ Build completed');
  } catch (error) {
    console.error('❌ Build failed:', error);
    throw error;
  }
}

const server = http.createServer(async (req, res) => {
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Handle clean URLs
  if (!path.extname(filePath) && !filePath.endsWith('/')) {
    filePath += '.html';
  }
  
  try {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      const mimeType = getMimeType(filePath);
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    } else {
      // Try to serve index.html for SPA-like behavior
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Page not found');
      }
    }
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 - Internal server error');
  }
});

async function startServer() {
  try {
    // Build the site first
    await buildSite();
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`🚀 Development server running at http://localhost:${PORT}`);
      console.log('📁 Serving from:', DIST_DIR);
      console.log('🔄 Run "npm run build" to rebuild the site');
    });
  } catch (error) {
    console.error('Failed to start development server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}
