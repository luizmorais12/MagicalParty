// 15 Anos Márcia Gorete — A Princesa e o Sapo
// RSVP Form Validation, Database submissions & Success Animations

import { dbService } from '../services/db.js';

let realtimeChannel = null;
let pollInterval = null;

export function initRSVPSystem() {
    const form = document.getElementById('rsvp-form');
    const countSelect = document.getElementById('rsvp-count');
    const guestsContainer = document.getElementById('rsvp-guests-container');
    const rsvpOverlay = document.getElementById('rsvp-lotus-overlay');
    const closeOverlayBtn = document.getElementById('close-lotus-overlay-btn');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

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

        // Loading state on button
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Selando Presença Real...';
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

        try {
            // Submit to database service layer
            const success = await dbService.addGuest(guestPayload);

            if (success) {
                // Also submit message to guestbook if message text is present
                if (message !== '') {
                    await dbService.addMessage(name, message);
                }

                // Sync public scoreboard counters immediately
                await updatePublicAttendanceCounters();

                // Set WhatsApp confirmation message
                const waBtn = document.getElementById('rsvp-whatsapp-share-btn');
                if (waBtn) {
                    const waMsg = encodeURIComponent(`Olá! Confirmando presença no Baile de 15 Anos de Márcia Gorete! ✨\n\nConvidado: ${name}\nTotal de Pessoas: ${count} (${adults} Adulto(s), ${kids} Criança(s))\nData: 03/10/2026 às 20:00`);
                    waBtn.href = `https://api.whatsapp.com/send?text=${waMsg}`;
                }

                // Trigger success overlay (Rose Bloom screen)
                if (rsvpOverlay) {
                    rsvpOverlay.style.display = 'flex';
                    triggerRSVPConfetti();
                }
            } else {
                const lastErr = dbService.lastError;
                if (lastErr && (lastErr.code === '42501' || lastErr.message?.includes('policy') || lastErr.message?.includes('security'))) {
                    alert("Atenção: O banco de dados do evento precisa de atualização de permissões (RLS). Por favor, avise o cerimonial/anfitrião para executar o script de permissões no Supabase!");
                } else {
                    alert("Ocorreu uma falha ao selar sua presença. Por favor, verifique sua conexão e tente novamente.");
                }
            }
        } catch (error) {
            console.error("Erro no envio do RSVP:", error);
            alert("Ocorreu um erro inesperado. Por favor, tente novamente.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
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

    // Setup Supabase Realtime channel for live counter updates
    if (!realtimeChannel) {
        realtimeChannel = dbService.subscribeToGuests(() => {
            updatePublicAttendanceCounters();
        });
    }

    // Background polling every 25 seconds as backup
    if (!pollInterval) {
        pollInterval = setInterval(() => {
            updatePublicAttendanceCounters();
        }, 25000);
    }
}

export async function updatePublicAttendanceCounters() {
    try {
        const guests = await dbService.getGuests();
        
        let total = 0;
        let adults = 0;
        let kids = 0;

        if (Array.isArray(guests)) {
            guests.forEach(g => {
                total += parseInt(g.guests_count || 0);
                adults += parseInt(g.adults_count || 0);
                kids += parseInt(g.kids_count || 0);
            });
        }

        const totalEl = document.getElementById('total-confirmed');
        const adultsEl = document.getElementById('adults-confirmed');
        const kidsEl = document.getElementById('kids-confirmed');

        if (totalEl) totalEl.textContent = total;
        if (adultsEl) adultsEl.textContent = adults;
        if (kidsEl) kidsEl.textContent = kids;
    } catch (e) {
        console.warn("Erro ao atualizar contadores públicos:", e);
    }
}

function triggerRSVPConfetti() {
    if (typeof confetti === 'undefined') return;

    // Burst 1 (left side)
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#22c55e', '#d4af37', '#86198f']
    });

    // Burst 2 (right side)
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#22c55e', '#d4af37', '#86198f']
    });

    // Central splash delayed
    setTimeout(() => {
        confetti({
            particleCount: 120,
            spread: 90,
            origin: { x: 0.5, y: 0.6 },
            colors: ['#d4af37', '#22c55e']
        });
    }, 1500);
}
