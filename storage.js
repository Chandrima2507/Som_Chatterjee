// ==========================================================================
// SOM CHATTERJEE MANAGEMENT - STORAGE & DATA MODULE
// Centralized storage for Tour Dates, Booking Enquiries, Subscribers & Auth
// ==========================================================================

export const STORAGE_KEYS = {
    TOURS: 'som_chatterjee_tours',
    ENQUIRIES: 'som_chatterjee_enquiries',
    SUBSCRIBERS: 'som_chatterjee_subscribers',
    ADMIN_CREDS: 'som_admin_credentials',
    ADMIN_SESSION: 'som_admin_session_auth',
    GALLERY: 'som_chatterjee_gallery'
};

export const MAX_GALLERY_CAPACITY = 5;

// Default initial gallery images matching public moments
export const DEFAULT_GALLERY = [
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
];

// Default initial tour dates matching Som Chatterjee's tour schedule
export const DEFAULT_TOURS = [
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
];

// Default sample enquiries so admin has initial data to view
export const DEFAULT_ENQUIRIES = [
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
];

// Default newsletter subscribers
export const DEFAULT_SUBSCRIBERS = [
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
];

// Default admin credentials
export const DEFAULT_ADMIN = {
    username: 'Som@chatterjee',
    password: 'Dino@2020'
};

// --------------------------------------------------------------------------
// Backend API Sync Engine (Bi-directional Server Synchronization)
// --------------------------------------------------------------------------
export async function syncWithBackend() {
    try {
        const res = await fetch('/api/sync');
        if (!res.ok) return null;
        const data = await res.json();
        if (data && data.success) {
            if (Array.isArray(data.tours)) {
                localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(data.tours));
                window.dispatchEvent(new CustomEvent('som_tours_updated', { detail: data.tours }));
            }
            if (Array.isArray(data.gallery)) {
                localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(data.gallery));
                window.dispatchEvent(new CustomEvent('som_gallery_updated', { detail: data.gallery }));
            }
            if (Array.isArray(data.enquiries)) {
                localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(data.enquiries));
                window.dispatchEvent(new CustomEvent('som_enquiries_updated', { detail: data.enquiries }));
            }
            if (Array.isArray(data.subscribers)) {
                localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(data.subscribers));
                window.dispatchEvent(new CustomEvent('som_subscribers_updated', { detail: data.subscribers }));
            }
            if (data.adminUsername) {
                const creds = getAdminCredentials();
                creds.username = data.adminUsername;
                localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(creds));
            }
            return data;
        }
    } catch (err) {
        // Quiet fallback when offline or in standalone file preview
        console.warn('Backend sync note:', err.message);
    }
    return null;
}

// Auto-sync on visibility change and recurring interval
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            syncWithBackend();
        }
    });
}
if (typeof window !== 'undefined') {
    setTimeout(syncWithBackend, 60);
    setInterval(syncWithBackend, 20000);
}

// --------------------------------------------------------------------------
// Tour Dates Methods
// --------------------------------------------------------------------------
export function getTours() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.TOURS);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length >= 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading tours from localStorage', e);
    }
    saveTours(DEFAULT_TOURS);
    return DEFAULT_TOURS;
}

export function saveTours(tours) {
    try {
        localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
        window.dispatchEvent(new CustomEvent('som_tours_updated', { detail: tours }));

        // Async persist to backend
        fetch('/api/tours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tours })
        }).catch(err => console.warn('Backend saveTours error:', err));
    } catch (e) {
        console.error('Error saving tours', e);
    }
}

export function resetTours() {
    saveTours(DEFAULT_TOURS);
    fetch('/api/tours/reset', { method: 'POST' }).catch(err => console.warn('Backend resetTours error:', err));
    return DEFAULT_TOURS;
}

// --------------------------------------------------------------------------
// Booking Enquiries Methods
// --------------------------------------------------------------------------
export function getEnquiries() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading enquiries from localStorage', e);
    }
    saveEnquiries(DEFAULT_ENQUIRIES);
    return DEFAULT_ENQUIRIES;
}

export function saveEnquiries(enquiries) {
    try {
        localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enquiries));
        window.dispatchEvent(new CustomEvent('som_enquiries_updated', { detail: enquiries }));
    } catch (e) {
        console.error('Error saving enquiries to localStorage', e);
    }
}

