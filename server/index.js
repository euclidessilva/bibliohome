require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const os = require('os');

const booksRoutes = require('./routes/books');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Get local IP for display
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Middleware
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/books', booksRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve React static files in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
});

// Start HTTP server
http.createServer(app).listen(PORT, () => {
  const ip = getLocalIP();
  console.log(`🏛️  BiblioHome (HTTP)  → http://localhost:${PORT}`);
  console.log(`🌐  Rede local (HTTP)  → http://${ip}:${PORT}`);
});

// Start HTTPS server with self-signed certificate (local network only — not needed in production)
if (process.env.NODE_ENV !== 'production') {
  try {
    const selfsigned = require('selfsigned');
    const attrs = [{ name: 'commonName', value: 'bibliohome.local' }];
    const pems = selfsigned.generate(attrs, {
      days: 365,
      keySize: 2048,
      algorithm: 'sha256',
    });

    https.createServer({ key: pems.private, cert: pems.cert }, app).listen(HTTPS_PORT, () => {
      const ip = getLocalIP();
      console.log(`🔒  BiblioHome (HTTPS) → https://localhost:${HTTPS_PORT}`);
      console.log(`📱  Celular (câmera)   → https://${ip}:${HTTPS_PORT}`);
      console.log(`\n⚠️  No celular: aceite o aviso de certificado não confiável para continuar.`);
    });
  } catch (err) {
    console.warn('⚠️  HTTPS não iniciado (selfsigned não encontrado):', err.message);
  }
}
