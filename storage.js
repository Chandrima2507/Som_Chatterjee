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
    // Initialize with defaults if not present
    saveTours(DEFAULT_TOURS);
    return DEFAULT_TOURS;
}

export function saveTours(tours) {
    try {
        localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
        window.dispatchEvent(new CustomEvent('som_tours_updated', { detail: tours }));
    } catch (e) {
        console.error('Error saving tours to localStorage', e);
    }
}

export function resetTours() {
    saveTours(DEFAULT_TOURS);
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
    // Initialize with defaults
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
    list.unshift(newEnquiry); // Prepend so latest appears first
    saveEnquiries(list);
    return newEnquiry;
}

export function updateEnquiryStatus(id, newStatus) {
    const list = getEnquiries();
    const target = list.find(item => item.id === id);
    if (target) {
        target.status = newStatus;
        saveEnquiries(list);
        return true;
    }
    return false;
}

export function deleteEnquiry(id) {
    const list = getEnquiries().filter(item => item.id !== id);
    saveEnquiries(list);
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
    // Prevent duplicate emails
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
    return newSub;
}

export function deleteSubscriber(id) {
    const list = getSubscribers().filter(item => item.id !== id);
    saveSubscribers(list);
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
            username: (newUsername || 'admin').trim(),
            password: newPassword.trim()
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_CREDS, JSON.stringify(creds));
        return true;
    } catch (e) {
        console.error('Error updating admin creds', e);
        return false;
    }
}

export function checkAdminSession() {
    // Check sessionStorage first, then localStorage (for "Remember me")
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
            if (Array.isArray(parsed)) {
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
    } catch (e) {
        console.error('Error saving gallery to localStorage', e);
    }
}

export function addGalleryImage(imageData) {
    const list = getGallery();
    if (list.length >= MAX_GALLERY_CAPACITY) {
        return {
            success: false,
            error: `Maximum gallery capacity (${MAX_GALLERY_CAPACITY} images) reached. Delete an image first.`
        };
    }

    const newItem = {
        id: 'gal-' + Date.now(),
        src: imageData.src,
        tag: imageData.tag ? imageData.tag.trim() : 'Live Stage',
        caption: imageData.caption ? imageData.caption.trim() : 'Stage Moment',
        fullCaption: imageData.fullCaption ? imageData.fullCaption.trim() : (imageData.caption || 'Som Chatterjee Live Performance'),
        isFeatured: Boolean(imageData.isFeatured !== undefined ? imageData.isFeatured : (list.length < 2))
    };

    list.push(newItem);
    saveGallery(list);
    return { success: true, item: newItem };
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
        return true;
    }
    return false;
}

export function deleteGalleryImage(id) {
    const list = getGallery().filter(item => item.id !== id);
    saveGallery(list);
    return list;
}

export function resetGallery() {
    saveGallery(DEFAULT_GALLERY);
    return DEFAULT_GALLERY;
}

// Client-side image compressor utility (scales large uploads to fit cleanly in storage)
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
