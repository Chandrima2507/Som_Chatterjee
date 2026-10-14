import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_DB = {
    tours: [
        {
            id: 'tour-1',
            date: '18.11.2026',
            dayTime: 'Saturday · 7:00 PM',
            venue: 'Kolkata, Nazrul Mancha',
            city: 'West Bengal, India',
            status: 'Upcoming Show',
            badgeType: 'badge-hot',
            actionUrl: '#contact',
            actionText: 'Enquire Event',
            active: true
        },
        {
            id: 'tour-2',
            date: '05.12.2026',
            dayTime: 'Friday · 7:30 PM',
            venue: 'Mumbai, Shanmukhananda Hall',
            city: 'Maharashtra, India',
            status: 'Confirmed',
            badgeType: 'badge',
            actionUrl: '#contact',
            actionText: 'Enquire Event',
            active: true
        },
        {
            id: 'tour-3',
            date: '24.12.2026',
            dayTime: 'Thursday · 8:00 PM',
            venue: 'Delhi, Siri Fort Auditorium',
            city: 'New Delhi, India',
            status: 'Confirmed',
            badgeType: 'badge',
            actionUrl: '#contact',
            actionText: 'Enquire Event',
            active: true
        },
        {
            id: 'tour-4',
            date: '15.01.2027',
            dayTime: 'Thursday · 6:30 PM',
            venue: 'Bengaluru, Chowdiah Memorial',
            city: 'Karnataka, India',
            status: 'Confirmed',
            badgeType: 'badge',
            actionUrl: '#contact',
            actionText: 'Enquire Event',
            active: true
        },
        {
            id: 'tour-5',
            date: '08.02.2027',
            dayTime: 'Sunday · 7:00 PM',
            venue: 'Hyderabad, Shilpakala Vedika',
            city: 'Telangana, India',
            status: 'Upcoming Show',
            badgeType: 'badge-hot',
            actionUrl: '#contact',
            actionText: 'Enquire Event',
            active: true
        }
    ],
    enquiries: [
        {
            id: 'ENQ-1739000001',
            name: 'Anirban Mukherjee',
            email: 'anirban.fest@presi.edu.in',
            phone: '+91 98301 23456',
            eventType: 'College Fest',
            date: '2026-12-19',
            message: 'Looking to headline Som Chatterjee for Milieu 2026, Presidency University Kolkata. Anticipated audience 3,500+ students. Needs a 90-min electrifying Bollywood & Bengali rock set.',
            status: 'new',
            createdAt: '2026-10-14T09:30:00.000Z'
        },
        {
            id: 'ENQ-1738900002',
            name: 'Priya Sharma',
            email: 'priya.sharma@tataevents.com',
            phone: '+91 98202 87654',
            eventType: 'Corporate Event',
            date: '2026-11-28',
            message: 'Annual Corporate Gala Dinner at Grand Hyatt Mumbai. Looking for a soulful Sufi, unplugged Bollywood, and acoustic set for 450 guests.',
            status: 'contacted',
            createdAt: '2026-10-13T16:15:00.000Z'
        },
        {
            id: 'ENQ-1738800003',
            name: 'Debashis Banerjee',
            email: 'debashis.carnival@gmail.com',
            phone: '+91 94340 11223',
            eventType: 'Concert',
            date: '2027-01-23',
            message: 'Siliguri Winter Music Carnival 2027 Headline act request. Open-air arena, full technical sound rider and hospitality provided.',
            status: 'new',
            createdAt: '2026-10-12T11:45:00.000Z'
        }
    ],
    subscribers: [
        {
            id: 'SUB-1',
            email: 'sourav.sen.kol@gmail.com',
            subscribedAt: '2026-10-13T14:20:00.000Z'
        },
        {
            id: 'SUB-2',
            email: 'ritika.music@outlook.com',
            subscribedAt: '2026-10-14T08:10:00.000Z'
        }
    ],
    gallery: [
        {
            id: 'gal-1',
            src: 'gallery-live-01.png',
            tag: 'Live Concert',
            caption: 'Stage Charisma',
            fullCaption: 'Som Chatterjee – Electrifying Stage Presence (Live Concert Tour)',
            isFeatured: true
        },
        {
            id: 'gal-2',
            src: 'gallery-live-02.png',
            tag: 'Live Vocals',
            caption: 'Vocal Intensity',
            fullCaption: 'Som Chatterjee – Vocal Intensity & Fan Connection',
            isFeatured: true
        },
        {
            id: 'gal-3',
            src: 'gallery-live-03.png',
            tag: 'Arena Spectacle',
            caption: 'Sea of Lights',
            fullCaption: 'Som Chatterjee – Arena Grandeur & Sea of Lights',
            isFeatured: false
        },
        {
            id: 'gal-4',
            src: 'gallery-live-04.png',
            tag: 'Performance',
            caption: 'Soulful Expression',
            fullCaption: 'Som Chatterjee – Soulful Live Performance & Musical Passion',
            isFeatured: false
        },
        {
            id: 'gal-5',
            src: 'gallery-live-05.png',
            tag: 'Monochrome',
            caption: 'Stage Spotlight',
            fullCaption: 'Som Chatterjee – Monochrome Spotlight & Stage Aura',
            isFeatured: false
        }
    ],
    admin: {
        username: 'Som@chatterjee',
        password: 'Dino@2020'
    }
};

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            writeDB(DEFAULT_DB);
            return DEFAULT_DB;
        }
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        return {
            ...DEFAULT_DB,
            ...data
        };
    } catch (err) {
        console.error('Error reading database file:', err);
        return DEFAULT_DB;
    }
}

