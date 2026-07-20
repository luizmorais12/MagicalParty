// 15 Anos Márcia Gorete — A Bela e a Fera
// Real-time Countdown and Dynamic Theme Adapters

import { dbService } from '../services/db.js';

export async function initCountdown() {
    const settings = await dbService.getSettings();
    const targetDateStr = settings.date || "2026-10-03T20:00:00";
    const targetTime = new Date(targetDateStr).getTime();

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const clockTimer = document.getElementById('countdown-timer');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
            if (clockTimer) {
                clockTimer.innerHTML = `
                    <div class="col-12 py-3 text-center">
                        <h3 class="gold-text animate-pulse" style="font-size: 2.2rem;">
                            🏰 O Baile Real Começou! 🌹
                        </h3>
                    </div>
                `;
            }
            clearInterval(interval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');

        // Apply theme level classes based on remaining days
        applyDynamicThemeLevels(days);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
}

// Applies incremental design elements to the page based on closeness to the event
function applyDynamicThemeLevels(daysLeft) {
    const bodyClass = document.body.classList;

    // Faltam 30 dias: Acender mais velas
    if (daysLeft <= 30 && !bodyClass.contains('theme-candles-active')) {
        bodyClass.add('theme-candles-active');
        console.log("Countdown Magic: Velas extras acesas no castelo.");
    }

    // Faltam 15 dias: Mais partículas
    if (daysLeft <= 15 && !bodyClass.contains('theme-particles-intense')) {
        bodyClass.add('theme-particles-intense');
        // Re-initialize particles with more intensity if particles.js is loaded
        if (typeof particlesJS !== 'undefined') {
            updateParticlesDensity(100); // Incremented from default 50
        }
    }

    // Faltam 7 dias: Rosas florescendo
    if (daysLeft <= 7 && !bodyClass.contains('theme-roses-bloomed')) {
        bodyClass.add('theme-roses-bloomed');
        console.log("Countdown Magic: Rosas desabrochando pelas passagens.");
    }

    // Faltam 3 dias: Luzes mais intensas
    if (daysLeft <= 3 && !bodyClass.contains('theme-glow-intense')) {
        bodyClass.add('theme-glow-intense');
    }

    // Faltam 1 dia: Fogos de artifício discretos
    if (daysLeft <= 1 && !bodyClass.contains('theme-fireworks-ready')) {
        bodyClass.add('theme-fireworks-ready');
        startSubtleFireworks();
    }
}

// Adjusts the active particles.js count
function updateParticlesDensity(count) {
    try {
        if (window.pJSDom && window.pJSDom[0]) {
            window.pJSDom[0].pJS.particles.number.value = count;
            window.pJSDom[0].pJS.fn.particlesRefresh();
        }
    } catch (e) {
        console.warn("Failed to refresh particles density:", e);
    }
}

// Periodically launches light gold confetti to simulate small distant fireworks
let fireworksInterval = null;
function startSubtleFireworks() {
    if (fireworksInterval) return;

    fireworksInterval = setInterval(() => {
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 20,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#d4af37', '#f3e5ab']
            });
            confetti({
                particleCount: 20,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#d4af37', '#f3e5ab']
            });
        }
    }, 8000); // Subtle, every 8 seconds
}
