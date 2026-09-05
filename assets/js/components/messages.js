// 15 Anos Márcia Gorete — A Princesa e o Sapo
// Guestbook Board and Moderation Submissions Controller

import { dbService } from '../services/db.js';

let realtimeChannel = null;

export async function initMessageBoard() {
    const wall = document.getElementById('message-board-wall');
    const form = document.getElementById('message-form');

    if (wall) {
        // 1. Fetch and render approved messages
        await renderApprovedMessages(wall);

        // 2. Real-time subscription to newly approved messages
        if (!realtimeChannel) {
            realtimeChannel = dbService.subscribeToMessages(() => {
                renderApprovedMessages(wall);
            });
        }
    }

    if (form) {
        // 3. Set up event listener for writing messages
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const author = document.getElementById('msg-author').value.trim();
            const text = document.getElementById('msg-text').value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');

            const origHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Enviando...';
            }

            try {
                const success = await dbService.addMessage(author, text);

                if (success) {
                    form.reset();
                    const modalEl = document.getElementById('messageSentModal');
                    if (modalEl) {
                        const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
                        bsModal.show();
                    } else {
                        alert("Sua mensagem foi enviada ao bayou! Ela aparecerá no mural assim que for aprovada pela organização. ✨");
                    }
                } else {
                    const lastErr = dbService.lastError;
                    if (lastErr && (lastErr.code === '42501' || lastErr.message?.includes('policy'))) {
                        alert("Atenção: O banco de dados do evento precisa de atualização de permissões (RLS) no Supabase. Por favor, avise os organizadores!");
                    } else {
                        alert("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
                    }
                }
            } catch (error) {
                console.error("Erro ao enviar mensagem:", error);
                alert("Ocorreu um erro inesperado ao enviar sua mensagem.");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = origHtml;
                }
            }
        });
    }
}

async function renderApprovedMessages(container) {
    try {
        const messages = await dbService.getMessages(true); // true = approved only
        container.innerHTML = '';

        if (!messages || messages.length === 0) {
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
                    <div class="message-card position-relative">
                        <p class="message-text">"${escapeHtml(msg.text)}"</p>
                        <div class="message-author">${escapeHtml(msg.author)}</div>
                        <div class="message-date">${dateFormatted}</div>
                        <!-- Vintage Wax Seal -->
                        <div class="wax-seal" title="Mensagem Selada">🪷</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    } catch (e) {
        console.warn("Erro ao renderizar mensagens aprovadas:", e);
    }
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