export function writeDB(data) {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const json = JSON.stringify(data, null, 2);
        fs.writeFileSync(DB_FILE, json, 'utf-8');
        return true;
    } catch (err) {
        console.error('Error writing to database file:', err);
        return false;
    }
}

// --------------------------------------------------------------------------
// Tour Operations
// --------------------------------------------------------------------------
export function getToursDB() {
    const db = readDB();
    return db.tours || [];
}

export function saveToursDB(tours) {
    const db = readDB();
    db.tours = Array.isArray(tours) ? tours : [];
    writeDB(db);
    return db.tours;
}

export function resetToursDB() {
    const db = readDB();
    db.tours = [...DEFAULT_DB.tours];
    writeDB(db);
    return db.tours;
}

// --------------------------------------------------------------------------
// Gallery Operations
// --------------------------------------------------------------------------
export function getGalleryDB() {
    const db = readDB();
    return db.gallery || [];
}

export function saveGalleryDB(gallery) {
    const db = readDB();
    db.gallery = Array.isArray(gallery) ? gallery.slice(0, 5) : [];
    writeDB(db);
    return db.gallery;
}

export function addGalleryImageDB(item) {
    const db = readDB();
    if (!db.gallery) db.gallery = [];

    const newItem = {
        id: item.id || ('gal-' + Date.now()),
        src: item.src,
        tag: item.tag ? item.tag.trim() : 'Live Stage',
        caption: item.caption ? item.caption.trim() : 'Stage Moment',
        fullCaption: item.fullCaption ? item.fullCaption.trim() : (item.caption || 'Som Chatterjee Live Performance'),
        isFeatured: Boolean(item.isFeatured !== undefined ? item.isFeatured : (db.gallery.length < 2))
    };

    // If explicit replacement ID was passed
    if (item.replaceId) {
        const idx = db.gallery.findIndex(g => g.id === item.replaceId);
        if (idx !== -1) {
            db.gallery[idx] = newItem;
            writeDB(db);
            return { success: true, item: newItem, gallery: db.gallery, replaced: true };
        }
    }

    // If target slot index was selected (0 to 4)
    if (item.replaceSlotIndex !== undefined && item.replaceSlotIndex >= 0 && item.replaceSlotIndex < db.gallery.length) {
        db.gallery[item.replaceSlotIndex] = newItem;
        writeDB(db);
        return { success: true, item: newItem, gallery: db.gallery, replaced: true };
    }

    // If at maximum capacity of 5, replace slot 5 to ensure upload always succeeds
    if (db.gallery.length >= 5) {
        db.gallery[4] = newItem;
        writeDB(db);
        return { success: true, item: newItem, gallery: db.gallery, replaced: true };
    }

    // Otherwise add to next available slot
    db.gallery.push(newItem);
    writeDB(db);
    return { success: true, item: newItem, gallery: db.gallery };
}

