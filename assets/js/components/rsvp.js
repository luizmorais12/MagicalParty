// 15 Anos Márcia Gorete — A Bela e a Fera
// RSVP Form Validation, Database submissions & Success Animations

import { dbService } from '../services/db.js';

export function initRSVPSystem() {
    const form = document.getElementById('rsvp-form');
    const countSelect = document.getElementById('rsvp-count');
    const guestsContainer = document.getElementById('rsvp-guests-container');
    const rsvpOverlay = document.getElementById('rsvp-rose-overlay');
    const closeOverlayBtn = document.getElementById('close-rose-overlay-btn');

    if (!form) return;

    // 1. Reveal companion names input block when count > 1
    countSelect.addEventListener('change', () => {
        const count = parseInt(countSelect.value);
        if (count > 1) {
            guestsContainer.classList.remove('d-none');
            document.getElementById('rsvp-guests').required = true;
        } else {
            guestsContainer.classList.add('d-none');
            document.getElementById('rsvp-guests').required = false;
        }
    });

    // 2. RSVP Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('rsvp-name').value.trim();
        const phone = document.getElementById('rsvp-phone').value.trim();
        const email = document.getElementById('rsvp-email').value.trim();
        const count = parseInt(countSelect.value);
        const guestNames = document.getElementById('rsvp-guests').value.trim();
        const adults = parseInt(document.getElementById('rsvp-adults').value) || 1;
        const kids = parseInt(document.getElementById('rsvp-kids').value) || 0;
        const message = document.getElementById('rsvp-message').value.trim();
        const obs = document.getElementById('rsvp-obs').value.trim();

        // Integrity validation
        if ((adults + kids) !== count) {
            alert('A soma de Adultos e Crianças deve ser exatamente igual à quantidade total de convidados confirmada!');
            return;
        }

        const guestPayload = {
            name,
            phone,
            email,
            guests_count: count,
            guest_names: count > 1 ? guestNames : '',
            adults_count: adults,
            kids_count: kids,
            message,
            obs
        };

        // Submit to database service layer
        const success = await dbService.addGuest(guestPayload);

        if (success) {
            // Also submit message to guestbook if message text is present
            if (message !== '') {
                await dbService.addMessage(name, message);
            }

            // Sync public scoreboard counters
            updatePublicAttendanceCounters();

            // Set WhatsApp confirmation message
            const waBtn = document.getElementById('rsvp-whatsapp-share-btn');
            if (waBtn) {
                const waMsg = encodeURIComponent(`Olá! Confirmando presença no Baile de 15 Anos de Márcia Gorete! ✨\n\nConvidado: ${name}\nTotal de Pessoas: ${count} (${adults} Adulto(s), ${kids} Criança(s))\nData: 03/10/2026 às 20:00`);
                waBtn.href = `https://api.whatsapp.com/send?text=${waMsg}`;
            }

            // Trigger success overlay (Rose Bloom screen)
            if (rsvpOverlay) {
                rsvpOverlay.style.display = 'flex';
                // Trigger canvas confetti bursts
                triggerRSVPConfetti();
            }
        } else {
            alert("Ocorreu uma falha ao selar sua presença. Por favor, tente novamente.");
        }
    });

    if (closeOverlayBtn) {
        closeOverlayBtn.addEventListener('click', () => {
            if (rsvpOverlay) rsvpOverlay.style.display = 'none';
            form.reset();
            if (guestsContainer) guestsContainer.classList.add('d-none');
        });
    }

    // Initialize public counters right away on load
    updatePublicAttendanceCounters();
}

async function updatePublicAttendanceCounters() {
    const guests = await dbService.getGuests();
    
    let total = 0;
    let adults = 0;
    let kids = 0;

    guests.forEach(g => {
        total += parseInt(g.guests_count || 0);
        adults += parseInt(g.adults_count || 0);
        kids += parseInt(g.kids_count || 0);
    });

    const totalEl = document.getElementById('total-confirmed');
    const adultsEl = document.getElementById('adults-confirmed');
    const kidsEl = document.getElementById('kids-confirmed');

    if (totalEl) totalEl.textContent = total;
    if (adultsEl) adultsEl.textContent = adults;
    if (kidsEl) kidsEl.textContent = kids;
}

function triggerRSVPConfetti() {
    if (typeof confetti === 'undefined') return;

    // Burst 1 (left side)
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#e31837', '#d4af37', '#ffffff']
    });

    // Burst 2 (right side)
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#e31837', '#d4af37', '#ffffff']
    });

    // Central splash delayed
    setTimeout(() => {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#d4af37', '#e31837']
        });
    }, 1500);
}
