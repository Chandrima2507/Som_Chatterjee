// ==========================================================================
// SOM CHATTERJEE - ADMIN MANAGEMENT PORTAL JAVASCRIPT LOGIC
// Dynamic Tour CRUD, Booking Enquiry Tracker, Auth Gate & Data Export
// ==========================================================================

import {
    getTours,
    saveTours,
    resetTours,
    DEFAULT_TOURS,
    getEnquiries,
    saveEnquiries,
    updateEnquiryStatus,
    deleteEnquiry,
    getSubscribers,
    deleteSubscriber,
    getAdminCredentials,
    updateAdminCredentials,
    loginAdminBackend,
    checkAdminSession,
    setAdminSession,
    syncWithBackend,
    escapeHTML,
    formatTimeAgo,
    getGallery,
    saveGallery,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    resetGallery,
    compressImageFile,
    uploadGalleryFile,
    MAX_GALLERY_CAPACITY,
    DEFAULT_GALLERY
} from './storage.js';

// Application State
let currentTours = [];
let currentEnquiries = [];
let currentSubscribers = [];
let currentGallery = [];
let stagedGalleryImage = null;
let activeEnquiryFilter = 'all';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initAuthGate();
    initTabs();
    initTourManager();
    initGalleryManager();
    initEnquiryManager();
    initSubscribersManager();
    initSettingsManager();
    initCrossTabSync();

    // Check if admin is already authenticated
    if (checkAdminSession()) {
        unlockDashboard();
    } else {
        lockDashboard();
    }
});

// ==========================================================================
// 1. AUTHENTICATION & SECURITY GATE
// ==========================================================================
function initAuthGate() {
    const loginForm = document.getElementById('adminLoginForm');
    const usernameInput = document.getElementById('admUsername');
    const passwordInput = document.getElementById('admPassword');
    const rememberMe = document.getElementById('rememberMeCheckbox');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const enteredUser = (usernameInput.value || '').trim();
            const enteredPass = (passwordInput.value || '').trim();

            let authSuccess = false;

            try {
                const apiRes = await loginAdminBackend(enteredUser, enteredPass);
                if (apiRes && apiRes.success) {
                    authSuccess = true;
                }
            } catch (err) {
                // Fallback to local check
            }

            if (!authSuccess) {
                const creds = getAdminCredentials();
                if (
                    enteredUser.toLowerCase() === creds.username.toLowerCase() &&
                    enteredPass === creds.password
                ) {
                    authSuccess = true;
                }
            }

            if (authSuccess) {
                // Successful Auth
                if (authErrorMsg) authErrorMsg.style.display = 'none';
                setAdminSession(true, rememberMe ? rememberMe.checked : false);
                unlockDashboard();
                syncWithBackend();
                showToast('Welcome back, Som Management!', 'success');
            } else {
                // Failed Auth
                if (authErrorMsg) {
                    authErrorMsg.style.display = 'block';
                    authErrorMsg.textContent = '⚠️ Invalid username or password. Please verify credentials.';
                }
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    // Sign Out Handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showConfirmModal(
                'Sign Out',
                'Are you sure you want to sign out of the management console?',
                () => {
                    setAdminSession(false);
                    lockDashboard();
                    showToast('Signed out securely.', 'info');
                }
            );
        });
    }
}

function unlockDashboard() {
    const authView = document.getElementById('adminAuthView');
    const dashboardView = document.getElementById('adminDashboardView');
    if (authView) authView.style.display = 'none';
    if (dashboardView) {
        dashboardView.style.display = 'block';
        loadDashboardData();
    }
}

function lockDashboard() {
    const authView = document.getElementById('adminAuthView');
    const dashboardView = document.getElementById('adminDashboardView');
    if (dashboardView) dashboardView.style.display = 'none';
    if (authView) {
        authView.style.display = 'flex';
        const passwordInput = document.getElementById('admPassword');
        if (passwordInput) passwordInput.value = '';
    }
}

function loadDashboardData() {
    currentTours = getTours();
    currentEnquiries = getEnquiries();
    currentSubscribers = getSubscribers();
    currentGallery = getGallery();

    updateMetrics();
    renderToursList();
    renderGalleryAdmin();
    renderEnquiriesFeed();
    renderSubscribersTable();
}

// ==========================================================================
// 2. TABS NAVIGATION & METRICS
// ==========================================================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.admin-tab-btn');
    const tabPanes = document.querySelectorAll('.admin-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            const activePane = document.getElementById(`pane${capitalize(targetTab)}`);
            if (activePane) {
                activePane.classList.add('active');
            }
        });
    });
}

function updateMetrics() {
    const statTours = document.getElementById('statToursCount');
    const statTotalEnquiries = document.getElementById('statTotalEnquiries');
    const statPendingEnquiries = document.getElementById('statPendingEnquiries');
    const statSubscribers = document.getElementById('statSubscribersCount');
    const statGallery = document.getElementById('statGalleryCount');
    const statGallerySub = document.getElementById('statGallerySub');

    const badgeTours = document.getElementById('tabBadgeTours');
    const badgeGallery = document.getElementById('tabBadgeGallery');
    const badgeEnquiries = document.getElementById('tabBadgeEnquiries');
    const badgeSubscribers = document.getElementById('tabBadgeSubscribers');

    const activeTours = currentTours.filter(t => t.active !== false).length;
    const pendingEnquiries = currentEnquiries.filter(e => e.status === 'new').length;
    const galleryCount = currentGallery.length;
    const freeSlots = Math.max(0, MAX_GALLERY_CAPACITY - galleryCount);

    if (statTours) statTours.textContent = activeTours;
    if (statTotalEnquiries) statTotalEnquiries.textContent = currentEnquiries.length;
    if (statPendingEnquiries) statPendingEnquiries.textContent = pendingEnquiries;
    if (statSubscribers) statSubscribers.textContent = currentSubscribers.length;
    if (statGallery) statGallery.textContent = `${galleryCount} / ${MAX_GALLERY_CAPACITY}`;
    if (statGallerySub) statGallerySub.textContent = galleryCount >= MAX_GALLERY_CAPACITY ? 'Capacity Full' : `${freeSlots} Slot${freeSlots !== 1 ? 's' : ''} Available`;

    if (badgeTours) badgeTours.textContent = `${activeTours} Shows`;
    if (badgeGallery) badgeGallery.textContent = `${galleryCount}/${MAX_GALLERY_CAPACITY}`;
    if (badgeEnquiries) badgeEnquiries.textContent = pendingEnquiries > 0 ? `${pendingEnquiries} New` : `${currentEnquiries.length}`;
    if (badgeSubscribers) badgeSubscribers.textContent = currentSubscribers.length;

    // Gallery capacity widget elements in #paneGallery
    const capBadge = document.getElementById('galleryCapacityBadge');
    const capUsed = document.getElementById('galleryUsedCount');
    const capFill = document.getElementById('galleryCapacityFill');
    const capFree = document.getElementById('galleryFreeSlotsCount');
    const btnUpload = document.getElementById('btnOpenUploadModal');

    if (capUsed) capUsed.textContent = galleryCount;
    if (capFree) capFree.textContent = freeSlots;
    if (capFill) {
        const pct = Math.min(100, (galleryCount / MAX_GALLERY_CAPACITY) * 100);
        capFill.style.width = `${pct}%`;
        if (galleryCount >= MAX_GALLERY_CAPACITY) {
            capFill.classList.remove('bar-green');
        } else {
            capFill.classList.add('bar-green');
        }
    }
    if (capBadge) {
        if (galleryCount >= MAX_GALLERY_CAPACITY) {
            capBadge.textContent = '5 / 5 SLOTS USED (FULL)';
            capBadge.classList.remove('badge-available');
        } else {
            capBadge.textContent = `${galleryCount} / ${MAX_GALLERY_CAPACITY} USED (${freeSlots} AVAILABLE)`;
            capBadge.classList.add('badge-available');
        }
    }
    if (btnUpload) {
        if (galleryCount >= MAX_GALLERY_CAPACITY) {
            btnUpload.innerHTML = '⚠️ Capacity Full (5/5)';
            btnUpload.title = 'Maximum capacity reached (5 images). Delete a photo to upload a new one.';
        } else {
            btnUpload.innerHTML = `➕ Upload Image (${freeSlots} Available)`;
            btnUpload.title = 'Upload a new stage photo';
        }
    }

    // Filter pill counters
    const cntAll = document.getElementById('cntEnqAll');
    const cntNew = document.getElementById('cntEnqNew');
    const cntContacted = document.getElementById('cntEnqContacted');
    const cntArchived = document.getElementById('cntEnqArchived');

    if (cntAll) cntAll.textContent = currentEnquiries.length;
    if (cntNew) cntNew.textContent = currentEnquiries.filter(e => e.status === 'new').length;
    if (cntContacted) cntContacted.textContent = currentEnquiries.filter(e => e.status === 'contacted').length;
    if (cntArchived) cntArchived.textContent = currentEnquiries.filter(e => e.status === 'archived').length;
}

