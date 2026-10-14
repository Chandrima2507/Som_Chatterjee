import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse JSON and URL-encoded data with ample limit for images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount REST API endpoints under /api
app.use('/api', apiRouter);

// Serve static frontend assets
const distDir = path.resolve(__dirname, 'dist');
const publicDir = path.resolve(__dirname, 'public');

if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
}

if (fs.existsSync(distDir)) {
    // Production: serve built assets from dist
    app.use(express.static(distDir));

    // Admin portal route
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(distDir, 'admin.html'));
    });

    // Public website fallback
    app.use((req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path.join(distDir, 'index.html'));
    });
} else {
    // Development fallback if dist is not built yet
    app.use(express.static(__dirname));

    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, 'admin.html'));
    });

    app.use((req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API route not found' });
        }
        res.sendFile(path.join(__dirname, 'index.html'));
    });
}

// Start Server
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Som Chatterjee Backend & Web Server is Running!`);
    console.log(`📡 API Endpoints:   http://localhost:${PORT}/api/health`);
    console.log(`🌐 Public Website:  http://localhost:${PORT}/`);
    console.log(`🛡️ Admin Portal:    http://localhost:${PORT}/admin`);
    console.log(`==================================================\n`);
});
