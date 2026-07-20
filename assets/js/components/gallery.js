// 15 Anos Márcia Gorete — A Bela e a Fera
// Album Gallery, Masonry Grid, Lightbox & Filters Controller

import { dbService } from '../services/db.js';

let galleryData = [];
let activeFilter = 'Todos';

export async function initGallery() {
    const galleryGrid = document.getElementById('photo-gallery');
    const filterContainer = document.getElementById('gallery-filters');
    if (!galleryGrid) return;

    // 1. Fetch images from Database
    galleryData = await dbService.getGallery();

    // 2. Render Categories filter buttons
    renderFilters(filterContainer);

    // 3. Render gallery items
    renderGalleryItems(galleryGrid);

    // 4. Initialize Custom Lightbox controls
    initLightbox();

    // 5. Initialize Guest Photo Upload Handler
    initGuestPhotoUpload();
}

function renderFilters(container) {
    if (!container) return;

    // Dynamically extract distinct categories
    const categories = ['Todos', ...new Set(galleryData.map(item => item.category))];
    
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        const isActive = cat === activeFilter;
        btn.className = `gallery-filter-btn ${isActive ? 'active' : ''}`;
        btn.textContent = cat;
        btn.setAttribute('data-category', cat);
        
        btn.addEventListener('click', () => {
            // Update active state
            activeFilter = cat;
            document.querySelectorAll('#gallery-filters button').forEach(b => {
                b.className = 'gallery-filter-btn';
            });
            btn.className = 'gallery-filter-btn active';

            // Filter items in grid
            filterGrid();
        });

        container.appendChild(btn);
    });
}

function renderGalleryItems(grid) {
    grid.innerHTML = '';
    
    galleryData.forEach(item => {
        const itemHtml = `
            <div class="gallery-item" data-category="${item.category}" data-caption="${item.caption}">
                <div style="overflow: hidden; width: 100%;">
                    <img src="${item.url}" alt="${item.caption}" loading="lazy">
                </div>
                <div class="gallery-card-body" style="padding: 12px 15px; background: rgba(10, 10, 15, 0.95); border-top: 1px solid rgba(212, 175, 55, 0.35);">
                    <p class="gallery-card-text" style="color: #ffd700; font-family: var(--font-serif); font-style: italic; font-weight: 700; font-size: 0.95rem; margin-bottom: 0; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.9);">${escapeHtml(item.caption)}</p>
                </div>
                <div class="gallery-overlay">
                    <span class="gallery-overlay-text"><i class="fas fa-search-plus"></i> Ampliar</span>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', itemHtml);
    });

    // Helper to escape HTML safely
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Animate item entrance with GSAP
    gsap.from(".gallery-item", {
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out"
    });
}

function filterGrid() {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (activeFilter === 'Todos' || cat === activeFilter) {
            // Reveal matching
            item.style.display = 'block';
            gsap.to(item, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
        } else {
            // Hide non-matching
            gsap.to(item, { 
                scale: 0.85, 
                opacity: 0, 
                duration: 0.3, 
                ease: "power2.in", 
                onComplete: () => { item.style.display = 'none'; } 
            });
        }
    });
}

// Custom Lightbox Implementation
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    
    if (!lightbox || !lightboxImg) return;

    let visibleItems = [];
    let currentIndex = 0;

    // Attach click events to document instead of static list, to handle filters changes dynamically
    document.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;

        // Get currently visible items based on filters
        visibleItems = Array.from(document.querySelectorAll('.gallery-item')).filter(
            el => el.style.display !== 'none'
        );
        
        currentIndex = visibleItems.indexOf(item);
        showImage();
    });

    function showImage() {
        const item = visibleItems[currentIndex];
        if (!item) return;

        const img = item.querySelector('img');
        const caption = item.getAttribute('data-caption');

        lightboxImg.src = img.src;
        lightboxCaption.textContent = caption || '';
        
        // Show overlay with zoom-in transition
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Lock scrolling
        
        gsap.fromTo(lightboxImg, 
            { scale: 0.8, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
        );
    }

    function closeLightbox() {
        gsap.to(lightboxImg, {
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto'; // Unlock scroll
            }
        });
    }

    function nextImage() {
        if (visibleItems.length <= 1) return;
        currentIndex = (currentIndex + 1) % visibleItems.length;
        showImage();
    }

    function prevImage() {
        if (visibleItems.length <= 1) return;
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        showImage();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', nextImage);
    if (prevBtn) prevBtn.addEventListener('click', prevImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });

    // Close on overlay clicking
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
            closeLightbox();
        }
    });
}

function initGuestPhotoUpload() {
    const uploadForm = document.getElementById('upload-guest-photo-form');
    const fileInput = document.getElementById('upload-photo-file');
    const previewContainer = document.getElementById('photo-preview-container');
    const previewImg = document.getElementById('upload-photo-preview');

    if (!uploadForm || !fileInput) return;

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (file) {
            const compressedUrl = await compressImage(file, 800, 0.7);
            if (previewImg && previewContainer) {
                previewImg.src = compressedUrl;
                previewContainer.classList.remove('d-none');
            }
        }
    });

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const author = document.getElementById('upload-author-name').value.trim();
        const captionInput = document.getElementById('upload-photo-caption').value.trim();
        const caption = captionInput !== '' ? `${captionInput} (${author})` : `Foto por ${author}`;
        const file = fileInput.files[0];

        if (!file) return;

        const compressedUrl = await compressImage(file, 800, 0.7);

        const newGalleryItem = {
            id: 'gal-guest-' + Date.now(),
            url: compressedUrl,
            caption: caption,
            category: 'Convidados',
            order_index: Date.now()
        };

        const success = await dbService.addGalleryItem(newGalleryItem);

        if (success) {
            // Hide modal
            const modalEl = document.getElementById('uploadPhotoModal');
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            if (bsModal) bsModal.hide();

            uploadForm.reset();
            if (previewContainer) previewContainer.classList.add('d-none');

            // Refresh gallery Data
            galleryData = await dbService.getGallery();
            activeFilter = 'Convidados';

            const galleryGrid = document.getElementById('photo-gallery');
            const filterContainer = document.getElementById('gallery-filters');
            renderFilters(filterContainer);
            renderGalleryItems(galleryGrid);

            // Confetti
            if (typeof confetti !== 'undefined') {
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
            }
            alert(`Sua foto foi enviada para o álbum de Márcia Gorete! ✨`);
        }
    });
}

function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
