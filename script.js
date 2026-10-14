// ==========================================================================
// SOM CHATTERJEE - JAVASCRIPT LOGIC
// Dynamic interactions: Mobile Nav, Lightbox, Audio Player, Booking & Newsletter
// ==========================================================================

import {
    getTours,
    getGallery,
    addEnquiry,
    addSubscriber,
    checkAdminSession,
    escapeHTML
} from './storage.js';

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Navigation Toggle
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "✕" : "☰";
        });

        navLinks.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            });
        });

        // Close on tap outside
        document.addEventListener("click", (e) => {
            if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && e.target !== menuToggle) {
                navLinks.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
                menuToggle.textContent = "☰";
            }
        });
    }

    // 2. Active Navigation Highlight on Scroll
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        const scrollY = window.pageYOffset + 140;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop;
            const sectionId = current.getAttribute("id");

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove("active");
                    if (item.getAttribute("href") === `#${sectionId}`) {
                        item.classList.add("active");
                    }
                });
            }
        });
    });

    // 3. Copyright Year
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. Interactive Sliding Gallery System (Left to Right & Right to Left)
    let currentSlideIndex = 0;
    let galleryItems = [];
    let isAutoplayActive = true;
    let autoplayTimer = null;
    let isDragging = false;
    let startX = 0;
    let prevTranslate = 0;
    let currentTranslate = 0;

    const sliderViewport = document.getElementById("gallerySliderViewport");
    const sliderTrack = document.getElementById("gallerySliderTrack");
    const slidePrevBtn = document.getElementById("gallerySlidePrev");
    const slideNextBtn = document.getElementById("gallerySlideNext");
    const dotsStrip = document.getElementById("galleryDotsStrip");
    const counterText = document.getElementById("galleryCurrentCounter");
    const autoplayToggle = document.getElementById("galleryAutoplayToggle");
    const autoplayIcon = document.getElementById("autoplayIcon");
    const autoplayText = document.getElementById("autoplayText");

    const galleryLightbox = document.getElementById("galleryLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");
    const lightboxPrev = document.getElementById("lightboxPrev");
    const lightboxNext = document.getElementById("lightboxNext");

    function renderPublicGallery() {
        if (!sliderTrack) return;
        galleryItems = getGallery();

        if (galleryItems.length === 0) {
            sliderTrack.innerHTML = `
                <div style="width: 100%; text-align: center; padding: 50px 20px; color: var(--text-muted); background: rgba(29, 46, 58, 0.25); border: 1px dashed var(--border-color); border-radius: 14px;">
                    <p style="font-size: 19px; margin-bottom: 8px; color: var(--text-white);">🎤 Moments On Stage Coming Soon!</p>
                    <p style="font-size: 14px;">Som Chatterjee's live stage photo archive is currently being updated. Check back shortly!</p>
                </div>
            `;
            if (dotsStrip) dotsStrip.innerHTML = '';
            if (counterText) counterText.textContent = '0 / 0';
            return;
        }

        // Clamp slide index
        if (currentSlideIndex >= galleryItems.length) {
            currentSlideIndex = 0;
        }

        // Render Slide Cards
        sliderTrack.innerHTML = galleryItems.map((item, index) => {
            const slotNum = String(index + 1).padStart(2, '0');
            const totalNum = String(galleryItems.length).padStart(2, '0');
            return `
                <article class="gallery-slide-card ${index === currentSlideIndex ? 'active-slide' : ''}"
                    data-index="${index}"
                    data-full="${escapeHTML(item.src)}"
                    data-caption="${escapeHTML(item.fullCaption || item.caption)}"
                    tabindex="0"
                    role="button"
                    aria-label="View photo ${index + 1} of ${galleryItems.length}: ${escapeHTML(item.caption)}">
                    <img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.caption)}" loading="lazy">
                    <div class="slide-overlay">
                        <div class="slide-overlay-top">
                            <span class="slide-tag">${escapeHTML(item.tag || 'Live Concert')}</span>
                            <span class="slide-slot-badge">${slotNum} / ${totalNum}</span>
                        </div>
                        <div class="slide-overlay-bottom">
                            <h3 class="slide-caption">${escapeHTML(item.caption)}</h3>
                            <p class="slide-desc">${escapeHTML(item.fullCaption || item.caption)}</p>
                            <span class="slide-zoom-action">🔍 Expand Fullscreen</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Render Pagination Dots
        if (dotsStrip) {
            dotsStrip.innerHTML = galleryItems.map((_, idx) => `
                <button type="button" class="gallery-dot ${idx === currentSlideIndex ? 'active' : ''}"
                    data-index="${idx}"
                    aria-label="Slide to photo ${idx + 1}"
                    title="Slide to Photo ${idx + 1}">
                </button>
            `).join('');

            dotsStrip.querySelectorAll('.gallery-dot').forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(dot.getAttribute('data-index'), 10);
                    goToSlide(idx);
                    restartAutoplay();
                });
            });
        }

        // Update Counter
        if (counterText) {
            counterText.textContent = `${currentSlideIndex + 1} / ${galleryItems.length}`;
        }

        // Position Slider track smoothly
        requestAnimationFrame(() => {
            updateSliderPosition(false);
        });
    }

    function updateSliderPosition(animate = true) {
        if (!sliderViewport || !sliderTrack || !galleryItems.length) return;

        const cards = Array.from(sliderTrack.querySelectorAll('.gallery-slide-card'));
        if (!cards.length) return;

        const targetCard = cards[currentSlideIndex];
        if (!targetCard) return;

        // Update active class
        cards.forEach((c, idx) => {
            if (idx === currentSlideIndex) {
                c.classList.add('active-slide');
            } else {
                c.classList.remove('active-slide');
            }
        });

        // Update Dots
        if (dotsStrip) {
            const dots = dotsStrip.querySelectorAll('.gallery-dot');
            dots.forEach((dot, idx) => {
                if (idx === currentSlideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Update Counter
        if (counterText) {
            counterText.textContent = `${currentSlideIndex + 1} / ${galleryItems.length}`;
        }

        // Calculate translation offset to center the active card perfectly in viewport
        const viewportWidth = sliderViewport.clientWidth;
        const cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
        const viewportCenter = viewportWidth / 2;
        const targetOffset = -(cardCenter - viewportCenter);

        if (!animate) {
            sliderTrack.classList.add('no-transition');
            sliderTrack.style.transform = `translateX(${targetOffset}px)`;
            void sliderTrack.offsetWidth;
            sliderTrack.classList.remove('no-transition');
        } else {
            sliderTrack.style.transform = `translateX(${targetOffset}px)`;
        }

        prevTranslate = targetOffset;
        currentTranslate = targetOffset;
    }

    function goToSlide(index) {
        if (!galleryItems.length) return;
        currentSlideIndex = (index + galleryItems.length) % galleryItems.length;
        updateSliderPosition(true);
    }

    function slideNext() {
        goToSlide(currentSlideIndex + 1);
    }

    function slidePrev() {
        goToSlide(currentSlideIndex - 1);
    }

    // Navigation Arrow Click Listeners (Left & Right)
    if (slidePrevBtn) {
        slidePrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            slidePrev();
            restartAutoplay();
        });
    }

    if (slideNextBtn) {
        slideNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            slideNext();
            restartAutoplay();
        });
    }

    // Touch & Mouse Drag Swipe Support (Smooth Left / Right gesture)
    if (sliderViewport) {
        // Touch events
        sliderViewport.addEventListener('touchstart', touchStart, { passive: true });
        sliderViewport.addEventListener('touchmove', touchMove, { passive: true });
        sliderViewport.addEventListener('touchend', touchEnd);

        // Mouse drag events
        sliderViewport.addEventListener('mousedown', dragStart);
        sliderViewport.addEventListener('mousemove', dragMove);
        sliderViewport.addEventListener('mouseup', dragEnd);
        sliderViewport.addEventListener('mouseleave', dragEnd);

        // Hover pause
        sliderViewport.addEventListener('mouseenter', () => stopAutoplay());
        sliderViewport.addEventListener('mouseleave', () => {
            if (isAutoplayActive) startAutoplay();
        });

        // Click on slide card: if active, open lightbox; if adjacent, slide into center
        sliderViewport.addEventListener('click', (e) => {
            const card = e.target.closest('.gallery-slide-card');
            if (!card) return;
            const clickedIndex = parseInt(card.getAttribute('data-index'), 10);

            if (clickedIndex === currentSlideIndex) {
                // Open Lightbox on active card click
                showLightboxIndex(clickedIndex);
            } else {
                // Slide clicked card to center
                goToSlide(clickedIndex);
                restartAutoplay();
            }
        });
    }

    function touchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoplay();
    }

    function touchMove(e) {
        if (!isDragging) return;
    }

    function touchEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diffX = endX - startX;

        if (Math.abs(diffX) > 40) {
            if (diffX < 0) {
                slideNext(); // Swiped left -> slide rightwards to next card
            } else {
                slidePrev(); // Swiped right -> slide leftwards to prev card
            }
        }
        if (isAutoplayActive) startAutoplay();
    }

    function dragStart(e) {
        startX = e.clientX;
        isDragging = true;
        if (sliderViewport) sliderViewport.classList.add('is-dragging');
        stopAutoplay();
    }

    function dragMove(e) {
        if (!isDragging) return;
    }

    function dragEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        if (sliderViewport) sliderViewport.classList.remove('is-dragging');
        const endX = e.clientX;
        const diffX = endX - startX;

        if (Math.abs(diffX) > 40) {
            if (diffX < 0) {
                slideNext();
            } else {
                slidePrev();
            }
        }
        if (isAutoplayActive) startAutoplay();
    }

    // Autoplay Timer (slides smoothly every 4.2 seconds)
    function startAutoplay() {
        stopAutoplay();
        if (!isAutoplayActive) return;
        autoplayTimer = setInterval(() => {
            slideNext();
        }, 4200);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        if (isAutoplayActive) {
            stopAutoplay();
            startAutoplay();
        }
    }

    if (autoplayToggle) {
        autoplayToggle.addEventListener('click', () => {
            isAutoplayActive = !isAutoplayActive;
            if (isAutoplayActive) {
                if (autoplayIcon) autoplayIcon.textContent = '⏸';
                if (autoplayText) autoplayText.textContent = 'Auto-Slide';
                startAutoplay();
            } else {
                if (autoplayIcon) autoplayIcon.textContent = '▶';
                if (autoplayText) autoplayText.textContent = 'Paused';
                stopAutoplay();
            }
        });
    }

    // Keyboard Arrow navigation for slider
    document.addEventListener('keydown', (e) => {
        // If lightbox is open, let lightbox handle arrows
        if (galleryLightbox && galleryLightbox.classList.contains('active')) return;

        const galleryEl = document.getElementById('gallery');
        if (!galleryEl) return;
        const rect = galleryEl.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInViewport) {
            if (e.key === 'ArrowLeft') {
                slidePrev();
                restartAutoplay();
            } else if (e.key === 'ArrowRight') {
                slideNext();
                restartAutoplay();
            }
        }
    });

    // Window resize handler: recalculate center offset smoothly
    let resizeTimeout = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateSliderPosition(false);
        }, 120);
    });

    // Lightbox Integration with slider photos
    function showLightboxIndex(index) {
        if (!galleryItems.length || !galleryLightbox || !lightboxImage) return;
        currentLightboxIndex = (index + galleryItems.length) % galleryItems.length;
        const item = galleryItems[currentLightboxIndex];

        lightboxImage.src = item.src;
        if (lightboxCaption) {
            lightboxCaption.textContent = item.fullCaption || item.caption || "";
        }
        galleryLightbox.classList.add("active");
        galleryLightbox.setAttribute("aria-hidden", "false");
        stopAutoplay();
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener("click", (e) => {
            e.stopPropagation();
            showLightboxIndex(currentLightboxIndex - 1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener("click", (e) => {
            e.stopPropagation();
            showLightboxIndex(currentLightboxIndex + 1);
        });
    }

    if (lightboxClose && galleryLightbox) {
        lightboxClose.addEventListener("click", () => {
            galleryLightbox.classList.remove("active");
            galleryLightbox.setAttribute("aria-hidden", "true");
            if (isAutoplayActive) startAutoplay();
        });

        galleryLightbox.addEventListener("click", (e) => {
            if (e.target === galleryLightbox) {
                galleryLightbox.classList.remove("active");
                galleryLightbox.setAttribute("aria-hidden", "true");
                if (isAutoplayActive) startAutoplay();
            }
        });
    }

    // Keyboard navigation for Lightbox
    document.addEventListener("keydown", (e) => {
        if (!galleryLightbox || !galleryLightbox.classList.contains("active")) return;
        if (e.key === "Escape") {
            galleryLightbox.classList.remove("active");
            galleryLightbox.setAttribute("aria-hidden", "true");
            if (isAutoplayActive) startAutoplay();
        } else if (e.key === "ArrowLeft") {
            showLightboxIndex(currentLightboxIndex - 1);
        } else if (e.key === "ArrowRight") {
            showLightboxIndex(currentLightboxIndex + 1);
        }
    });

    // Initialize Gallery Slider
    renderPublicGallery();
    startAutoplay();

    // Storage listeners for real-time updates from Admin Portal uploads & deletes
    window.addEventListener('storage', (e) => {
        if (e.key === 'som_chatterjee_gallery') {
            renderPublicGallery();
        }
    });

    window.addEventListener('som_gallery_updated', () => {
        renderPublicGallery();
    });

    // 5. Interactive Audio Player (Som Chatterjee - “Ei Shohor Akkhep”)
    const somAudioTrack = document.getElementById("somAudioTrack");
    const playerPlayBtn = document.getElementById("playerPlayBtn");
    const playIcon = document.getElementById("playIcon");
    const musicPlayerBar = document.getElementById("musicPlayerBar") || document.querySelector(".music-player-bar");
    const playerCurrentTime = document.getElementById("playerCurrentTime");
    const playerTotalTime = document.getElementById("playerTotalTime");
    const playerProgressContainer = document.getElementById("playerProgressContainer");
    const playerProgressFill = document.getElementById("playerProgressFill");
    const playerProgressHandle = document.getElementById("playerProgressHandle");

    function formatAudioTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "--:--";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function setPlayerPlayingUI(isPlaying) {
        if (playIcon) {
            playIcon.textContent = isPlaying ? "❚❚" : "▶";
        }
        if (playerPlayBtn) {
            playerPlayBtn.setAttribute("aria-label", isPlaying ? "Pause Som Chatterjee - Ei Shohor Akkhep" : "Play Som Chatterjee - Ei Shohor Akkhep");
            playerPlayBtn.setAttribute("title", isPlaying ? "Pause Song" : "Play Song");
        }
        if (musicPlayerBar) {
            if (isPlaying) {
                musicPlayerBar.classList.add("playing");
            } else {
                musicPlayerBar.classList.remove("playing");
            }
        }
    }

    function updateAudioDuration() {
        if (somAudioTrack && somAudioTrack.duration && !isNaN(somAudioTrack.duration) && isFinite(somAudioTrack.duration)) {
            if (playerTotalTime) {
                playerTotalTime.textContent = formatAudioTime(somAudioTrack.duration);
            }
        }
    }

    function updateAudioProgress() {
        if (!somAudioTrack) return;
        const current = somAudioTrack.currentTime || 0;
        const duration = somAudioTrack.duration;

        if (playerCurrentTime) {
            playerCurrentTime.textContent = formatAudioTime(current);
        }

        if (duration && !isNaN(duration) && duration > 0) {
            const pct = Math.min(100, Math.max(0, (current / duration) * 100));
            if (playerProgressFill) {
                playerProgressFill.style.width = `${pct}%`;
            }
            if (playerProgressHandle) {
                playerProgressHandle.style.left = `${pct}%`;
            }
        }
    }

    if (somAudioTrack && playerPlayBtn) {
        // Play / Pause Toggle
        playerPlayBtn.addEventListener("click", () => {
            if (somAudioTrack.paused || somAudioTrack.ended) {
                const playPromise = somAudioTrack.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        setPlayerPlayingUI(true);
                    }).catch(err => {
                        console.warn("Audio playback notice:", err);
                    });
                }
            } else {
                somAudioTrack.pause();
                setPlayerPlayingUI(false);
            }
        });

        // Audio events
        somAudioTrack.addEventListener("play", () => setPlayerPlayingUI(true));
        somAudioTrack.addEventListener("pause", () => setPlayerPlayingUI(false));
        somAudioTrack.addEventListener("ended", () => {
            setPlayerPlayingUI(false);
            somAudioTrack.currentTime = 0;
            updateAudioProgress();
        });

        somAudioTrack.addEventListener("loadedmetadata", updateAudioDuration);
        somAudioTrack.addEventListener("durationchange", updateAudioDuration);
        somAudioTrack.addEventListener("canplay", updateAudioDuration);
        somAudioTrack.addEventListener("timeupdate", updateAudioProgress);

        if (somAudioTrack.readyState >= 1) {
            updateAudioDuration();
        }

        // Progress bar scrubbing & seeking
        if (playerProgressContainer) {
            let isScrubbing = false;

            const seekToPosition = (e) => {
                if (!somAudioTrack.duration || isNaN(somAudioTrack.duration)) return;
                const rect = playerProgressContainer.getBoundingClientRect();
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clickX = clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                somAudioTrack.currentTime = ratio * somAudioTrack.duration;
                updateAudioProgress();
            };

            playerProgressContainer.addEventListener("click", seekToPosition);

            playerProgressContainer.addEventListener("mousedown", (e) => {
                isScrubbing = true;
                seekToPosition(e);
            });

            window.addEventListener("mousemove", (e) => {
                if (isScrubbing) {
                    seekToPosition(e);
                }
            });

            window.addEventListener("mouseup", () => {
                if (isScrubbing) isScrubbing = false;
            });

            playerProgressContainer.addEventListener("touchstart", (e) => {
                isScrubbing = true;
                seekToPosition(e);
            }, { passive: true });

            window.addEventListener("touchmove", (e) => {
                if (isScrubbing) {
                    seekToPosition(e);
                }
            }, { passive: true });

            window.addEventListener("touchend", () => {
                if (isScrubbing) isScrubbing = false;
            });
        }
    }

    // 6. Dynamic Tour Dates Renderer (Synced with Admin Management)
    function renderPublicTourDates() {
        const tourList = document.getElementById("tourList");
        if (!tourList) return;

        const tours = getTours();
        const activeTours = tours.filter(t => t.active !== false);

        if (activeTours.length === 0) {
            tourList.innerHTML = `
                <div style="text-align: center; padding: 45px 20px; color: var(--text-muted); background: rgba(29, 46, 58, 0.25); border: 1px dashed var(--border-color);">
                    <p style="font-size: 18px; margin-bottom: 8px; color: var(--text-white);">🎤 New Concert Dates & Festival Stops Coming Soon!</p>
                    <p style="font-size: 14px;">Som Chatterjee's upcoming live performance schedule is being finalized. In the meantime, you can send an event booking enquiry below.</p>
                </div>
            `;
            return;
        }

        tourList.innerHTML = activeTours.map(tour => {
            const isHot = tour.status === 'Upcoming Show' || tour.badgeType === 'badge-hot';
            return `
                <div class="tour-row" data-id="${tour.id}">
                    <div class="tour-date-col">
                        <span class="tour-date">${escapeHTML(tour.date)}</span>
                        <span class="tour-day">${escapeHTML(tour.dayTime)}</span>
                    </div>
                    <div class="tour-venue-col">
                        <h3 class="tour-venue">${escapeHTML(tour.venue)}</h3>
                        <span class="tour-city">${escapeHTML(tour.city)}</span>
                    </div>
                    <div class="tour-status-col">
                        <span class="badge ${isHot ? 'badge-hot' : ''}">${escapeHTML(tour.status)}</span>
                    </div>
                    <div class="tour-action-col">
                        <a href="${escapeHTML(tour.actionUrl || '#contact')}" class="btn btn-outline-sm">${escapeHTML(tour.actionText || 'Enquire Event')}</a>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Initial render of tour dates
    renderPublicTourDates();

    // Cross-tab live update listener (updates public site when admin edits dates)
    window.addEventListener('storage', (e) => {
        if (e.key === 'som_chatterjee_tours') {
            renderPublicTourDates();
        }
    });

    window.addEventListener('som_tours_updated', () => {
        renderPublicTourDates();
    });

    // 7. Booking Enquiry Form (Saves enquiry for Admin review)
    const bookingForm = document.getElementById("bookingForm");
    const formSuccessMsg = document.getElementById("formSuccessMsg");

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("clientName")?.value || "";
            const email = document.getElementById("clientEmail")?.value || "";
            const phone = document.getElementById("clientPhone")?.value || "";
            const eventType = document.getElementById("eventType")?.value || "Live Concert";
            const date = document.getElementById("eventDate")?.value || "";
            const message = document.getElementById("eventMessage")?.value || "";

            // Save enquiry into persistent storage for admin
            addEnquiry({
                name,
                email,
                phone,
                eventType,
                date,
                message
            });

            if (formSuccessMsg) {
                formSuccessMsg.innerHTML = `
                    ✓ Thank you, <strong>${escapeHTML(name || 'there')}</strong>! Your booking enquiry has been received directly by Som Chatterjee's management team. We will review your event details and contact you shortly.
                `;
                formSuccessMsg.style.display = "block";
                bookingForm.reset();
                setTimeout(() => {
                    formSuccessMsg.style.display = "none";
                }, 8000);
            }
        });
    }

    // 8. Newsletter Subscription Form (Saves subscribers for Admin)
    const newsletterForm = document.getElementById("newsletterForm");
    const newsletterSuccess = document.getElementById("newsletterSuccess");

    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletterEmail");
            const email = emailInput?.value || "";
            if (email) {
                addSubscriber(email);
            }
            if (newsletterSuccess) {
                newsletterSuccess.style.display = "block";
                newsletterForm.reset();
                setTimeout(() => {
                    newsletterSuccess.style.display = "none";
                }, 5000);
            }
        });
    }

    // 9. Admin Session Status Floater & Shortcut
    const publicAdminFloater = document.getElementById("publicAdminFloater");
    if (publicAdminFloater && checkAdminSession()) {
        publicAdminFloater.style.display = "inline-flex";
    }

    // Shortcut: Alt + A navigates to Admin Portal
    document.addEventListener("keydown", (e) => {
        if (e.altKey && (e.key === "a" || e.key === "A")) {
            window.location.href = "admin.html";
        }
    });

    // 8. Live Stage Flowing Stars & Dynamic Scroll Effect Engine
    const starCanvas = document.getElementById("liveStarCanvas");
    if (starCanvas) {
        const ctx = starCanvas.getContext("2d");
        let width = 0;
        let height = 0;
        let dpr = 1;
        let animationFrameId = null;

        // Spotlights elements for scroll parallax
        const spotlightMagenta = document.querySelector(".spotlight-magenta");
        const spotlightCyan = document.querySelector(".spotlight-cyan");
        const spotlightAmber = document.querySelector(".spotlight-amber");

        // Interactive mouse tracking
        const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false };

        window.addEventListener("mousemove", (e) => {
            mouse.targetX = e.clientX;
            mouse.targetY = e.clientY;
            mouse.active = true;
        });

        window.addEventListener("mouseleave", () => {
            mouse.active = false;
        });

        let lastTouchY = 0;
        let isTouching = false;

        window.addEventListener("touchstart", (e) => {
            if (e.touches && e.touches[0]) {
                lastTouchY = e.touches[0].clientY;
                isTouching = true;
                mouse.targetX = e.touches[0].clientX;
                mouse.targetY = e.touches[0].clientY;
                mouse.active = true;
            }
        }, { passive: true });

        window.addEventListener("touchmove", (e) => {
            if (e.touches && e.touches[0]) {
                const currentTouchY = e.touches[0].clientY;
                const touchDelta = lastTouchY - currentTouchY;
                targetScrollVelocity = touchDelta * 1.15;
                lastTouchY = currentTouchY;

                mouse.targetX = e.touches[0].clientX;
                mouse.targetY = e.touches[0].clientY;
                mouse.active = true;
            }
        }, { passive: true });

        window.addEventListener("touchend", () => {
            isTouching = false;
            setTimeout(() => {
                if (!isTouching) mouse.active = false;
            }, 600);
        });

        // Scroll Tracking & Scroll Velocity Physics
        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
        let currentScrollY = lastScrollY;
        let scrollVelocity = 0;
        let targetScrollVelocity = 0;

        window.addEventListener("scroll", () => {
            const newY = window.pageYOffset || document.documentElement.scrollTop;
            const deltaY = newY - lastScrollY;
            targetScrollVelocity = deltaY;
            lastScrollY = newY;
            currentScrollY = newY;

            // Trigger extra shooting stars on rapid scroll
            if (Math.abs(deltaY) > 28 && Math.random() < 0.25) {
                maybeCreateShootingStar(performance.now(), true);
            }
        }, { passive: true });

        // Particles arrays
        let stars = [];
        let motes = [];
        let shootingStars = [];

        let lastInitWidth = 0;
        let lastInitHeight = 0;

        function initCanvasSize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;
            lastInitWidth = width;
            lastInitHeight = height;

            starCanvas.width = width * dpr;
            starCanvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            createParticles();
        }

        function createParticles() {
            stars = [];
            motes = [];

            // 1. Multi-depth Flowing Stars (Dense on both desktop & mobile)
            const isMobile = width < 768;
            const starCount = isMobile
                ? Math.max(140, Math.floor((width * height) / 2800))
                : Math.floor(Math.min((width * height) / 4500, 260));

            const starColors = [
                "248, 250, 252", // Diamond White Haze
                "0, 210, 252",   // Electric Cyan
                "255, 0, 85",    // Vibrant Magenta
                "255, 185, 60"   // Concert Gold Amber
            ];

            for (let i = 0; i < starCount; i++) {
                // Layer depth: 0.25 (distant) to 1.35 (close foreground)
                const depth = Math.random() * 1.1 + 0.25;
                const isCross = Math.random() < 0.26 && depth > 0.55;
                const minRadius = isMobile ? 0.8 : 0.5;

                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    depth: depth,
                    radius: (Math.random() * 1.4 + minRadius) * Math.min(depth, 1.25),
                    baseAlpha: (Math.random() * 0.45 + (isMobile ? 0.35 : 0.25)) * Math.min(depth, 1.1),
                    twinkleAmp: Math.random() * 0.35 + 0.25,
                    twinkleSpeed: Math.random() * 0.003 + 0.0012,
                    phase: Math.random() * Math.PI * 2,
                    isCross: isCross,
                    sparkleSize: (Math.random() * 6 + 3.5) * depth,
                    // Natural upward flowing drift:
                    baseVy: -(Math.random() * 0.45 + (isMobile ? 0.22 : 0.18)) * depth,
                    baseVx: (Math.random() * 0.2 - 0.1) * depth,
                    waveSpeed: Math.random() * 0.001 + 0.0005,
                    waveAmp: (Math.random() * 0.35 + 0.1) * depth,
                    color: starColors[Math.floor(Math.random() * starColors.length)]
                });
            }

            // 2. Floating Stage Light Motes (Concert Haze Dust)
            const moteCount = Math.floor(Math.min((width * height) / 24000, 48));
            const moteColors = [
                "0, 210, 252",  // Electric Blue
                "255, 0, 85",   // Vibrant Magenta
                "255, 153, 0",  // Sunset Amber
                "241, 245, 249" // Soft White
            ];

            for (let i = 0; i < moteCount; i++) {
                const depth = Math.random() * 0.8 + 0.4;
                motes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    depth: depth,
                    radius: (Math.random() * 2.2 + 1.2) * depth,
                    color: moteColors[Math.floor(Math.random() * moteColors.length)],
                    alpha: Math.random() * 0.35 + 0.12,
                    vy: -(Math.random() * 0.4 + 0.15) * depth,
                    vxOffset: Math.random() * 100,
                    vxSpeed: Math.random() * 0.0012 + 0.0006,
                    vxAmp: Math.random() * 0.5 + 0.2
                });
            }
        }

        // Periodic & scroll-triggered shooting star
        let lastShootingStarTime = performance.now();
        function maybeCreateShootingStar(now, force = false) {
            if (force || now - lastShootingStarTime > 5500 + Math.random() * 5000) {
                lastShootingStarTime = now;
                const startX = Math.random() * width * 0.85;
                const startY = Math.random() * height * 0.4;
                const length = Math.random() * 140 + 90;
                const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15); // ~45 deg downward
                const speed = Math.random() * 7 + 7;
                const color = Math.random() > 0.5 ? "0, 210, 252" : (Math.random() > 0.5 ? "255, 0, 85" : "255, 185, 60");

                shootingStars.push({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    length: length,
                    color: color,
                    life: 1.0
                });
            }
        }

        function render(now) {
            animationFrameId = requestAnimationFrame(render);

            ctx.clearRect(0, 0, width, height);

            // Smooth scroll physics damping
            scrollVelocity += (targetScrollVelocity - scrollVelocity) * 0.14;
            targetScrollVelocity *= 0.86;

            // Parallax movement for stage spotlights based on scroll position
            if (spotlightMagenta || spotlightCyan || spotlightAmber) {
                const scrollFactor = currentScrollY * 0.16;
                if (spotlightMagenta) {
                    spotlightMagenta.style.transform = `translate3d(0, ${-scrollFactor * 0.4}px, 0)`;
                }
                if (spotlightCyan) {
                    spotlightCyan.style.transform = `translate3d(0, ${-scrollFactor * 0.65}px, 0)`;
                }
                if (spotlightAmber) {
                    spotlightAmber.style.transform = `translate3d(0, ${-scrollFactor * 0.3}px, 0)`;
                }
            }

            // Smooth mouse interpolation & Cursor Glow
            if (mouse.active) {
                mouse.x += (mouse.targetX - mouse.x) * 0.08;
                mouse.y += (mouse.targetY - mouse.y) * 0.08;

                const cursorGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
                cursorGlow.addColorStop(0, "rgba(0, 210, 252, 0.09)");
                cursorGlow.addColorStop(0.5, "rgba(255, 0, 85, 0.05)");
                cursorGlow.addColorStop(1, "transparent");
                ctx.fillStyle = cursorGlow;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
                ctx.fill();
            }

            const absScroll = Math.abs(scrollVelocity);

            // 1. Render Flowing Stars with Scroll Effect
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];

                // Natural upward flowing motion + dynamic scroll displacement
                const scrollShift = scrollVelocity * s.depth * 0.44;
                s.y += (s.baseVy * s.depth) - scrollShift;
                s.x += s.baseVx + Math.sin(now * s.waveSpeed + s.phase) * s.waveAmp;

                // Infinite seamless wrapping
                if (s.y < -30) {
                    s.y = height + 25;
                    s.x = Math.random() * width;
                } else if (s.y > height + 30) {
                    s.y = -25;
                    s.x = Math.random() * width;
                }

                if (s.x < -30) {
                    s.x = width + 25;
                } else if (s.x > width + 30) {
                    s.x = -25;
                }

                // Twinkle oscillation
                const currentAlpha = Math.max(0.12, Math.min(1.0, s.baseAlpha + Math.sin(now * s.twinkleSpeed + s.phase) * s.twinkleAmp));

                // Proximity boost if cursor is near
                let boost = 0;
                if (mouse.active) {
                    const dx = s.x - mouse.x;
                    const dy = s.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 180) {
                        boost = (1 - dist / 180) * 0.45;
                    }
                }

                const finalAlpha = Math.min(1.0, currentAlpha + boost);

                // Dynamic speed streaks on active scroll
                if (absScroll > 1.4) {
                    const trailLength = Math.max(-28, Math.min(28, -scrollVelocity * s.depth * 1.5));
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(s.x, s.y + trailLength);
                    ctx.strokeStyle = `rgba(${s.color}, ${finalAlpha * 0.55})`;
                    ctx.lineWidth = Math.max(0.8, s.radius * 0.85);
                    ctx.stroke();
                }

                // Star core dot
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${s.color}, ${finalAlpha})`;
                ctx.shadowColor = `rgba(${s.color}, ${finalAlpha * 0.85})`;
                ctx.shadowBlur = s.radius * 4;
                ctx.fill();

                // Cross sparkle flare for special radiant stars
                if (s.isCross && finalAlpha > 0.52) {
                    const flare = s.sparkleSize * (finalAlpha * 0.95);
                    ctx.strokeStyle = `rgba(${s.color}, ${finalAlpha * 0.75})`;
                    ctx.lineWidth = 0.75;
                    ctx.beginPath();
                    ctx.moveTo(s.x - flare, s.y);
                    ctx.lineTo(s.x + flare, s.y);
                    ctx.moveTo(s.x, s.y - flare);
                    ctx.lineTo(s.x, s.y + flare);
                    ctx.stroke();
                }
            }
            ctx.shadowBlur = 0;

            // 2. Render Floating Stage Motes with Scroll Parallax
            for (let i = 0; i < motes.length; i++) {
                const m = motes[i];
                m.y += m.vy - (scrollVelocity * m.depth * 0.32);
                m.x += Math.sin(now * m.vxSpeed + m.vxOffset) * m.vxAmp;

                // Wrap around edges
                if (m.y < -15) m.y = height + 15;
                else if (m.y > height + 15) m.y = -15;

                if (m.x < -15) m.x = width + 15;
                else if (m.x > width + 15) m.x = -15;

                ctx.beginPath();
                ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${m.color}, ${m.alpha})`;
                ctx.shadowColor = `rgba(${m.color}, 0.65)`;
                ctx.shadowBlur = m.radius * 5;
                ctx.fill();
            }
            ctx.shadowBlur = 0;

            // 3. Render Shooting Stars
            maybeCreateShootingStar(now);

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const st = shootingStars[i];
                st.x += st.vx;
                st.y += st.vy - (scrollVelocity * 0.4);
                st.life -= 0.022;

                if (st.life <= 0 || st.x > width || st.y > height) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                const tailX = st.x - (st.vx * 7);
                const tailY = st.y - (st.vy * 7);

                const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
                grad.addColorStop(0, `rgba(${st.color}, ${st.life * 0.95})`);
                grad.addColorStop(1, "transparent");

                ctx.strokeStyle = grad;
                ctx.lineWidth = 2.0;
                ctx.beginPath();
                ctx.moveTo(st.x, st.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();

                // Spark head
                ctx.fillStyle = `rgba(255, 255, 255, ${st.life})`;
                ctx.beginPath();
                ctx.arc(st.x, st.y, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize and handle resize
        initCanvasSize();

        // Mobile-resilient resize listener (avoids address-bar scroll jumping)
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newWidth = window.innerWidth;
                const newHeight = window.innerHeight;
                const widthChanged = Math.abs(newWidth - lastInitWidth) > 35;
                const heightChangedSignificantly = Math.abs(newHeight - lastInitHeight) > 160;

                if (widthChanged || heightChangedSignificantly) {
                    initCanvasSize();
                } else {
                    // Update canvas dimensions without resetting particle positions on mobile scroll
                    dpr = Math.min(window.devicePixelRatio || 1, 2);
                    width = newWidth;
                    height = newHeight;
                    starCanvas.width = width * dpr;
                    starCanvas.height = height * dpr;
                    ctx.scale(dpr, dpr);
                }
            }, 120);
        });

        // Pause when tab not visible to preserve battery & CPU
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                cancelAnimationFrame(animationFrameId);
            } else {
                animationFrameId = requestAnimationFrame(render);
            }
        });

        animationFrameId = requestAnimationFrame(render);
    }
});
