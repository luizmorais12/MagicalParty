// 15 Anos Márcia Gorete — A Bela e a Fera
// Guestbook Board and Moderation Submissions Controller

import { dbService } from '../services/db.js';

export async function initMessageBoard() {
    const wall = document.getElementById('message-board-wall');
    const form = document.getElementById('message-form');

    if (wall) {
        // 1. Fetch and render approved messages
        await renderApprovedMessages(wall);
    }

    if (form) {
        // 2. Set up event listener for writing messages
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const author = document.getElementById('msg-author').value.trim();
            const text = document.getElementById('msg-text').value.trim();

            const success = await dbService.addMessage(author, text);

            if (success) {
                form.reset();
                const modalEl = document.getElementById('messageSentModal');
                if (modalEl) {
                    const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
                    bsModal.show();
                } else {
                    alert("Sua carta foi enviada ao castelo! Ela aparecerá no mural assim que for aprovada pela corte. ✨");
                }
            } else {
                alert("Ocorreu um erro ao enviar sua carta. Tente novamente.");
            }
        });
    }
}

async function renderApprovedMessages(container) {
    const messages = await dbService.getMessages(true); // true = approved only
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted py-4">
                <p class="font-serif" style="font-size: 1.25rem; font-style: italic; color: rgba(253, 251, 247, 0.5);">
                    O livro está em branco... Seja o primeiro a selar uma mensagem carinhosa!
                </p>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        const dateObj = new Date(msg.created_at);
        const dateFormatted = dateObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const cardHtml = `
            <div class="col-md-6 message-card-wrapper" data-aos="fade-up">
                <div class="message-card">
                    <p class="message-text">"${escapeHtml(msg.text)}"</p>
                    <div class="message-author">${escapeHtml(msg.author)}</div>
                    <div class="message-date">${dateFormatted}</div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// Utility to escape html strings and prevent xss
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