// ==========================================================================
// 3. TOUR DATES MANAGEMENT
// ==========================================================================
function initTourManager() {
    const btnOpenAdd = document.getElementById('btnOpenAddTourModal');
    const btnReset = document.getElementById('btnResetToursDefault');
    const searchInput = document.getElementById('tourSearchInput');
    const filterSelect = document.getElementById('tourFilterStatus');

    // Add Tour Button
    if (btnOpenAdd) {
        btnOpenAdd.addEventListener('click', () => {
            openTourModal();
        });
    }

    // Reset Defaults Button
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            showConfirmModal(
                'Reset Tour Dates',
                'Are you sure you want to reset all tour dates to original default shows? Custom tour changes will be replaced.',
                () => {
                    currentTours = resetTours();
                    updateMetrics();
                    renderToursList();
                    showToast('Tour dates reset to original defaults.', 'success');
                }
            );
        });
    }

    // Search & Filter Listeners
    if (searchInput) {
        searchInput.addEventListener('input', () => renderToursList());
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', () => renderToursList());
    }

    // Tour Form Modal Listeners
    initTourFormModal();
}

function renderToursList() {
    const listContainer = document.getElementById('tourAdminList');
    if (!listContainer) return;

    const searchTerm = (document.getElementById('tourSearchInput')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('tourFilterStatus')?.value || 'all';

    const filtered = currentTours.filter(tour => {
        const matchesSearch =
            tour.venue.toLowerCase().includes(searchTerm) ||
            tour.city.toLowerCase().includes(searchTerm) ||
            tour.date.toLowerCase().includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="adm-empty-state">
                <div class="empty-icon">📅</div>
                <h4 class="empty-title">No Tour Dates Found</h4>
                <p class="empty-desc">No tour dates match your search or filter criteria. You can create a new show or reset to defaults.</p>
                <button type="button" class="btn-adm btn-adm-primary btn-adm-sm" onclick="document.getElementById('btnOpenAddTourModal').click()">
                    ➕ Add Tour Date
                </button>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map((tour, index) => {
        const isFirst = index === 0;
        const isLast = index === filtered.length - 1;
        const statusClass = getStatusClass(tour.status);

        return `
            <div class="tour-admin-item ${tour.active === false ? 'inactive' : ''}" data-id="${tour.id}">
                <!-- Reorder Controls -->
                <div class="tour-col-reorder">
                    <button type="button" class="btn-reorder btn-move-up" data-id="${tour.id}" ${isFirst ? 'disabled' : ''} title="Move Up">▲</button>
                    <button type="button" class="btn-reorder btn-move-down" data-id="${tour.id}" ${isLast ? 'disabled' : ''} title="Move Down">▼</button>
                </div>

                <!-- Date & Day -->
                <div class="tour-col-date">
                    <div class="date-main">${escapeHTML(tour.date)}</div>
                    <div class="date-sub">${escapeHTML(tour.dayTime)}</div>
                </div>

                <!-- Venue & City -->
                <div class="tour-col-venue">
                    <div class="venue-title">${escapeHTML(tour.venue)}</div>
                    <div class="venue-city">${escapeHTML(tour.city)}</div>
                </div>

                <!-- Status Badge -->
                <div class="tour-col-status">
                    <span class="status-tag ${statusClass}">${escapeHTML(tour.status)}</span>
                </div>

                <!-- Public Toggle Switch -->
                <div class="tour-col-toggle">
                    <span class="switch-label">${tour.active !== false ? 'Active' : 'Hidden'}</span>
                    <label class="adm-switch">
                        <input type="checkbox" class="toggle-tour-active" data-id="${tour.id}" ${tour.active !== false ? 'checked' : ''}>
                        <span class="adm-slider"></span>
                    </label>
                </div>

                <!-- Action Buttons -->
                <div class="tour-col-actions">
                    <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-edit-tour" data-id="${tour.id}" title="Edit Tour">
                        ✏️ Edit
                    </button>
                    <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-dup-tour" data-id="${tour.id}" title="Duplicate Tour">
                        📋
                    </button>
                    <button type="button" class="btn-adm btn-adm-danger btn-adm-sm btn-delete-tour" data-id="${tour.id}" title="Delete Tour">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Attach Tour Item Event Listeners
    attachTourItemEvents(listContainer);
}

function attachTourItemEvents(container) {
    // Edit buttons
    container.querySelectorAll('.btn-edit-tour').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentTours.find(t => t.id === id);
            if (target) openTourModal(target);
        });
    });

    // Duplicate buttons
    container.querySelectorAll('.btn-dup-tour').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            duplicateTour(id);
        });
    });

    // Delete buttons
    container.querySelectorAll('.btn-delete-tour').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentTours.find(t => t.id === id);
            showConfirmModal(
                'Delete Tour Date',
                `Are you sure you want to delete the show at "${target?.venue || 'this venue'}" on ${target?.date || ''}?`,
                () => {
                    currentTours = currentTours.filter(t => t.id !== id);
                    saveTours(currentTours);
                    updateMetrics();
                    renderToursList();
                    showToast('Tour date removed successfully.', 'danger');
                }
            );
        });
    });

    // Active Toggle Switch
    container.querySelectorAll('.toggle-tour-active').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = checkbox.getAttribute('data-id');
            const target = currentTours.find(t => t.id === id);
            if (target) {
                target.active = checkbox.checked;
                saveTours(currentTours);
                updateMetrics();
                renderToursList();
                showToast(`Tour show set to ${target.active ? 'Active (Visible)' : 'Hidden (Draft)'}.`, 'info');
            }
        });
    });

    // Reorder Buttons (Up & Down)
    container.querySelectorAll('.btn-move-up').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const idx = currentTours.findIndex(t => t.id === id);
            if (idx > 0) {
                const temp = currentTours[idx];
                currentTours[idx] = currentTours[idx - 1];
                currentTours[idx - 1] = temp;
                saveTours(currentTours);
                renderToursList();
                showToast('Tour order updated.', 'info');
            }
        });
    });

    container.querySelectorAll('.btn-move-down').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const idx = currentTours.findIndex(t => t.id === id);
            if (idx >= 0 && idx < currentTours.length - 1) {
                const temp = currentTours[idx];
                currentTours[idx] = currentTours[idx + 1];
                currentTours[idx + 1] = temp;
                saveTours(currentTours);
                renderToursList();
                showToast('Tour order updated.', 'info');
            }
        });
    });
}

function duplicateTour(id) {
    const target = currentTours.find(t => t.id === id);
    if (!target) return;

    const clone = {
        ...target,
        id: 'tour-' + Date.now(),
        venue: `${target.venue} (Copy)`
    };

    const targetIdx = currentTours.findIndex(t => t.id === id);
    currentTours.splice(targetIdx + 1, 0, clone);
    saveTours(currentTours);
    updateMetrics();
    renderToursList();
    showToast('Tour date duplicated.', 'success');
}

function getStatusClass(status) {
    switch (status) {
        case 'Upcoming Show':
            return 'status-tag-hot';
        case 'Confirmed':
            return 'status-tag-confirmed';
        case 'Sold Out':
            return 'status-tag-soldout';
        case 'Postponed':
            return 'status-tag-postponed';
        default:
            return 'status-tag-confirmed';
    }
}

// --------------------------------------------------------------------------
// Tour Modal Form & Live Preview
// --------------------------------------------------------------------------
function initTourFormModal() {
    const modalBackdrop = document.getElementById('tourModalBackdrop');
    const modalClose = document.getElementById('tourModalClose');
    const modalCancel = document.getElementById('tourModalCancel');
    const tourForm = document.getElementById('tourForm');

    // Inputs for live preview
    const dateInput = document.getElementById('tourDate');
    const dayTimeInput = document.getElementById('tourDayTime');
    const venueInput = document.getElementById('tourVenue');
    const cityInput = document.getElementById('tourCity');
    const statusSelect = document.getElementById('tourStatus');
    const actionTextInput = document.getElementById('tourActionText');

    const updatePreview = () => {
        const previewDate = document.getElementById('previewDate');
        const previewDayTime = document.getElementById('previewDayTime');
        const previewVenue = document.getElementById('previewVenue');
        const previewCity = document.getElementById('previewCity');
        const previewBadge = document.getElementById('previewBadge');
        const previewBtn = document.getElementById('previewBtn');

        if (previewDate) previewDate.textContent = dateInput.value || '18.11.2026';
        if (previewDayTime) previewDayTime.textContent = dayTimeInput.value || 'Saturday · 7:00 PM';
        if (previewVenue) previewVenue.textContent = venueInput.value || 'Nazrul Mancha, Kolkata';
        if (previewCity) previewCity.textContent = cityInput.value || 'West Bengal, India';
        if (previewBadge) {
            previewBadge.textContent = statusSelect.value;
            previewBadge.className = `badge ${statusSelect.value === 'Upcoming Show' ? 'badge-hot' : ''}`;
        }
        if (previewBtn) previewBtn.textContent = actionTextInput.value || 'Enquire Event';
    };

    [dateInput, dayTimeInput, venueInput, cityInput, statusSelect, actionTextInput].forEach(el => {
        if (el) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    const closeModal = () => {
        if (modalBackdrop) modalBackdrop.classList.remove('active');
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalCancel) modalCancel.addEventListener('click', closeModal);

    // Save Tour Submit
    if (tourForm) {
        tourForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const tourId = document.getElementById('tourId').value;
            const dateVal = dateInput.value.trim();
            const dayTimeVal = dayTimeInput.value.trim();
            const venueVal = venueInput.value.trim();
            const cityVal = cityInput.value.trim();
            const statusVal = statusSelect.value;
            const actionTextVal = actionTextInput.value.trim() || 'Enquire Event';
            const actionUrlVal = document.getElementById('tourActionUrl').value.trim() || '#contact';
            const activeVal = document.getElementById('tourActive').checked;

            const badgeType = statusVal === 'Upcoming Show' ? 'badge-hot' : 'badge';

            if (tourId) {
                // Editing existing tour
                const existingIdx = currentTours.findIndex(t => t.id === tourId);
                if (existingIdx !== -1) {
                    currentTours[existingIdx] = {
                        ...currentTours[existingIdx],
                        date: dateVal,
                        dayTime: dayTimeVal,
                        venue: venueVal,
                        city: cityVal,
                        status: statusVal,
                        badgeType: badgeType,
                        actionText: actionTextVal,
                        actionUrl: actionUrlVal,
                        active: activeVal
                    };
                    showToast('Tour date updated successfully!', 'success');
                }
            } else {
                // Creating new tour
                const newTour = {
                    id: 'tour-' + Date.now(),
                    date: dateVal,
                    dayTime: dayTimeVal,
                    venue: venueVal,
                    city: cityVal,
                    status: statusVal,
                    badgeType: badgeType,
                    actionText: actionTextVal,
                    actionUrl: actionUrlVal,
                    active: activeVal
                };
                currentTours.push(newTour);
                showToast('New tour date added to schedule!', 'success');
            }

            saveTours(currentTours);
            updateMetrics();
            renderToursList();
            closeModal();
        });
    }
}

function openTourModal(tourData = null) {
    const modalBackdrop = document.getElementById('tourModalBackdrop');
    const modalTitle = document.getElementById('tourModalTitle');
    const tourId = document.getElementById('tourId');
    const dateInput = document.getElementById('tourDate');
    const dayTimeInput = document.getElementById('tourDayTime');
    const venueInput = document.getElementById('tourVenue');
    const cityInput = document.getElementById('tourCity');
    const statusSelect = document.getElementById('tourStatus');
    const actionTextInput = document.getElementById('tourActionText');
    const actionUrlInput = document.getElementById('tourActionUrl');
    const activeCheckbox = document.getElementById('tourActive');

    if (tourData) {
        modalTitle.textContent = 'Edit Tour Date';
        tourId.value = tourData.id;
        dateInput.value = tourData.date;
        dayTimeInput.value = tourData.dayTime;
        venueInput.value = tourData.venue;
        cityInput.value = tourData.city;
        statusSelect.value = tourData.status || 'Confirmed';
        actionTextInput.value = tourData.actionText || 'Enquire Event';
        actionUrlInput.value = tourData.actionUrl || '#contact';
        activeCheckbox.checked = tourData.active !== false;
    } else {
        modalTitle.textContent = 'Add New Tour Date';
        tourId.value = '';
        dateInput.value = '';
        dayTimeInput.value = '';
        venueInput.value = '';
        cityInput.value = '';
        statusSelect.value = 'Upcoming Show';
        actionTextInput.value = 'Enquire Event';
        actionUrlInput.value = '#contact';
        activeCheckbox.checked = true;
    }

    // Trigger preview update
    dateInput.dispatchEvent(new Event('input'));

    if (modalBackdrop) modalBackdrop.classList.add('active');
}

// ==========================================================================
// 3.5 GALLERY IMAGES MANAGEMENT (CAPACITY: 5 STRICT)
// ==========================================================================
function initGalleryManager() {
    const btnUpload = document.getElementById('btnOpenUploadModal');
    const btnReset = document.getElementById('btnResetGalleryDefault');
    const modalClose = document.getElementById('galleryModalClose');
    const modalCancel = document.getElementById('galleryModalCancel');
    const form = document.getElementById('galleryForm');

    const fileInput = document.getElementById('galleryFileInput');
    const dropzone = document.getElementById('galleryDropzone');
    const srcInput = document.getElementById('gallerySrcInput');
    const clearBtn = document.getElementById('btnClearImage');
    const previewWrapper = document.getElementById('galleryPreviewWrapper');
    const previewImg = document.getElementById('galleryPreviewImg');
    const previewBadge = document.getElementById('previewCompressionBadge');

    // Open Upload Modal (Never blocked; allows adding or slot replacement)
    if (btnUpload) {
        btnUpload.addEventListener('click', () => {
            openGalleryModal();
        });
    }

    // Reset to Default 5 Photos
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            showConfirmModal(
                'Reset Gallery Photos',
                'Are you sure you want to restore the original 5 curated live concert photos? Any uploaded photos will be replaced.',
                () => {
                    currentGallery = resetGallery();
                    updateMetrics();
                    renderGalleryAdmin();
                    showToast('Gallery restored to original 5 curated stage photos.', 'success');
                }
            );
        });
    }

    // Dropzone & File Input Handling
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) handleGalleryFile(file);
        });
    }

    if (dropzone) {
        dropzone.style.cursor = 'pointer';
        dropzone.addEventListener('click', (e) => {
            if (fileInput && e.target !== fileInput) {
                fileInput.click();
            }
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt && dt.files;
            if (files && files.length > 0) {
                handleGalleryFile(files[0]);
            }
        });
    }

    async function handleGalleryFile(file) {
        try {
            if (previewBadge) previewBadge.textContent = '⏳ Compressing photo...';
            if (previewWrapper) previewWrapper.style.display = 'block';

            const compressedData = await compressImageFile(file, 1200, 850, 0.82);
            if (previewImg) previewImg.src = compressedData;
            if (previewBadge) previewBadge.textContent = '⏳ Saving photo to server...';

            // Upload directly to permanent server disk storage (public/uploads/)
            const uploadRes = await uploadGalleryFile(compressedData);
            if (uploadRes && uploadRes.success && uploadRes.url) {
                stagedGalleryImage = uploadRes.url;
                if (previewBadge) {
                    previewBadge.textContent = `✓ Uploaded to Server (${uploadRes.filename || 'Ready'})`;
                }
                showToast('Photo uploaded and optimized successfully!', 'success');
            } else {
                // Fallback to data URL
                stagedGalleryImage = compressedData;
                const approxSizeKb = Math.round(compressedData.length * 0.75 / 1024);
                if (previewBadge) {
                    previewBadge.textContent = `✓ Optimized Ready (~${approxSizeKb} KB)`;
                }
                showToast('Photo processed and ready for upload!', 'info');
            }

            if (srcInput) srcInput.value = ''; // Clear manual URL when file uploaded
        } catch (err) {
            showToast(err.message || 'Error processing image file.', 'danger');
            if (previewWrapper) previewWrapper.style.display = 'none';
        }
    }

    // Manual URL typing listener
    if (srcInput) {
        srcInput.addEventListener('input', () => {
            const val = srcInput.value.trim();
            if (val) {
                stagedGalleryImage = null; // Prefer typed URL/preset
                if (previewImg) previewImg.src = val;
                if (previewWrapper) previewWrapper.style.display = 'block';
                if (previewBadge) previewBadge.textContent = '✓ Asset URL Loaded';
            }
        });
    }

    // Clear Preview button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            stagedGalleryImage = null;
            if (fileInput) fileInput.value = '';
            if (srcInput) srcInput.value = '';
            if (previewImg) previewImg.src = '';
            if (previewWrapper) previewWrapper.style.display = 'none';
        });
    }

    // Modal Close handlers
    if (modalClose) modalClose.addEventListener('click', closeGalleryModal);
    if (modalCancel) modalCancel.addEventListener('click', closeGalleryModal);

    // Form Submit (Save / Upload)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const imageId = document.getElementById('galleryImageId')?.value || '';
            const tag = (document.getElementById('galleryTag')?.value || 'Live Concert').trim();
            const caption = (document.getElementById('galleryCaption')?.value || 'Stage Charisma').trim();
            const fullCaption = (document.getElementById('galleryFullCaption')?.value || caption).trim();
            const isFeatured = document.getElementById('galleryIsFeatured')?.checked ?? false;

            const finalSrc = stagedGalleryImage || (srcInput ? srcInput.value.trim() : '');

            if (!finalSrc) {
                showToast('Please upload an image file or provide an image URL.', 'danger');
                return;
            }

            if (!imageId) {
                // Uploading NEW image or replacing a slot
                const slotSelect = document.getElementById('gallerySlotSelect');
                const rawSlotVal = slotSelect ? slotSelect.value : '';
                const targetSlot = rawSlotVal !== '' ? parseInt(rawSlotVal, 10) : undefined;

                const result = addGalleryImage({
                    src: finalSrc,
                    tag,
                    caption,
                    fullCaption,
                    isFeatured,
                    replaceSlotIndex: targetSlot
                });

                if (!result.success) {
                    showToast(result.error || 'Failed to add image.', 'danger');
                    return;
                }

                const slotNum = (targetSlot !== undefined && !isNaN(targetSlot)) ? targetSlot + 1 : currentGallery.length;
                if (result.replaced) {
                    showToast(`Photo saved to Slot ${slotNum} successfully!`, 'success');
                } else {
                    showToast(`Stage photo successfully uploaded! (${currentGallery.length} of ${MAX_GALLERY_CAPACITY} slots used)`, 'success');
                }
            } else {
                // Editing existing image metadata
                updateGalleryImage(imageId, {
                    src: finalSrc,
                    tag,
                    caption,
                    fullCaption,
                    isFeatured
                });
                showToast('Gallery photo details updated successfully!', 'success');
            }

            currentGallery = getGallery();
            closeGalleryModal();
            updateMetrics();
            renderGalleryAdmin();
        });
    }
}

function openGalleryModal(itemToEdit = null, isReplaceMode = false) {
    const modalBackdrop = document.getElementById('galleryModalBackdrop');
    const modalTitle = document.getElementById('galleryModalTitle');
    const modalSaveBtn = document.getElementById('galleryModalSave');
    const modalCapacityAlert = document.getElementById('modalCapacityAlert');
    const modalCapacityNote = document.getElementById('modalCapacityNote');

    const imageIdInput = document.getElementById('galleryImageId');
    const fileInput = document.getElementById('galleryFileInput');
    const srcInput = document.getElementById('gallerySrcInput');
    const tagInput = document.getElementById('galleryTag');
    const captionInput = document.getElementById('galleryCaption');
    const fullCaptionInput = document.getElementById('galleryFullCaption');
    const isFeaturedCheckbox = document.getElementById('galleryIsFeatured');

    const slotGroup = document.getElementById('gallerySlotGroup');
    const slotSelect = document.getElementById('gallerySlotSelect');

    const previewWrapper = document.getElementById('galleryPreviewWrapper');
    const previewImg = document.getElementById('galleryPreviewImg');
    const previewBadge = document.getElementById('previewCompressionBadge');

    stagedGalleryImage = null;
    if (fileInput) fileInput.value = '';

    // Populate Target Slot Dropdown (5 total slots)
    if (slotSelect) {
        slotSelect.innerHTML = '';
        for (let i = 0; i < MAX_GALLERY_CAPACITY; i++) {
            const existing = currentGallery[i];
            const opt = document.createElement('option');
            opt.value = i;
            if (existing) {
                opt.textContent = `Slot ${i + 1}: "${existing.caption || existing.tag}" (Replace Photo)`;
            } else {
                opt.textContent = `Slot ${i + 1}: [Empty Slot · Add New Photo]`;
            }
            slotSelect.appendChild(opt);
        }
    }

    if (itemToEdit && !isReplaceMode) {
        // Pure text/metadata edit
        if (modalTitle) modalTitle.textContent = 'Edit Stage Photo Details';
        if (modalSaveBtn) modalSaveBtn.textContent = 'Save Changes';
        if (imageIdInput) imageIdInput.value = itemToEdit.id;
        if (srcInput) srcInput.value = itemToEdit.src;
        if (tagInput) tagInput.value = itemToEdit.tag || 'Live Concert';
        if (captionInput) captionInput.value = itemToEdit.caption || '';
        if (fullCaptionInput) fullCaptionInput.value = itemToEdit.fullCaption || itemToEdit.caption || '';
        if (isFeaturedCheckbox) isFeaturedCheckbox.checked = Boolean(itemToEdit.isFeatured);

        if (slotGroup) slotGroup.style.display = 'none';

        if (previewImg) previewImg.src = itemToEdit.src;
        if (previewWrapper) previewWrapper.style.display = 'block';
        if (previewBadge) previewBadge.textContent = 'Current Image';

        if (modalCapacityAlert) modalCapacityAlert.classList.remove('alert-full');
        if (modalCapacityNote) modalCapacityNote.textContent = 'Editing existing photo details without using additional capacity.';
    } else if (itemToEdit && isReplaceMode) {
        // Direct Replace mode on a specific card
        const targetIndex = currentGallery.findIndex(g => g.id === itemToEdit.id);
        const slotNumber = targetIndex !== -1 ? targetIndex + 1 : 1;

        if (modalTitle) modalTitle.textContent = `Replace Photo in Slot ${slotNumber}`;
        if (modalSaveBtn) modalSaveBtn.textContent = `Replace Photo (Slot ${slotNumber})`;
        if (imageIdInput) imageIdInput.value = ''; // treated as new upload that replaces target slot
        if (srcInput) srcInput.value = '';
        if (tagInput) tagInput.value = itemToEdit.tag || 'Live Concert';
        if (captionInput) captionInput.value = itemToEdit.caption || 'Stage Performance';
        if (fullCaptionInput) fullCaptionInput.value = itemToEdit.fullCaption || itemToEdit.caption || '';
        if (isFeaturedCheckbox) isFeaturedCheckbox.checked = Boolean(itemToEdit.isFeatured);

        if (slotGroup) slotGroup.style.display = 'block';
        if (slotSelect && targetIndex !== -1) {
            slotSelect.value = targetIndex;
        }

        if (previewWrapper) previewWrapper.style.display = 'none';
        if (previewImg) previewImg.src = '';

        if (modalCapacityAlert) modalCapacityAlert.classList.remove('alert-full');
        if (modalCapacityNote) modalCapacityNote.textContent = `Replacing photo in Slot ${slotNumber} ("${itemToEdit.caption}"). Select a new photo file below.`;
    } else {
        // General Upload Modal
        if (slotGroup) slotGroup.style.display = 'block';

        if (currentGallery.length < MAX_GALLERY_CAPACITY) {
            const nextSlot = currentGallery.length;
            if (slotSelect) slotSelect.value = nextSlot;
            if (modalTitle) modalTitle.textContent = `Upload Stage Photo (Slot ${nextSlot + 1} of ${MAX_GALLERY_CAPACITY})`;
            if (modalSaveBtn) modalSaveBtn.textContent = `Upload to Slot ${nextSlot + 1}`;
            if (modalCapacityAlert) modalCapacityAlert.classList.remove('alert-full');
            if (modalCapacityNote) modalCapacityNote.textContent = `${currentGallery.length} of ${MAX_GALLERY_CAPACITY} slots used. Uploading will fill Slot ${nextSlot + 1}.`;
        } else {
            if (slotSelect) slotSelect.value = MAX_GALLERY_CAPACITY - 1; // Default to Slot 5
            if (modalTitle) modalTitle.textContent = 'Upload & Replace Stage Photo';
            if (modalSaveBtn) modalSaveBtn.textContent = 'Upload & Replace Selected Slot';
            if (modalCapacityAlert) modalCapacityAlert.classList.remove('alert-full');
            if (modalCapacityNote) modalCapacityNote.textContent = `All ${MAX_GALLERY_CAPACITY} slots are in use. Select which photo slot you want to replace below.`;
        }

        if (imageIdInput) imageIdInput.value = '';
        if (srcInput) srcInput.value = '';
        if (tagInput) tagInput.value = 'Live Concert';
        if (captionInput) captionInput.value = 'Concert Energy';
        if (fullCaptionInput) fullCaptionInput.value = 'Som Chatterjee – Electrifying Stage Presence (Live Concert)';
        if (isFeaturedCheckbox) isFeaturedCheckbox.checked = currentGallery.length < 2;

        if (previewWrapper) previewWrapper.style.display = 'none';
        if (previewImg) previewImg.src = '';
    }

    if (modalBackdrop) modalBackdrop.classList.add('active');
}

function closeGalleryModal() {
    const modalBackdrop = document.getElementById('galleryModalBackdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
    stagedGalleryImage = null;
    const form = document.getElementById('galleryForm');
    if (form) form.reset();
}

function renderGalleryAdmin() {
    const gridContainer = document.getElementById('galleryAdminGrid');
    if (!gridContainer) return;

    if (currentGallery.length === 0) {
        gridContainer.innerHTML = `
            <div class="adm-empty-state" style="grid-column: 1 / -1; padding: 50px 20px; text-align: center;">
                <div class="empty-icon" style="font-size: 42px; margin-bottom: 12px;">🖼️</div>
                <h4 class="empty-title" style="font-size: 20px; margin-bottom: 8px;">Gallery is Empty (0 of 5 Used)</h4>
                <p class="empty-desc" style="font-size: 14px; max-width: 480px; margin: 0 auto 20px; color: var(--adm-text-muted);">
                    All 5 gallery slots are currently available. You can upload new stage photos from your device or restore the 5 original concert photos.
                </p>
                <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                    <button type="button" class="btn-adm btn-adm-primary btn-adm-sm" onclick="document.getElementById('btnOpenUploadModal').click()">
                        ➕ Upload First Photo
                    </button>
                    <button type="button" class="btn-adm btn-adm-outline btn-adm-sm" onclick="document.getElementById('btnResetGalleryDefault').click()">
                        🔄 Restore Default 5 Photos
                    </button>
                </div>
            </div>
        `;
        return;
    }

    gridContainer.innerHTML = currentGallery.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === currentGallery.length - 1;
        const isFeatured = item.isFeatured || index < 2;

        return `
            <div class="gallery-admin-card" data-id="${item.id}">
                <div class="gallery-thumb-wrap">
                    <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.caption)}" loading="lazy">
                    <span class="gallery-slot-pill">Slot ${index + 1} of ${MAX_GALLERY_CAPACITY}</span>
                    ${isFeatured ? '<span class="gallery-featured-pill">★ Featured Wide</span>' : ''}
                </div>

                <div class="gallery-card-body">
                    <span class="gallery-card-tag">${escapeHTML(item.tag || 'Live Concert')}</span>
                    <h4 class="gallery-card-caption">${escapeHTML(item.caption)}</h4>
                    <p class="gallery-card-desc">${escapeHTML(item.fullCaption || item.caption)}</p>

                    <div class="gallery-card-actions">
                        <div class="gallery-card-reorder">
                            <button type="button" class="btn-reorder btn-move-gal-up" data-id="${item.id}" ${isFirst ? 'disabled' : ''} title="Move Earlier in Mosaic">▲</button>
                            <button type="button" class="btn-reorder btn-move-gal-down" data-id="${item.id}" ${isLast ? 'disabled' : ''} title="Move Later in Mosaic">▼</button>
                        </div>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-edit-gal" data-id="${item.id}" title="Edit Caption & Details">
                                ✏️ Edit
                            </button>
                            <button type="button" class="btn-adm btn-adm-cyan btn-adm-sm btn-replace-gal" data-id="${item.id}" title="Replace This Photo">
                                📷 Replace
                            </button>
                            <button type="button" class="btn-adm btn-adm-danger btn-adm-sm btn-delete-gal" data-id="${item.id}" title="Delete Image & Free Slot">
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach card event listeners
    attachGalleryCardEvents(gridContainer);
}

function attachGalleryCardEvents(container) {
    // Edit buttons
    container.querySelectorAll('.btn-edit-gal').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentGallery.find(g => g.id === id);
            if (target) openGalleryModal(target, false);
        });
    });

    // Replace Photo buttons
    container.querySelectorAll('.btn-replace-gal').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentGallery.find(g => g.id === id);
            if (target) openGalleryModal(target, true);
        });
    });

    // Delete buttons
    container.querySelectorAll('.btn-delete-gal').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const index = currentGallery.findIndex(g => g.id === id);
            const target = currentGallery[index];
            const caption = target ? target.caption : 'this photo';

            showConfirmModal(
                'Delete Gallery Image',
                `Are you sure you want to delete "${caption}" (Slot ${index + 1} of 5)?\n\nThis will remove it from the public website immediately and free up 1 slot for new uploads.`,
                () => {
                    deleteGalleryImage(id);
                    currentGallery = getGallery();
                    updateMetrics();
                    renderGalleryAdmin();
                    showToast('Photo removed from gallery. 1 slot freed up!', 'info');
                }
            );
        });
    });

    // Reorder Move Up
    container.querySelectorAll('.btn-move-gal-up').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const index = currentGallery.findIndex(g => g.id === id);
            if (index > 0) {
                const temp = currentGallery[index];
                currentGallery[index] = currentGallery[index - 1];
                currentGallery[index - 1] = temp;
                saveGallery(currentGallery);
                updateMetrics();
                renderGalleryAdmin();
                showToast('Gallery mosaic order updated.', 'info');
            }
        });
    });

    // Reorder Move Down
    container.querySelectorAll('.btn-move-gal-down').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const index = currentGallery.findIndex(g => g.id === id);
            if (index < currentGallery.length - 1 && index !== -1) {
                const temp = currentGallery[index];
                currentGallery[index] = currentGallery[index + 1];
                currentGallery[index + 1] = temp;
                saveGallery(currentGallery);
                updateMetrics();
                renderGalleryAdmin();
                showToast('Gallery mosaic order updated.', 'info');
            }
        });
    });
}

