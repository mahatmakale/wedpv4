// ==========================================
// Entry Animation: Dismiss loader on page load
// ==========================================
window.addEventListener("load", () => {
    setTimeout(() => {
        const loader = document.querySelector(".loader");
        if (loader) {
            loader.classList.add("hide");
            setTimeout(() => loader.remove(), 800);
        }
    }, 1800);
});

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // Intersection Observer for Scroll Animations
    // ==========================================
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated in
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));

    // ==========================================
    // Enhanced Scroll Animation System (.animate)
    // ==========================================
    const animateObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            } else {
                entry.target.classList.remove('show'); // Replay on scroll back
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.15 });

    const animateElements = document.querySelectorAll('.animate, .animate-left, .animate-right, .animate-scale, .story-thread');
    animateElements.forEach(el => animateObserver.observe(el));

    // ==========================================
    // Map Section Zoom-In Entry (NO parallax)
    // ==========================================
    const locationSection = document.querySelector('.location-section');
    if (locationSection) {
        const zoomObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view'); // replay on scroll back
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.25 });
        zoomObserver.observe(locationSection);
    }

    // ==========================================
    // Global Parallax System (.parallax-bg & hero)
    // ==========================================
    const parallaxSections = [
        document.querySelector('.hero-bg'),
        document.querySelector('.couple-section'),
        document.querySelector('.story'),
        document.querySelector('.events'),
        document.querySelector('.video-section')
    ];
    
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        
        parallaxSections.forEach(section => {
            if (!section) return;
            
            const rect = section.getBoundingClientRect();
            // Only animate if section is near/in viewport
            if (rect.top <= vh && rect.bottom >= 0) {
                // Calculate section's center relative to viewport center.
                // When section center == viewport center, offset == 0 (perfectly aligned).
                // As you scroll past, offset shifts slightly up/down for depth effect.
                const sectionMid = rect.top + rect.height / 2;
                const viewportMid = vh / 2;
                const yPos = (sectionMid - viewportMid) * 0.15;
                
                // Hero-bg uses transform, the others use background-position
                if (section.classList.contains('hero-bg')) {
                    section.style.transform = `scale(1.05) translateY(${yPos}px)`;
                } else {
                    // Use "center" baseline + subtle offset — image is always properly centered
                    section.style.backgroundPosition = `center calc(50% + ${yPos}px)`;
                }
            }
        });
        
        // Handle standalone parallax background layers (like gallery-bg)
        document.querySelectorAll('.parallax-bg').forEach(bg => {
            const parent = bg.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            if (rect.top <= vh && rect.bottom >= 0) {
                const yOffset = (vh - rect.top) * 0.3;
                bg.style.transform = `translateY(${yOffset}px)`;
            }
        });
    }, { passive: true });

    // ==========================================
    // Clean Horizontal Gallery Slider
    // ==========================================
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        let isInteracting = false;
        let autoScrollSpeed = 0.5; // Smooth, gentle speed
        let scrollTimeout;

        // Track current state per item to avoid resetting classes every frame
        const itemStates = new Map();

        const updateCurveEffect = () => {
            const items = galleryGrid.querySelectorAll('.gallery-item');
            const gridCenter = galleryGrid.getBoundingClientRect().left + (galleryGrid.clientWidth / 2);
            
            items.forEach(item => {
                const itemCenter = item.getBoundingClientRect().left + (item.clientWidth / 2);
                const absDistance = Math.abs(itemCenter - gridCenter);

                // 3 zones: center → side → far
                const centerZone = 100;  // within 100px of center
                const sideZone = 300;    // within 300px of center

                let newState;
                if (absDistance < centerZone) {
                    newState = 'center';
                } else if (absDistance < sideZone) {
                    newState = 'side';
                } else {
                    newState = 'far';
                }

                // ONLY update if state actually changed — prevents transition re-triggering
                const currentState = itemStates.get(item);
                if (currentState !== newState) {
                    item.classList.remove('center', 'side', 'far');
                    item.classList.add(newState);
                    itemStates.set(item, newState);
                }
            });
        };

        const playScroll = () => {
            if (!isInteracting) {
                galleryGrid.scrollLeft += autoScrollSpeed;
            }
            
            const gap = 16;
            
            // Forward infinite loop
            if (galleryGrid.firstElementChild) {
                while (galleryGrid.scrollLeft >= galleryGrid.firstElementChild.offsetWidth + gap) {
                    galleryGrid.scrollLeft -= (galleryGrid.firstElementChild.offsetWidth + gap);
                    galleryGrid.appendChild(galleryGrid.firstElementChild);
                }
                // Backward infinite loop
                while (galleryGrid.scrollLeft <= 0) {
                    galleryGrid.prepend(galleryGrid.lastElementChild);
                    galleryGrid.scrollLeft += (galleryGrid.firstElementChild.offsetWidth + gap);
                }
            }

            updateCurveEffect();
            requestAnimationFrame(playScroll);
        };

        const pauseAutoScroll = () => {
            isInteracting = true;
            clearTimeout(scrollTimeout);
        };

        const resumeAutoScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isInteracting = false;
            }, 1500);
        };

        // Desktop Drag
        let isDown = false;
        let startX;
        let scrollLeft;

        galleryGrid.addEventListener('mousedown', (e) => {
            isDown = true;
            pauseAutoScroll();
            startX = e.pageX - galleryGrid.offsetLeft;
            scrollLeft = galleryGrid.scrollLeft;
        });
        
        galleryGrid.addEventListener('mouseleave', () => {
            isDown = false;
            resumeAutoScroll();
        });
        
        galleryGrid.addEventListener('mouseup', () => {
            isDown = false;
            resumeAutoScroll();
        });
        
        galleryGrid.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - galleryGrid.offsetLeft;
            const walk = (x - startX) * 1.5;
            galleryGrid.scrollLeft = scrollLeft - walk;
        });

        // Touch & Scroll pausing
        galleryGrid.addEventListener('touchstart', pauseAutoScroll, {passive: true});
        galleryGrid.addEventListener('touchend', resumeAutoScroll, {passive: true});
        
        galleryGrid.addEventListener('wheel', () => {
            pauseAutoScroll();
            resumeAutoScroll();
        }, {passive: true});
        
        // Start animation
        playScroll();
    }

    // ==========================================
    // Lightbox Functionality
    // ==========================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    const closeBtn = document.querySelector('.close');

    let currentLightboxIndex = 0;

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Re-calculate index based on data-index in case DOM order was changed by infinite loop
            currentLightboxIndex = parseInt(item.getAttribute('data-index')) || index;
            showImage();
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        });
    });

    function showImage() {
        // Find the image by its original data-index to handle infinite loop reordering
        const targetItem = document.querySelector(`.gallery-item[data-index="${currentLightboxIndex}"]`);
        if (targetItem) {
            const img = targetItem.querySelector('img');
            if (img) lightboxImg.src = img.src;
        }
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
            showImage();
        };
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
            showImage();
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        };
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display !== 'flex') return;
        if (e.key === 'Escape') closeBtn.onclick();
        if (e.key === 'ArrowRight') nextBtn.onclick();
        if (e.key === 'ArrowLeft') prevBtn.onclick();
    });

    // Mobile Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            nextBtn.onclick(); // Swipe left
        }
        if (touchEndX > touchStartX + threshold) {
            prevBtn.onclick(); // Swipe right
        }
    };
    // ==========================================
    // Video Audio Handling
    // ==========================================
    const enterBtn = document.querySelector('.scroll-indicator');
    const videoIframe = document.getElementById('wedding-video');

    if (enterBtn && videoIframe) {
        enterBtn.addEventListener('click', () => {
            // Browsers block autoplay with sound unless there is a user interaction.
            // By clicking 'Enter', the user provides that interaction, allowing us to unmute.
            videoIframe.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            videoIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        });
    }
});