export function addEnquiry(data) {
    const list = getEnquiries();
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
    list.unshift(newEnquiry);
    saveEnquiries(list);

    // Async persist to backend
    fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEnquiry)
    }).catch(err => console.warn('Backend addEnquiry error:', err));

    return newEnquiry;
}

export function updateEnquiryStatus(id, newStatus) {
    const list = getEnquiries();
    const target = list.find(item => item.id === id);
    if (target) {
        target.status = newStatus;
        saveEnquiries(list);

        // Async persist to backend
        fetch(`/api/enquiries/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        }).catch(err => console.warn('Backend updateEnquiry error:', err));

        return true;
    }
    return false;
}

export function deleteEnquiry(id) {
    const list = getEnquiries().filter(item => item.id !== id);
    saveEnquiries(list);

    // Async persist to backend
    fetch(`/api/enquiries/${id}`, {
        method: 'DELETE'
    }).catch(err => console.warn('Backend deleteEnquiry error:', err));

    return list;
}

// --------------------------------------------------------------------------
// Subscribers Methods
// --------------------------------------------------------------------------
export function getSubscribers() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading subscribers from localStorage', e);
    }
    saveSubscribers(DEFAULT_SUBSCRIBERS);
    return DEFAULT_SUBSCRIBERS;
}

export function saveSubscribers(subscribers) {
    try {
        localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
        window.dispatchEvent(new CustomEvent('som_subscribers_updated', { detail: subscribers }));
    } catch (e) {
        console.error('Error saving subscribers to localStorage', e);
    }
}

export function addSubscriber(email) {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();
    const list = getSubscribers();
    if (list.some(s => s.email.toLowerCase() === cleanEmail)) {
        return false;
    }
    const newSub = {
        id: 'SUB-' + Date.now(),
        email: cleanEmail,
        subscribedAt: new Date().toISOString()
    };
    list.unshift(newSub);
    saveSubscribers(list);

    // Async persist to backend
    fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
    }).catch(err => console.warn('Backend addSubscriber error:', err));

    return newSub;
}

export function deleteSubscriber(id) {
    const list = getSubscribers().filter(item => item.id !== id);
    saveSubscribers(list);

    // Async persist to backend
    fetch(`/api/subscribers/${id}`, {
        method: 'DELETE'
    }).catch(err => console.warn('Backend deleteSubscriber error:', err));

    return list;
}

// --------------------------------------------------------------------------
// Admin Authentication & Credentials
// --------------------------------------------------------------------------
export function getAdminCredentials() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDS);
        if (stored) {
            const creds = JSON.parse(stored);
            if (creds.username === 'admin' && creds.password === 'admin123') {
                localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(DEFAULT_ADMIN));
                return DEFAULT_ADMIN;
            }
            return creds;
        }
    } catch (e) {
        console.error('Error reading admin creds', e);
    }
    return DEFAULT_ADMIN;
}

export function updateAdminCredentials(newUsername, newPassword) {
    try {
        const creds = {
            username: (newUsername || 'Som@chatterjee').trim(),
            password: newPassword.trim()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(creds));

        // Async persist to backend
        fetch('/api/auth/credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(creds)
        }).catch(err => console.warn('Backend updateAdminCredentials error:', err));

        return true;
    } catch (e) {
        console.error('Error updating admin creds', e);
        return false;
    }
}

export async function loginAdminBackend(username, password) {
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data && data.success) {
            const creds = getAdminCredentials();
            creds.username = username;
            creds.password = password;
            localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(creds));
            return data;
        }
        return { success: false, message: (data && data.message) || 'Invalid username or password' };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

export function checkAdminSession() {
    const sessionActive = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    const localActive = localStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
    return sessionActive === 'true' || localActive === 'true';
}

export function setAdminSession(isActive, rememberMe = false) {
    if (isActive) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        if (rememberMe) {
            localStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
        } else {
            localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        }
    } else {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
}

// --------------------------------------------------------------------------
// General Utility Functions
// --------------------------------------------------------------------------
export function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function formatTimeAgo(isoString) {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return '';
    }
}

// --------------------------------------------------------------------------
// Gallery Images Methods (Max Capacity: 5)
// --------------------------------------------------------------------------
export function getGallery() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.GALLERY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.error('Error reading gallery from localStorage', e);
    }
    saveGallery(DEFAULT_GALLERY);
    return DEFAULT_GALLERY;
}

export function saveGallery(gallery) {
    try {
        localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
        window.dispatchEvent(new CustomEvent('som_gallery_updated', { detail: gallery }));

        // Async persist to backend
        fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gallery })
        }).catch(err => console.warn('Backend saveGallery error:', err));
    } catch (e) {
        console.error('Error saving gallery to localStorage', e);
    }
}

export function addGalleryImage(imageData) {
    const list = getGallery();
    let replaced = false;

    const newItem = {
        id: imageData.id || ('gal-' + Date.now()),
        src: imageData.src,
        tag: imageData.tag ? imageData.tag.trim() : 'Live Stage',
        caption: imageData.caption ? imageData.caption.trim() : 'Stage Moment',
        fullCaption: imageData.fullCaption ? imageData.fullCaption.trim() : (imageData.caption || 'Som Chatterjee Live Performance'),
        isFeatured: Boolean(imageData.isFeatured !== undefined ? imageData.isFeatured : (list.length < 2))
    };

    if (imageData.replaceId) {
        const idx = list.findIndex(g => g.id === imageData.replaceId);
        if (idx !== -1) {
            list[idx] = newItem;
            replaced = true;
        } else {
            list.push(newItem);
        }
    } else if (imageData.replaceSlotIndex !== undefined && imageData.replaceSlotIndex !== null && imageData.replaceSlotIndex >= 0 && imageData.replaceSlotIndex < list.length) {
        list[imageData.replaceSlotIndex] = newItem;
        replaced = true;
    } else if (list.length >= MAX_GALLERY_CAPACITY) {
        // Automatically replace the 5th photo slot (index 4) if full
        list[MAX_GALLERY_CAPACITY - 1] = newItem;
        replaced = true;
    } else {
        list.push(newItem);
    }

    saveGallery(list);

    // Async persist to backend
    fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...newItem,
            replaceId: imageData.replaceId,
            replaceSlotIndex: imageData.replaceSlotIndex
        })
    }).catch(err => console.warn('Backend addGalleryImage error:', err));

    return { success: true, item: newItem, replaced, gallery: list };
}

export function updateGalleryImage(id, data) {
    const list = getGallery();
    const target = list.find(g => g.id === id);
    if (target) {
        if (data.src) target.src = data.src;
        if (data.tag !== undefined) target.tag = data.tag.trim();
        if (data.caption !== undefined) target.caption = data.caption.trim();
        if (data.fullCaption !== undefined) target.fullCaption = data.fullCaption.trim();
        if (data.isFeatured !== undefined) target.isFeatured = Boolean(data.isFeatured);
        saveGallery(list);

        // Async persist to backend
        fetch(`/api/gallery/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.warn('Backend updateGalleryImage error:', err));

        return true;
    }
    return false;
}

export function deleteGalleryImage(id) {
    const list = getGallery().filter(item => item.id !== id);
    saveGallery(list);

    // Async persist to backend
    fetch(`/api/gallery/${id}`, {
        method: 'DELETE'
    }).catch(err => console.warn('Backend deleteGalleryImage error:', err));

    return list;
}

export function resetGallery() {
    saveGallery(DEFAULT_GALLERY);
    fetch('/api/gallery/reset', { method: 'POST' }).catch(err => console.warn('Backend resetGallery error:', err));
    return DEFAULT_GALLERY;
}

// Client-side image compressor utility
export function compressImageFile(file, maxWidth = 1200, maxHeight = 850, quality = 0.82) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Please select a valid image file (PNG, JPG, WebP).'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataUrl);
            };
            img.onerror = () => reject(new Error('Failed to load image.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
    });
}

// Upload image file/dataUrl to server storage (public/uploads/)
export async function uploadGalleryFile(dataUrl) {
    try {
        const res = await fetch('/api/gallery/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUrl })
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Upload failed with status ${res.status}`);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn('Backend file upload fallback to DataURL:', err.message);
        return { success: false, url: dataUrl, error: err.message };
    }
}