// ==========================================================================
// 4. BOOKING ENQUIRIES TRACKER
// ==========================================================================
function initEnquiryManager() {
    const searchInput = document.getElementById('enquirySearchInput');
    const filterPills = document.querySelectorAll('#enquiryFilterPills .filter-pill');
    const btnExportCSV = document.getElementById('btnExportEnquiriesCSV');
    const btnExportJSON = document.getElementById('btnExportEnquiriesJSON');

    // Filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeEnquiryFilter = pill.getAttribute('data-filter') || 'all';
            renderEnquiriesFeed();
        });
    });

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', () => renderEnquiriesFeed());
    }

    // Export CSV
    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', exportEnquiriesCSV);
    }

    // Export JSON
    if (btnExportJSON) {
        btnExportJSON.addEventListener('click', exportEnquiriesJSON);
    }
}

function renderEnquiriesFeed() {
    const feed = document.getElementById('enquiriesFeed');
    if (!feed) return;

    const searchTerm = (document.getElementById('enquirySearchInput')?.value || '').toLowerCase().trim();

    const filtered = currentEnquiries.filter(enq => {
        const matchesFilter =
            activeEnquiryFilter === 'all' ||
            enq.status === activeEnquiryFilter;

        const matchesSearch =
            enq.name.toLowerCase().includes(searchTerm) ||
            enq.email.toLowerCase().includes(searchTerm) ||
            (enq.phone && enq.phone.toLowerCase().includes(searchTerm)) ||
            enq.eventType.toLowerCase().includes(searchTerm) ||
            enq.message.toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        feed.innerHTML = `
            <div class="adm-empty-state">
                <div class="empty-icon">📩</div>
                <h4 class="empty-title">No Enquiries Found</h4>
                <p class="empty-desc">No concert or event booking enquiries match the current filter (${activeEnquiryFilter}). New enquiries submitted from the public booking form will appear here automatically.</p>
            </div>
        `;
        return;
    }

    feed.innerHTML = filtered.map(enq => {
        const initials = getInitials(enq.name);
        const timeAgo = formatTimeAgo(enq.createdAt);
        const status = enq.status || 'new';

        // Pre-filled WhatsApp and Mailto links
        const mailtoLink = `mailto:${encodeURIComponent(enq.email)}?subject=${encodeURIComponent(`Som Chatterjee Booking Enquiry - ${enq.eventType}`)}&body=${encodeURIComponent(`Dear ${enq.name},\n\nThank you for reaching out regarding booking Som Chatterjee for your ${enq.eventType} on ${enq.date}.\n\n`)}`;
        const cleanPhone = enq.phone ? enq.phone.replace(/[^0-9+]/g, '') : '';
        const whatsappLink = cleanPhone
            ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(`Hello ${enq.name}, this is the management team of Som Chatterjee regarding your booking enquiry for ${enq.eventType}.`)}`
            : null;

        return `
            <article class="enquiry-card status-${status}" data-id="${enq.id}">
                <div class="enquiry-header">
                    <div class="enquiry-client-meta">
                        <div class="client-avatar">${initials}</div>
                        <div>
                            <h4 class="client-name">${escapeHTML(enq.name)}</h4>
                            <span class="enquiry-event-badge">${escapeHTML(enq.eventType)}</span>
                        </div>
                    </div>

                    <div class="enquiry-status-time">
                        <span class="enquiry-status-pill ${status}">
                            ${status === 'new' ? '● NEW ENQUIRY' : status.toUpperCase()}
                        </span>
                        <span class="enquiry-time">${timeAgo}</span>
                    </div>
                </div>

                <div class="enquiry-contact-strip">
                    <div class="contact-chip">
                        <span>✉️</span>
                        <a href="${mailtoLink}">${escapeHTML(enq.email)}</a>
                    </div>
                    ${enq.phone ? `
                    <div class="contact-chip">
                        <span>📞</span>
                        <a href="tel:${escapeHTML(enq.phone)}">${escapeHTML(enq.phone)}</a>
                    </div>
                    ` : ''}
                    <div class="contact-chip">
                        <span>📅 Requested Date:</span>
                        <strong style="color: var(--adm-text);">${escapeHTML(enq.date || 'TBD')}</strong>
                    </div>
                </div>

                <div class="enquiry-message-box">
                    ${escapeHTML(enq.message)}
                </div>

                <div class="enquiry-actions-bar">
                    <div class="enquiry-actions-left">
                        ${status === 'new' ? `
                            <button type="button" class="btn-adm btn-adm-cyan btn-adm-sm btn-mark-status" data-id="${enq.id}" data-status="contacted">
                                ✓ Mark as Contacted
                            </button>
                        ` : `
                            <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-mark-status" data-id="${enq.id}" data-status="new">
                                ↺ Mark as New
                            </button>
                        `}
                        ${status !== 'archived' ? `
                            <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-mark-status" data-id="${enq.id}" data-status="archived">
                                📁 Archive
                            </button>
                        ` : ''}
                    </div>

                    <div class="enquiry-actions-right">
                        <a href="${mailtoLink}" class="btn-adm btn-adm-outline btn-adm-sm" title="Reply via Email">
                            ✉️ Reply Email
                        </a>
                        ${whatsappLink ? `
                        <a href="${whatsappLink}" target="_blank" rel="noopener" class="btn-adm btn-adm-outline btn-adm-sm" style="color: #25D366; border-color: rgba(37, 211, 102, 0.4);" title="Chat on WhatsApp">
                            💬 WhatsApp
                        </a>
                        ` : ''}
                        <button type="button" class="btn-adm btn-adm-outline btn-adm-sm btn-copy-enq" data-id="${enq.id}" title="Copy info to clipboard">
                            📋 Copy
                        </button>
                        <button type="button" class="btn-adm btn-adm-danger btn-adm-sm btn-delete-enq" data-id="${enq.id}" title="Delete enquiry">
                            🗑️
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    attachEnquiryEvents(feed);
}

function attachEnquiryEvents(container) {
    // Status update buttons
    container.querySelectorAll('.btn-mark-status').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const newStatus = btn.getAttribute('data-status');
            updateEnquiryStatus(id, newStatus);
            currentEnquiries = getEnquiries();
            updateMetrics();
            renderEnquiriesFeed();
            showToast(`Enquiry status changed to "${capitalize(newStatus)}".`, 'info');
        });
    });

    // Delete buttons
    container.querySelectorAll('.btn-delete-enq').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentEnquiries.find(e => e.id === id);
            showConfirmModal(
                'Delete Enquiry',
                `Are you sure you want to delete the enquiry from "${target?.name || 'this client'}"?`,
                () => {
                    deleteEnquiry(id);
                    currentEnquiries = getEnquiries();
                    updateMetrics();
                    renderEnquiriesFeed();
                    showToast('Enquiry deleted.', 'danger');
                }
            );
        });
    });

    // Copy Details button
    container.querySelectorAll('.btn-copy-enq').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const target = currentEnquiries.find(e => e.id === id);
            if (!target) return;

            const text = `SOM CHATTERJEE CONCERT ENQUIRY:\n` +
                `Client: ${target.name}\n` +
                `Email: ${target.email}\n` +
                `Phone: ${target.phone || 'N/A'}\n` +
                `Event Type: ${target.eventType}\n` +
                `Expected Date: ${target.date}\n` +
                `Message: ${target.message}\n` +
                `Received: ${new Date(target.createdAt).toLocaleString()}`;

            navigator.clipboard.writeText(text).then(() => {
                showToast('Enquiry details copied to clipboard!', 'success');
            }).catch(() => {
                showToast('Unable to copy to clipboard.', 'danger');
            });
        });
    });
}

