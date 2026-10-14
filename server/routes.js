import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    getToursDB,
    saveToursDB,
    resetToursDB,
    getGalleryDB,
    saveGalleryDB,
    addGalleryImageDB,
    updateGalleryImageDB,
    deleteGalleryImageDB,
    resetGalleryDB,
    getEnquiriesDB,
    addEnquiryDB,
    updateEnquiryStatusDB,
    deleteEnquiryDB,
    getSubscribersDB,
    addSubscriberDB,
    deleteSubscriberDB,
    getAdminCredsDB,
    validateAdminDB,
    updateAdminCredsDB
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const apiRouter = express.Router();
export const apiApp = express();

apiApp.use((req, res, next) => {
    if (!res.status) {
        res.status = function (code) {
            res.statusCode = code;
            return res;
        };
    }
    if (!res.json) {
        res.json = function (data) {
            if (!res.headersSent) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
            }
            res.end(JSON.stringify(data));
            return res;
        };
    }
    next();
});

apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));
apiApp.use(apiRouter);

// --------------------------------------------------------------------------
// Health & Full State Sync
// --------------------------------------------------------------------------
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Som Chatterjee Backend API',
        timestamp: new Date().toISOString()
    });
});

apiRouter.get('/sync', (req, res) => {
    try {
        const tours = getToursDB();
        const gallery = getGalleryDB();
        const enquiries = getEnquiriesDB();
        const subscribers = getSubscribersDB();
        const adminCreds = getAdminCredsDB();

        res.json({
            success: true,
            tours,
            gallery,
            enquiries,
            subscribers,
            adminUsername: adminCreds.username,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('API /sync error:', err);
        res.status(500).json({ success: false, error: 'Failed to sync data' });
    }
});

// --------------------------------------------------------------------------
// Tour Dates
// --------------------------------------------------------------------------
apiRouter.get('/tours', (req, res) => {
    try {
        const tours = getToursDB();
        res.json({ success: true, tours });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/tours', (req, res) => {
    try {
        const { tours } = req.body;
        if (!Array.isArray(tours)) {
            return res.status(400).json({ success: false, error: 'Expected tours array' });
        }
        const updated = saveToursDB(tours);
        res.json({ success: true, tours: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/tours/reset', (req, res) => {
    try {
        const tours = resetToursDB();
        res.json({ success: true, tours });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// Gallery Images (Max 5 Capacity)
// --------------------------------------------------------------------------
apiRouter.get('/gallery', (req, res) => {
    try {
        const gallery = getGalleryDB();
        res.json({ success: true, gallery });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/gallery/upload', (req, res) => {
    try {
        const { dataUrl } = req.body;
        if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
            return res.status(400).json({ success: false, error: 'Valid image dataUrl is required' });
        }

        const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, error: 'Malformed image data' });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');

        const cleanName = `som-stage-${Date.now()}.${ext}`;
        const uploadDir = path.resolve(__dirname, '../public/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, cleanName);
        fs.writeFileSync(filePath, buffer);

        // Also sync to dist/uploads if dist exists
        const distUploadDir = path.resolve(__dirname, '../dist/uploads');
        if (fs.existsSync(distUploadDir)) {
            fs.writeFileSync(path.join(distUploadDir, cleanName), buffer);
        }

        // Return relative path so browsers can load it immediately
        res.json({
            success: true,
            url: `uploads/${cleanName}`,
            filename: cleanName
        });
    } catch (err) {
        console.error('Gallery image upload error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/gallery', (req, res) => {
    try {
        // Can handle both saving array of gallery or adding single item
        if (Array.isArray(req.body.gallery)) {
            const gallery = saveGalleryDB(req.body.gallery);
            return res.json({ success: true, gallery });
        }
        const result = addGalleryImageDB(req.body);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.put('/gallery/:id', (req, res) => {
    try {
        const result = updateGalleryImageDB(req.params.id, req.body);
        if (!result.success) {
            return res.status(404).json(result);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.delete('/gallery/:id', (req, res) => {
    try {
        const gallery = deleteGalleryImageDB(req.params.id);
        res.json({ success: true, gallery });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/gallery/reset', (req, res) => {
    try {
        const gallery = resetGalleryDB();
        res.json({ success: true, gallery });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// Booking Enquiries
// --------------------------------------------------------------------------
apiRouter.get('/enquiries', (req, res) => {
    try {
        const enquiries = getEnquiriesDB();
        res.json({ success: true, enquiries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/enquiries', (req, res) => {
    try {
        const enquiry = addEnquiryDB(req.body);
        res.json({ success: true, enquiry });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.patch('/enquiries/:id', (req, res) => {
    try {
        const { status } = req.body;
        const ok = updateEnquiryStatusDB(req.params.id, status);
        if (!ok) {
            return res.status(404).json({ success: false, error: 'Enquiry not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.delete('/enquiries/:id', (req, res) => {
    try {
        const enquiries = deleteEnquiryDB(req.params.id);
        res.json({ success: true, enquiries });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// Newsletter Subscribers
// --------------------------------------------------------------------------
apiRouter.get('/subscribers', (req, res) => {
    try {
        const subscribers = getSubscribersDB();
        res.json({ success: true, subscribers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/subscribers', (req, res) => {
    try {
        const { email } = req.body;
        const result = addSubscriberDB(email);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.delete('/subscribers/:id', (req, res) => {
    try {
        const subscribers = deleteSubscriberDB(req.params.id);
        res.json({ success: true, subscribers });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --------------------------------------------------------------------------
// Admin Authentication & Credentials
// --------------------------------------------------------------------------
apiRouter.post('/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const isValid = validateAdminDB(username, password);
        if (isValid) {
            // Generate a lightweight session token
            const token = 'som_token_' + Buffer.from(`${username}:${Date.now()}`).toString('base64');
            return res.json({
                success: true,
                token,
                username,
                message: 'Admin authentication successful'
            });
        }
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.get('/auth/credentials', (req, res) => {
    try {
        const creds = getAdminCredsDB();
        // Return username (password masked/omitted for security)
        res.json({
            success: true,
            username: creds.username
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

apiRouter.post('/auth/credentials', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password required' });
        }
        updateAdminCredsDB(username, password);
        res.json({
            success: true,
            message: 'Admin credentials successfully updated'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