export function updateGalleryImageDB(id, data) {
    const db = readDB();
    const item = (db.gallery || []).find(g => g.id === id);
    if (!item) return { success: false, error: 'Gallery photo not found' };

    if (data.src) item.src = data.src;
    if (data.tag !== undefined) item.tag = data.tag.trim();
    if (data.caption !== undefined) item.caption = data.caption.trim();
    if (data.fullCaption !== undefined) item.fullCaption = data.fullCaption.trim();
    if (data.isFeatured !== undefined) item.isFeatured = Boolean(data.isFeatured);

    writeDB(db);
    return { success: true, item, gallery: db.gallery };
}

export function deleteGalleryImageDB(id) {
    const db = readDB();
    db.gallery = (db.gallery || []).filter(g => g.id !== id);
    writeDB(db);
    return db.gallery;
}

export function resetGalleryDB() {
    const db = readDB();
    db.gallery = [...DEFAULT_DB.gallery];
    writeDB(db);
    return db.gallery;
}

// --------------------------------------------------------------------------
// Enquiry Operations
// --------------------------------------------------------------------------
export function getEnquiriesDB() {
    const db = readDB();
    return db.enquiries || [];
}

export function addEnquiryDB(data) {
    const db = readDB();
    if (!db.enquiries) db.enquiries = [];
    const newEnquiry = {
        id: 'ENQ-' + Date.now(),
        name: data.name ? data.name.trim() : 'Anonymous',
        email: data.email ? data.email.trim() : '',
        phone: data.phone ? data.phone.trim() : '',
        eventType: data.eventType || 'Live Concert',
        date: data.date || 'To be decided',
        message: data.message ? data.message.trim() : '',
        status: 'new',
        createdAt: new Date().toISOString()
    };
    db.enquiries.unshift(newEnquiry);
    writeDB(db);
    return newEnquiry;
}

export function updateEnquiryStatusDB(id, status) {
    const db = readDB();
    const item = (db.enquiries || []).find(e => e.id === id);
    if (!item) return false;
    item.status = status;
    writeDB(db);
    return true;
}

export function deleteEnquiryDB(id) {
    const db = readDB();
    db.enquiries = (db.enquiries || []).filter(e => e.id !== id);
    writeDB(db);
    return db.enquiries;
}

// --------------------------------------------------------------------------
// Subscribers Operations
// --------------------------------------------------------------------------
export function getSubscribersDB() {
    const db = readDB();
    return db.subscribers || [];
}

export function addSubscriberDB(email) {
    if (!email) return { success: false, error: 'Email is required' };
    const cleanEmail = email.trim().toLowerCase();
    const db = readDB();
    if (!db.subscribers) db.subscribers = [];
    if (db.subscribers.some(s => s.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: 'Email already subscribed' };
    }
    const newSub = {
        id: 'SUB-' + Date.now(),
        email: cleanEmail,
        subscribedAt: new Date().toISOString()
    };
    db.subscribers.unshift(newSub);
    writeDB(db);
    return { success: true, subscriber: newSub };
}

export function deleteSubscriberDB(id) {
    const db = readDB();
    db.subscribers = (db.subscribers || []).filter(s => s.id !== id);
    writeDB(db);
    return db.subscribers;
}

// --------------------------------------------------------------------------
// Admin Auth Operations
// --------------------------------------------------------------------------
export function getAdminCredsDB() {
    const db = readDB();
    return db.admin || DEFAULT_DB.admin;
}

export function validateAdminDB(username, password) {
    const creds = getAdminCredsDB();
    return (
        creds.username === (username || '').trim() &&
        creds.password === (password || '').trim()
    );
}

export function updateAdminCredsDB(newUsername, newPassword) {
    const db = readDB();
    db.admin = {
        username: (newUsername || 'Som@chatterjee').trim(),
        password: (newPassword || 'Dino@2020').trim()
    };
    writeDB(db);
    return true;
}