function getInitials(name) {
    if (!name) return 'SC';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

function exportEnquiriesCSV() {
    if (!currentEnquiries.length) {
        showToast('No enquiries to export.', 'info');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Phone', 'EventType', 'ExpectedDate', 'Status', 'CreatedAt', 'Message'];
    const rows = currentEnquiries.map(e => [
        `"${e.id}"`,
        `"${(e.name || '').replace(/"/g, '""')}"`,
        `"${(e.email || '').replace(/"/g, '""')}"`,
        `"${(e.phone || '').replace(/"/g, '""')}"`,
        `"${(e.eventType || '').replace(/"/g, '""')}"`,
        `"${(e.date || '').replace(/"/g, '""')}"`,
        `"${e.status || 'new'}"`,
        `"${e.createdAt || ''}"`,
        `"${(e.message || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(csvContent, 'text/csv;charset=utf-8;', `som-chatterjee-enquiries-${getDateSlug()}.csv`);
    showToast('Enquiries CSV downloaded!', 'success');
}

function exportEnquiriesJSON() {
    if (!currentEnquiries.length) {
        showToast('No enquiries to export.', 'info');
        return;
    }
    const jsonStr = JSON.stringify(currentEnquiries, null, 2);
    downloadBlob(jsonStr, 'application/json', `som-chatterjee-enquiries-${getDateSlug()}.json`);
    showToast('Enquiries JSON downloaded!', 'success');
}

// ==========================================================================
// 5. SUBSCRIBERS TABLE
// ==========================================================================
function initSubscribersManager() {
    const searchInput = document.getElementById('subSearchInput');
    const btnExportCSV = document.getElementById('btnExportSubscribersCSV');

    if (searchInput) {
        searchInput.addEventListener('input', () => renderSubscribersTable());
    }

    if (btnExportCSV) {
        btnExportCSV.addEventListener('click', () => {
            if (!currentSubscribers.length) {
                showToast('No subscribers to export.', 'info');
                return;
            }
            const headers = ['#', 'Email', 'SubscribedAt'];
            const rows = currentSubscribers.map((s, idx) => [
                idx + 1,
                `"${s.email}"`,
                `"${s.subscribedAt}"`
            ]);
            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            downloadBlob(csv, 'text/csv;charset=utf-8;', `som-chatterjee-subscribers-${getDateSlug()}.csv`);
            showToast('Subscribers CSV exported!', 'success');
        });
    }
}

function renderSubscribersTable() {
    const tbody = document.getElementById('subscribersTableBody');
    if (!tbody) return;

    const searchTerm = (document.getElementById('subSearchInput')?.value || '').toLowerCase().trim();
    const filtered = currentSubscribers.filter(s => s.email.toLowerCase().includes(searchTerm));

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: var(--adm-text-muted);">
                    No subscribers found matching your search.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map((sub, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>
                <a href="mailto:${escapeHTML(sub.email)}" style="color: var(--adm-cyan); text-decoration: none;">
                    ${escapeHTML(sub.email)}
                </a>
            </td>
            <td style="color: var(--adm-text-muted); font-size: 13px;">
                ${new Date(sub.subscribedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </td>
            <td style="text-align: right;">
                <button type="button" class="btn-adm btn-adm-danger btn-adm-sm btn-del-sub" data-id="${sub.id}">
                    ✕ Remove
                </button>
            </td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.btn-del-sub').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            showConfirmModal(
                'Remove Subscriber',
                'Are you sure you want to remove this subscriber from the mailing list?',
                () => {
                    deleteSubscriber(id);
                    currentSubscribers = getSubscribers();
                    updateMetrics();
                    renderSubscribersTable();
                    showToast('Subscriber removed.', 'info');
                }
            );
        });
    });
}

// ==========================================================================
// 6. SETTINGS & SYSTEM BACKUP / FACTORY RESET
// ==========================================================================
function initSettingsManager() {
    const passwordForm = document.getElementById('changePasswordForm');
    const btnBackup = document.getElementById('btnBackupAllData');
    const importFileInput = document.getElementById('importBackupFile');
    const btnResetAll = document.getElementById('btnFactoryReset');

    // Change Password
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const curr = document.getElementById('currentPassword').value.trim();
            const newP = document.getElementById('newPassword').value.trim();
            const conf = document.getElementById('confirmPassword').value.trim();

            const creds = getAdminCredentials();
            if (curr !== creds.password) {
                showToast('Current password does not match.', 'danger');
                return;
            }
            if (newP.length < 6) {
                showToast('New password must be at least 6 characters.', 'danger');
                return;
            }
            if (newP !== conf) {
                showToast('New passwords do not match.', 'danger');
                return;
            }

            updateAdminCredentials(creds.username, newP);
            passwordForm.reset();
            showToast('Admin password updated successfully!', 'success');
        });
    }

    // Backup All Data
    if (btnBackup) {
        btnBackup.addEventListener('click', () => {
            const fullBackup = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                tours: currentTours,
                gallery: currentGallery,
                enquiries: currentEnquiries,
                subscribers: currentSubscribers
            };
            downloadBlob(
                JSON.stringify(fullBackup, null, 2),
                'application/json',
                `som-chatterjee-full-backup-${getDateSlug()}.json`
            );
            showToast('Full backup snapshot downloaded!', 'success');
        });
    }

    // Import Backup File
    if (importFileInput) {
        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.tours && Array.isArray(data.tours)) {
                        saveTours(data.tours);
                    }
                    if (data.gallery && Array.isArray(data.gallery)) {
                        saveGallery(data.gallery.slice(0, MAX_GALLERY_CAPACITY));
                    }
                    if (data.enquiries && Array.isArray(data.enquiries)) {
                        saveEnquiries(data.enquiries);
                    }
                    loadDashboardData();
                    showToast('Backup restored successfully!', 'success');
                } catch (err) {
                    showToast('Invalid backup JSON file.', 'danger');
                }
            };
            reader.readAsText(file);
        });
    }

    // Factory Reset
    if (btnResetAll) {
        btnResetAll.addEventListener('click', () => {
            showConfirmModal(
                'Factory Reset All Data',
                'This will reset ALL tours, gallery photos, enquiries, and subscribers back to the initial demo state. Continue?',
                () => {
                    localStorage.clear();
                    sessionStorage.clear();
                    setAdminSession(true); // Maintain login session
                    loadDashboardData();
                    showToast('All data reset to initial defaults.', 'success');
                }
            );
        });
    }
}

// ==========================================================================
// 7. REAL-TIME CROSS-TAB SYNC
// ==========================================================================
function initCrossTabSync() {
    window.addEventListener('storage', (e) => {
        if (e.key === 'som_chatterjee_enquiries') {
            currentEnquiries = getEnquiries();
            updateMetrics();
            renderEnquiriesFeed();
            showToast('New booking enquiry received!', 'success');
        } else if (e.key === 'som_chatterjee_tours') {
            currentTours = getTours();
            updateMetrics();
            renderToursList();
        } else if (e.key === 'som_chatterjee_gallery') {
            currentGallery = getGallery();
            updateMetrics();
            renderGalleryAdmin();
        } else if (e.key === 'som_chatterjee_subscribers') {
            currentSubscribers = getSubscribers();
            updateMetrics();
            renderSubscribersTable();
        }
    });

    window.addEventListener('som_enquiries_updated', (e) => {
        currentEnquiries = e.detail;
        updateMetrics();
        renderEnquiriesFeed();
    });

    window.addEventListener('som_gallery_updated', (e) => {
        currentGallery = e.detail;
        updateMetrics();
        renderGalleryAdmin();
    });
}

// ==========================================================================
// 8. MODAL & TOAST UTILITIES
// ==========================================================================
function showConfirmModal(title, message, onConfirm) {
    const backdrop = document.getElementById('confirmModalBackdrop');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    const closeBtn = document.getElementById('confirmClose');

    if (!backdrop) {
        if (confirm(message)) onConfirm();
        return;
    }

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;

    const closeDialog = () => {
        backdrop.classList.remove('active');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        closeBtn.onclick = null;
    };

    okBtn.onclick = () => {
        closeDialog();
        onConfirm();
    };

    cancelBtn.onclick = closeDialog;
    closeBtn.onclick = closeDialog;

    backdrop.classList.add('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('admToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `adm-toast adm-toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    if (type === 'danger') icon = '⚠️';

    toast.innerHTML = `
        <span style="font-weight: 700; font-size: 15px;">${icon}</span>
        <span>${escapeHTML(message)}</span>
        <button type="button" class="adm-toast-close" aria-label="Close toast">✕</button>
    `;

    toast.querySelector('.adm-toast-close').addEventListener('click', () => {
        toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4500);
}

function downloadBlob(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getDateSlug() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
