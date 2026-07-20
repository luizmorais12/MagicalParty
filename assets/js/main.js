// 15 Anos Márcia Gorete — A Bela e a Fera
// Client-Side Main Application Entrypoint

import { initLoadingScreen } from './components/loading.js';
import { initCustomCursor } from './components/cursor.js';
import { initCountdown } from './components/countdown.js';
import { initGallery } from './components/gallery.js';
import { initGiftsSystem } from './components/gifts.js';
import { initRSVPSystem } from './components/rsvp.js';
import { initMessageBoard } from './components/messages.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Loading screen (envelope seal click + asset check)
    initLoadingScreen();

    // 2. Initialize Custom cursor (Gold particle tail canvas)
    initCustomCursor();

    // 3. Initialize Countdown Timer
    initCountdown();

    // 4. Initialize Photo Gallery Grid & Lightbox
    initGallery();

    // 5. Initialize Gifts System & virtual PIX
    initGiftsSystem();

    // 6. Initialize RSVP submission
    initRSVPSystem();

    // 7. Initialize Message guestbook mural
    initMessageBoard();

    // 8. Initialize AOS library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true
        });
    }

    // 9. Navbar scroll event listener for glassmorphism classes
    initNavbarScroll();

    // 10. Automatically collapse mobile menu on link click
    initMobileNavbarCollapse();
});

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar-custom');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
}

function initMobileNavbarCollapse() {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const navbarCollapse = document.getElementById("navbarContent");
    
    if (navbarCollapse) {
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                if (window.innerWidth < 992) {
                    const toggler = document.querySelector(".navbar-toggler");
                    if (toggler && !toggler.classList.contains("collapsed")) {
                        toggler.click();
                    }
                }
            });
        });
    }
}
