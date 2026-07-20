// 15 Anos Márcia Gorete — A Bela e a Fera
// Physical Gift Reservations & Virtual PIX Cotas Controller

import { dbService } from '../services/db.js';

export async function initGiftsSystem() {
    const giftListGrid = document.getElementById('gift-list-grid');
    const pixGrid = document.querySelector('.virtual-pix-grid');
    const reserveForm = document.getElementById('reserve-gift-form');
    
    if (giftListGrid) {
        // 1. Load and Render Physical Gifts
        await renderGifts(giftListGrid);

        // 2. Set up event listener for gift reservation click
        giftListGrid.addEventListener('click', handleGiftReservation);
    }

    if (reserveForm) {
        // 3. Set up event listener for reserve modal form submit
        reserveForm.addEventListener('submit', handleReserveFormSubmit);
    }

    if (pixGrid) {
        // 4. Set up virtual Pix modal generators
        initPixCotas(pixGrid);
    }
}

async function renderGifts(container) {
    const gifts = await dbService.getGifts();
    container.innerHTML = '';

    gifts.forEach(gift => {
        const isReserved = !gift.is_available;
        const priceFormatted = Number(gift.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const cardHtml = `
            <div class="col-md-6 col-lg-3" data-aos="fade-up">
                <div class="gift-card ${isReserved ? 'reserved' : ''}" data-gift-id="${gift.id}">
                    <div class="gift-img-container">
                        <img src="${gift.image_url}" alt="${gift.name}" loading="lazy">
                    </div>
                    <div class="gift-body">
                        <div>
                            <h3 class="gift-title">${gift.name}</h3>
                            <p class="gift-desc">${gift.description}</p>
                        </div>
                        <div>
                            <span class="gift-price">${priceFormatted}</span>
                            <button class="btn btn-gold w-100 select-gift-btn" ${isReserved ? 'disabled' : ''}>
                                <i class="fas fa-gift"></i> ${isReserved ? 'Reservado' : 'Presentear'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

async function handleGiftReservation(e) {
    const btn = e.target.closest('.select-gift-btn');
    if (!btn || btn.disabled) return;

    const card = btn.closest('.gift-card');
    const giftId = card.getAttribute('data-gift-id');
    const giftTitle = card.querySelector('.gift-title').textContent;
    const giftPrice = card.querySelector('.gift-price').textContent;
    const giftImg = card.querySelector('.gift-img-container img').src;

    const modalEl = document.getElementById('reserveGiftModal');
    if (!modalEl) return;

    document.getElementById('modal-reserve-gift-id').value = giftId;
    document.getElementById('modal-reserve-gift-title').textContent = giftTitle;
    document.getElementById('modal-reserve-gift-price').textContent = giftPrice;
    document.getElementById('modal-reserve-gift-img').src = giftImg;
    document.getElementById('modal-reserve-donor-name').value = '';

    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    bsModal.show();
}

async function handleReserveFormSubmit(e) {
    e.preventDefault();

    const giftId = document.getElementById('modal-reserve-gift-id').value;
    const giftTitle = document.getElementById('modal-reserve-gift-title').textContent;
    const donorName = document.getElementById('modal-reserve-donor-name').value.trim();

    if (!donorName) return;

    const success = await dbService.reserveGift(giftId, donorName);
    if (success) {
        const modalEl = document.getElementById('reserveGiftModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();

        const grid = document.getElementById('gift-list-grid');
        await renderGifts(grid);

        // Show custom thank-you modal instead of browser alert
        const thankYouModalEl = document.getElementById('giftThankYouModal');
        if (thankYouModalEl) {
            const donorEl = document.getElementById('thank-you-donor-name');
            const msgEl = document.getElementById('thank-you-gift-msg');
            if (donorEl) donorEl.textContent = `Obrigado(a), ${donorName}! ✨`;
            if (msgEl) msgEl.textContent = `Sua reserva para "${giftTitle}" foi selada com sucesso no livro de presentes de Márcia Gorete.`;
            
            const thankYouBsModal = bootstrap.Modal.getOrCreateInstance(thankYouModalEl);
            thankYouBsModal.show();
        }

        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#d4af37', '#e31837', '#ffffff']
            });
        }
    } else {
        alert("Não foi possível registrar a reserva. Tente novamente.");
    }
}

function initPixCotas(grid) {
    const modalElement = document.getElementById('pixModal');
    if (!modalElement) return;

    const bsModal = new bootstrap.Modal(modalElement);
    const modalTitle = document.getElementById('modal-pix-title');
    const modalQr = document.getElementById('modal-pix-qr');
    const copyBtn = document.getElementById('copy-pix-btn');
    const copyToast = document.getElementById('copy-toast');
    const pixKeyText = document.getElementById('pix-key-text');

    let currentCotaValue = 0;

    grid.addEventListener('click', async (e) => {
        const card = e.target.closest('.pix-card');
        if (!card) return;

        const value = card.getAttribute('data-pix-value');
        const title = card.getAttribute('data-pix-title');
        currentCotaValue = value;

        // Fetch current settings for PIX key
        const settings = await dbService.getSettings();
        const pixKey = settings.pix_key || "marcia15anos@pix.com.br";
        
        if (pixKeyText) pixKeyText.textContent = pixKey;

        if (modalTitle) modalTitle.textContent = `${title} — R$ ${value},00`;
        
        // Generate simulated dynamic QR Code containing code string payload
        const qrPayload = `00020101021126580014br.gov.bcb.pix0136${pixKey}5204000053039865405${value}.005802BR5925MarciaGorete15Anos6009SaoPaulo62070503***6304`;
        if (modalQr) {
            modalQr.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrPayload)}`;
        }
        
        if (copyToast) copyToast.classList.add('d-none');
        bsModal.show();
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const key = pixKeyText.textContent || "marcia15anos@pix.com.br";
            navigator.clipboard.writeText(key).then(() => {
                if (copyToast) {
                    copyToast.classList.remove('d-none');
                    setTimeout(() => copyToast.classList.add('d-none'), 3000);
                }
            }).catch(err => {
                console.error('Failed to copy Pix Key: ', err);
            });
        });
    }
}
