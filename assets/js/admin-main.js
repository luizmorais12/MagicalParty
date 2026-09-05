// 15 Anos Márcia Gorete — A Princesa e o Sapo
// Administrative Panel Core Application Entrypoint & Business Logic

import { dbService } from './services/db.js';
import { getSupabaseClient } from './config/supabase.js';

let chartInstance = null;
let currentTab = 'dashboard';
let guestsRealtimeChannel = null;
let messagesRealtimeChannel = null;
let pollInterval = null;

const SQL_FIX_SCRIPT = `-- ========================================================
-- SCRIPT DE LIBERAÇÃO DE PERMISSÕES SUPABASE (RLS)
-- 15 Anos Márcia Gorete — A Princesa e o Sapo
-- ========================================================

-- GUESTS (Convidados RSVP)
ALTER TABLE IF EXISTS guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em guests" ON guests;
DROP POLICY IF EXISTS "Inserção pública de RSVP" ON guests;
DROP POLICY IF EXISTS "Controle total de convidados por administradores" ON guests;
CREATE POLICY "Permitir tudo em guests" ON guests FOR ALL TO public USING (true) WITH CHECK (true);

-- MESSAGES (Livro de Visitas / Mural)
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em messages" ON messages;
DROP POLICY IF EXISTS "Inserção pública de mensagens" ON messages;
DROP POLICY IF EXISTS "Moderação total de mensagens por administradores" ON messages;
CREATE POLICY "Permitir tudo em messages" ON messages FOR ALL TO public USING (true) WITH CHECK (true);

-- SETTINGS (Configurações Gerais)
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em settings" ON settings;
CREATE POLICY "Permitir tudo em settings" ON settings FOR ALL TO public USING (true) WITH CHECK (true);

-- GALLERY (Galeria de Fotos)
ALTER TABLE IF EXISTS gallery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em gallery" ON gallery;
CREATE POLICY "Permitir tudo em gallery" ON gallery FOR ALL TO public USING (true) WITH CHECK (true);

-- TIMELINE (Cronograma)
ALTER TABLE IF EXISTS timeline ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em timeline" ON timeline;
CREATE POLICY "Permitir tudo em timeline" ON timeline FOR ALL TO public USING (true) WITH CHECK (true);

-- GIFTS (Presentes)
ALTER TABLE IF EXISTS gifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em gifts" ON gifts;
CREATE POLICY "Permitir tudo em gifts" ON gifts FOR ALL TO public USING (true) WITH CHECK (true);

-- VIDEOS (Retrospectiva)
ALTER TABLE IF EXISTS videos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em videos" ON videos;
CREATE POLICY "Permitir tudo em videos" ON videos FOR ALL TO public USING (true) WITH CHECK (true);

-- MUSIC (Músicas)
ALTER TABLE IF EXISTS music ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo em music" ON music;
CREATE POLICY "Permitir tudo em music" ON music FOR ALL TO public USING (true) WITH CHECK (true);

-- PRIVILÉGIOS NO SCHEMA PUBLIC
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;`;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check on page load
    checkAuthSession();

    // 2. Auth Login Form Submission
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 3. Tab switching events (both click and Bootstrap shown.bs.tab)
    const tabEl = document.getElementById('adminTabs');
    if (tabEl) {
        tabEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.admin-nav-item');
            if (!btn || btn.id === 'admin-logout-btn') return;
            
            const tabId = btn.id.replace('-tab', '');
            currentTab = tabId;
            loadTabContent(tabId);
        });
    }

    // Support Bootstrap 5 tab change event
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tabBtn => {
        tabBtn.addEventListener('shown.bs.tab', (e) => {
            const target = e.target.getAttribute('data-bs-target') || e.target.id;
            const tabId = target.replace('#', '').replace('-panel', '').replace('-tab', '');
            currentTab = tabId;
            loadTabContent(tabId);
        });
    });

    // 4. Guest search filter
    const searchInput = document.getElementById('search-guests-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderGuestsList(searchInput.value);
        });
    }

    // 5. Submit handlers for Modals and Forms
    const editGuestForm = document.getElementById('edit-guest-form');
    if (editGuestForm) {
        editGuestForm.addEventListener('submit', handleEditGuestSubmit);
    }

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }

    // 6. DB Factory reset handler
    const resetBtn = document.getElementById('reset-db-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleResetDatabase);
    }

    // 7. Mobile Sidebar Triggers
    initMobileSidebar();

    // 8. Exports init
    initExportEvents();

    // 9. Database diagnostics and tools init
    initDatabaseDiagnostics();

    // 10. Realtime synchronization setup
    initAdminRealtime();

    // 11. Logout button event
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// ==========================================
// REALTIME SYNC & AUTO-REFRESH
// ==========================================
function initAdminRealtime() {
    if (!guestsRealtimeChannel) {
        guestsRealtimeChannel = dbService.subscribeToGuests((payload) => {
            console.log("⚡ Novo evento em convidados:", payload);
            if (currentTab === 'dashboard') renderDashboardStats();
            if (currentTab === 'guests') renderGuestsList();
        });
    }

    if (!messagesRealtimeChannel) {
        messagesRealtimeChannel = dbService.subscribeToMessages((payload) => {
            console.log("⚡ Novo evento em mensagens:", payload);
            if (currentTab === 'dashboard') renderDashboardStats();
            if (currentTab === 'messages') renderMessagesList();
        });
    }

    // Backup polling every 20 seconds
    if (!pollInterval) {
        pollInterval = setInterval(() => {
            if (safeGetSessionStorage('admin_authenticated') === 'true') {
                if (currentTab === 'dashboard') renderDashboardStats();
                if (currentTab === 'guests') {
                    const searchInput = document.getElementById('search-guests-input');
                    const query = searchInput ? searchInput.value : '';
                    renderGuestsList(query);
                }
            }
        }, 20000);
    }
}

// ==========================================
// SESSION AND AUTH LOGIN
// ==========================================
function safeGetSessionStorage(key) {
    try {
        return sessionStorage.getItem(key);
    } catch (e) {
        console.warn("sessionStorage is blocked or inaccessible", e);
        return null;
    }
}

function safeSetSessionStorage(key, value) {
    try {
        sessionStorage.setItem(key, value);
    } catch (e) {
        console.warn("sessionStorage set failed", e);
    }
}

function safeRemoveSessionStorage(key) {
    try {
        sessionStorage.removeItem(key);
    } catch (e) {
        console.warn("sessionStorage remove failed", e);
    }
}

function checkAuthSession() {
    const isAuthed = safeGetSessionStorage('admin_authenticated') === 'true';
    const loginOverlay = document.getElementById('admin-login-overlay');
    const dashboardWrapper = document.getElementById('admin-dashboard-wrapper');

    if (isAuthed) {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (dashboardWrapper) dashboardWrapper.classList.remove('d-none');
        // Initial load of content and pre-populate all tabs
        loadTabContent('dashboard');
        renderGuestsList();
        renderMessagesList();
        renderAdminGalleryList();
        // Run database health check
        checkDatabaseStatusUI();
    } else {
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (dashboardWrapper) dashboardWrapper.classList.add('d-none');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const errMsg = document.getElementById('login-error-msg');

    let authenticated = false;

    // Check if Supabase client is connected
    const client = getSupabaseClient();
    if (client) {
        try {
            const { data, error } = await client.auth.signInWithPassword({
                email: username,
                password: password
            });
            if (!error && data.session) {
                authenticated = true;
            }
        } catch (err) {
            console.error("Supabase login exception, checking local credentials", err);
        }
    }

    // Local / Master credential check (admin / sapo2026)
    if (!authenticated) {
        if (username === 'admin' && password === 'sapo2026') {
            authenticated = true;
        }
    }

    if (authenticated) {
        safeSetSessionStorage('admin_authenticated', 'true');
        if (errMsg) errMsg.classList.add('d-none');
        checkAuthSession();
    } else {
        if (errMsg) errMsg.classList.remove('d-none');
    }
}

function handleLogout() {
    safeRemoveSessionStorage('admin_authenticated');
    const client = getSupabaseClient();
    if (client) {
        client.auth.signOut();
    }
    location.reload();
}

// ==========================================
// TABS CONTENT SWITCHING
// ==========================================
function loadTabContent(tabId) {
    switch (tabId) {
        case 'dashboard':
            renderDashboardStats();
            break;
        case 'guests':
            renderGuestsList();
            break;
        case 'messages':
            renderMessagesList();
            break;
        case 'gallery':
            renderAdminGalleryList();
            break;
        case 'settings':
            loadSettingsValues();
            checkDatabaseStatusUI();
            break;
    }
}

// ==========================================
// RENDER TAB: DASHBOARD
// ==========================================
async function renderDashboardStats() {
    try {
        const guests = await dbService.getGuests();
        const messages = await dbService.getMessages(false); // get all

        let totalConfirmed = 0;
        let adults = 0;
        let kids = 0;

        if (Array.isArray(guests)) {
            guests.forEach(g => {
                totalConfirmed += parseInt(g.guests_count || 0);
                adults += parseInt(g.adults_count || 0);
                kids += parseInt(g.kids_count || 0);
            });
        }

        const pendingMessages = Array.isArray(messages) ? messages.filter(m => !m.approved).length : 0;

        // Apply counters safely to DOM
        updateDOMElement('stat-total', totalConfirmed);
        updateDOMElement('stat-adults', adults);
        updateDOMElement('stat-kids', kids);
        updateDOMElement('stat-families', Array.isArray(guests) ? guests.length : 0);
        updateDOMElement('stat-messages', pendingMessages);

        // Draw Chart.js Donut
        renderAttendanceChart(adults, kids);
    } catch (e) {
        console.error("Erro ao renderizar métricas do painel:", e);
    }
}

function updateDOMElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderAttendanceChart(adults, kids) {
    const canvas = document.getElementById('admin-chart-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const hasData = (adults + kids) > 0;
    const dataSet = hasData ? [adults, kids] : [1];
    const labels = hasData ? ['Adultos', 'Crianças'] : ['Sem Confirmações'];
    const colors = hasData ? ['#145c36', '#7c5c8e'] : ['rgba(29, 53, 31, 0.08)'];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataSet,
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#1d351f', font: { family: 'Poppins', size: 11 } }
                }
            },
            cutout: '70%'
        }
    });
}

// ==========================================
// RENDER TAB: GUESTS LIST
// ==========================================
async function renderGuestsList(filterQuery = '') {
    const tbody = document.getElementById('guests-table-body');
    if (!tbody) return;

    const guests = await dbService.getGuests();
    tbody.innerHTML = '';

    let tabTotalCount = 0;
    let tabAdultsCount = 0;
    let tabKidsCount = 0;
    
    if (Array.isArray(guests)) {
        guests.forEach(g => {
            tabTotalCount += parseInt(g.guests_count || 0);
            tabAdultsCount += parseInt(g.adults_count || 0);
            tabKidsCount += parseInt(g.kids_count || 0);
        });
    }
    
    const tabTotalEl = document.getElementById('guest-tab-stat-total');
    const tabAdultsEl = document.getElementById('guest-tab-stat-adults');
    const tabKidsEl = document.getElementById('guest-tab-stat-kids');
    if (tabTotalEl) tabTotalEl.textContent = tabTotalCount;
    if (tabAdultsEl) tabAdultsEl.textContent = tabAdultsCount;
    if (tabKidsEl) tabKidsEl.textContent = tabKidsCount;

    const query = filterQuery.toLowerCase().trim();
    const filtered = Array.isArray(guests) ? guests.filter(g => {
        return (g.name && g.name.toLowerCase().includes(query)) || 
               (g.email && g.email.toLowerCase().includes(query)) ||
               (g.guest_names && g.guest_names.toLowerCase().includes(query)) ||
               (g.obs && g.obs.toLowerCase().includes(query));
    }) : [];

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-light-muted py-4">Nenhum convidado confirmado com os critérios de busca.</td>
            </tr>
        `;
        return;
    }

    const getInitials = (name) => {
        if (!name) return 'C';
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    filtered.forEach(g => {
        const dateFormatted = new Date(g.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        // Expose functions globally for click callbacks
        window.openEditGuestModal = openEditGuestModal;
        window.deleteGuest = deleteGuest;

        const avatarBg = g.guests_count > 1 ? 'var(--color-wine-primary)' : 'var(--color-royal-medium)';

        const row = `
            <tr>
                <td data-label="Nome">
                    <div class="d-flex align-items-center gap-2">
                        <div class="guest-avatar d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 36px; height: 36px; border-radius: 50%; background-color: ${avatarBg}; color: #ffffff; font-size: 0.85rem; flex-shrink: 0; font-family: var(--font-sans);">
                            ${getInitials(g.name)}
                        </div>
                        <div class="text-start">
                            <strong class="text-dark d-block" style="font-size: 0.88rem; line-height: 1.2;">${escapeHtml(g.name)}</strong>
                        </div>
                    </div>
                </td>
                <td data-label="Contato & Confirmação">
                    <div style="font-size: 0.82rem; line-height: 1.3;"><i class="fas fa-phone me-1 text-muted" style="font-size: 0.75rem;"></i> ${escapeHtml(g.phone)}</div>
                    <div style="font-size: 0.82rem; line-height: 1.3;"><i class="far fa-envelope me-1 text-muted" style="font-size: 0.75rem;"></i> ${escapeHtml(g.email)}</div>
                    <div class="small text-muted mt-1" style="font-size: 0.72rem; line-height: 1.2;"><i class="far fa-calendar-alt me-1"></i> Confirmado em: ${dateFormatted}</div>
                </td>
                <td data-label="Convidados" class="text-center">
                    <span class="badge bg-secondary px-2" style="font-size: 0.78rem;">${g.guests_count} total</span>
                    <div class="small text-muted mt-1" style="font-size: 0.72rem;">${g.adults_count} Ad. / ${g.kids_count} Cr.</div>
                </td>
                <td data-label="Acompanhantes" style="max-width: 150px; white-space: normal; word-wrap: break-word; font-size: 0.8rem; line-height: 1.3;"><span class="text-muted">${g.guest_names ? escapeHtml(g.guest_names) : '—'}</span></td>
                <td data-label="Observações" style="max-width: 120px; white-space: normal; word-wrap: break-word; font-size: 0.8rem; line-height: 1.3;"><span class="text-muted">${g.obs ? escapeHtml(g.obs) : '—'}</span></td>
                <td data-label="Ações" class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-warning rounded-circle" onclick="openEditGuestModal('${g.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteGuest('${g.id}')" title="Excluir"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function openEditGuestModal(id) {
    const guests = await dbService.getGuests();
    const guest = guests.find(g => String(g.id) === String(id));
    if (!guest) return;

    document.getElementById('edit-guest-id').value = guest.id;
    document.getElementById('edit-guest-name').value = guest.name;
    document.getElementById('edit-guest-phone').value = guest.phone;
    document.getElementById('edit-guest-email').value = guest.email;
    document.getElementById('edit-guest-count').value = guest.guests_count;
    document.getElementById('edit-guest-companions').value = guest.guest_names || '';
    document.getElementById('edit-guest-adults').value = guest.adults_count;
    document.getElementById('edit-guest-kids').value = guest.kids_count;
    document.getElementById('edit-guest-obs').value = guest.obs || '';

    const modal = new bootstrap.Modal(document.getElementById('editGuestModal'));
    modal.show();
}

async function handleEditGuestSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-guest-id').value;
    const name = document.getElementById('edit-guest-name').value.trim();
    const phone = document.getElementById('edit-guest-phone').value.trim();
    const email = document.getElementById('edit-guest-email').value.trim();
    const count = parseInt(document.getElementById('edit-guest-count').value);
    const companions = document.getElementById('edit-guest-companions').value.trim();
    const adults = parseInt(document.getElementById('edit-guest-adults').value);
    const kids = parseInt(document.getElementById('edit-guest-kids').value);
    const obs = document.getElementById('edit-guest-obs').value.trim();

    if ((adults + kids) !== count) {
        alert('A soma de Adultos e Crianças deve corresponder ao total de convidados!');
        return;
    }

    const payload = {
        name, phone, email,
        guests_count: count,
        guest_names: companions,
        adults_count: adults,
        kids_count: kids,
        obs
    };

    const success = await dbService.updateGuest(id, payload);
    if (success) {
        bootstrap.Modal.getInstance(document.getElementById('editGuestModal')).hide();
        renderGuestsList();
        renderDashboardStats();
    } else {
        alert("Falha ao atualizar dados no banco. Verifique as permissões de acesso.");
    }
}

async function deleteGuest(id) {
    if (confirm('Tem certeza absoluta que deseja remover este convidado?')) {
        const success = await dbService.deleteGuest(id);
        if (success) {
            renderGuestsList();
            renderDashboardStats();
        } else {
            alert("Falha ao remover convidado no banco de dados.");
        }
    }
}

// Expose admin actions globally for inline onclick attributes
window.approveMessage = approveMessage;
window.deleteMessage = deleteMessage;
window.openEditGuestModal = openEditGuestModal;
window.deleteGuest = deleteGuest;

// ==========================================
// RENDER TAB: MESSAGES WALL MODERATION
// ==========================================
async function renderMessagesList() {
    const tbody = document.getElementById('messages-table-body');
    if (!tbody) return;

    try {
        const messages = await dbService.getMessages(false); // get all
        tbody.innerHTML = '';

        const totalCount = Array.isArray(messages) ? messages.length : 0;
        const pendingCount = Array.isArray(messages) ? messages.filter(m => !m.approved).length : 0;
        const approvedCount = Array.isArray(messages) ? messages.filter(m => m.approved).length : 0;

        // Update tab statistics badges
        const statTotalEl = document.getElementById('msg-tab-stat-total');
        const statPendingEl = document.getElementById('msg-tab-stat-pending');
        const statApprovedEl = document.getElementById('msg-tab-stat-approved');

        if (statTotalEl) statTotalEl.textContent = `${totalCount} mensagens`;
        if (statPendingEl) statPendingEl.textContent = `${pendingCount} pendentes de moderação`;
        if (statApprovedEl) statApprovedEl.textContent = `${approvedCount} visíveis no mural`;

        if (!messages || messages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-light-muted py-4">Nenhuma mensagem no livro ainda.</td>
                </tr>
            `;
            return;
        }

        messages.forEach(msg => {
            const dateFormatted = msg.created_at ? new Date(msg.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            }) : 'Data recente';

            const statusHtml = msg.approved
                ? `<span class="badge bg-success"><i class="fas fa-check"></i> Visível no Mural</span>`
                : `<span class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Pendente</span>`;

            const approveBtn = msg.approved
                ? ''
                : `<button class="btn btn-sm btn-outline-success rounded-circle me-1 btn-approve-msg" data-msg-id="${msg.id}" onclick="window.approveMessage('${msg.id}')" title="Aprovar"><i class="fas fa-check-circle"></i></button>`;

            const row = `
                <tr>
                    <td data-label="Autor"><strong class="text-dark">${escapeHtml(msg.author || 'Anônimo')}</strong></td>
                    <td data-label="Mensagem"><p class="mb-0 text-dark font-serif" style="font-size: 0.95rem; line-height: 1.4;">"${escapeHtml(msg.text || '')}"</p></td>
                    <td data-label="Envio"><span style="font-size: 0.8rem;" class="text-muted">${dateFormatted}</span></td>
                    <td data-label="Status">${statusHtml}</td>
                    <td data-label="Ações" class="text-center" style="min-width: 100px;">
                        ${approveBtn}
                        <button class="btn btn-sm btn-outline-danger rounded-circle btn-delete-msg" data-msg-id="${msg.id}" onclick="window.deleteMessage('${msg.id}')" title="Remover"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (e) {
        console.error("Erro ao renderizar lista de mensagens:", e);
    }
}

async function approveMessage(id) {
    const success = await dbService.approveMessage(id);
    if (success) {
        await renderMessagesList();
        renderDashboardStats();
    } else {
        alert("Falha ao aprovar mensagem no banco. Verifique permissões RLS.");
    }
}

async function approveAllMessages() {
    const messages = await dbService.getMessages(false);
    const pendings = Array.isArray(messages) ? messages.filter(m => !m.approved) : [];
    
    if (pendings.length === 0) {
        alert("Todas as mensagens já estão aprovadas!");
        return;
    }

    if (!confirm(`Deseja aprovar todas as ${pendings.length} mensagens pendentes para exibição no mural público?`)) {
        return;
    }

    for (const msg of pendings) {
        await dbService.approveMessage(msg.id);
    }

    await renderMessagesList();
    renderDashboardStats();
    alert("Todas as mensagens foram aprovadas e já estão visíveis no mural!");
}

async function deleteMessage(id) {
    if (confirm('Deseja deletar esta mensagem definitivamente?')) {
        const success = await dbService.deleteMessage(id);
        if (success) {
            await renderMessagesList();
            renderDashboardStats();
        } else {
            alert("Falha ao excluir mensagem no banco.");
        }
    }
}

// Global window functions for inline callbacks
window.approveAllMessages = approveAllMessages;
window.renderMessagesList = renderMessagesList;

// ==========================================
// RENDER TAB: SETTINGS & ADJUSTS
// ==========================================
async function loadSettingsValues() {
    const settings = await dbService.getSettings();
    
    document.getElementById('cfg-name').value = settings.name || '';
    document.getElementById('cfg-date').value = settings.date ? settings.date.substring(0, 16) : '';
    document.getElementById('cfg-location').value = settings.location || '';
    document.getElementById('cfg-phrase').value = settings.phrase || '';
 
    // Load Supabase LocalStorage credentials
    document.getElementById('cfg-supabase-url').value = localStorage.getItem('supabase_url') || '';
    document.getElementById('cfg-supabase-key').value = localStorage.getItem('supabase_anon_key') || '';
}

async function handleSettingsSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('cfg-name').value.trim();
    const date = document.getElementById('cfg-date').value;
    const locationVal = document.getElementById('cfg-location').value.trim();
    const phrase = document.getElementById('cfg-phrase').value.trim();
 
    const settingsPayload = {
        name, date, location: locationVal, phrase,
        theme: "princess-and-the-frog"
    };

    // Grab Supabase URLs from fields
    const sUrl = document.getElementById('cfg-supabase-url').value.trim();
    const sKey = document.getElementById('cfg-supabase-key').value.trim();

    let triggerReload = false;

    // Check if credentials changed
    if (sUrl !== (localStorage.getItem('supabase_url') || '') || sKey !== (localStorage.getItem('supabase_anon_key') || '')) {
        localStorage.setItem('supabase_url', sUrl);
        localStorage.setItem('supabase_anon_key', sKey);
        triggerReload = true;
    }

    const success = await dbService.updateSettings(settingsPayload);
    if (success) {
        alert('As configurações do evento foram atualizadas com sucesso!');
        if (triggerReload) {
            location.reload();
        } else {
            loadSettingsValues();
            checkDatabaseStatusUI();
        }
    }
}

function handleResetDatabase() {
    if (confirm('Atenção: Esta ação apagará todas as presenças, mensagens de visitas e reservas de presentes salvos localmente, restaurando os padrões de fábrica. Deseja prosseguir?')) {
        dbService.resetDatabase();
        location.reload();
    }
}

// ==========================================
// DATABASE DIAGNOSTICS & PERMISSIONS TOOLS
// ==========================================
function initDatabaseDiagnostics() {
    const testBtn = document.getElementById('btn-test-db-connection');
    const copyBtn = document.getElementById('btn-copy-sql-fix');

    if (testBtn) {
        testBtn.addEventListener('click', async () => {
            const origHtml = testBtn.innerHTML;
            testBtn.disabled = true;
            testBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Testando...';
            await checkDatabaseStatusUI(true);
            testBtn.disabled = false;
            testBtn.innerHTML = origHtml;
        });
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(SQL_FIX_SCRIPT);
                const origHtml = copyBtn.innerHTML;
                copyBtn.classList.remove('btn-admin-primary');
                copyBtn.classList.add('btn-success');
                copyBtn.innerHTML = '<i class="fas fa-check me-1"></i> Código Copiado!';
                setTimeout(() => {
                    copyBtn.classList.remove('btn-success');
                    copyBtn.classList.add('btn-admin-primary');
                    copyBtn.innerHTML = origHtml;
                }, 3000);
            } catch (err) {
                // Fallback prompt if clipboard API blocked
                prompt("Copie o código SQL abaixo:", SQL_FIX_SCRIPT);
            }
        });
    }
}

async function checkDatabaseStatusUI(showAlertOnSuccess = false) {
    const statusPill = document.getElementById('admin-db-status-pill');
    const statusBox = document.getElementById('db-health-status-box');

    const health = await dbService.testDatabaseHealth();
    const guests = await dbService.getGuests();
    const guestCount = Array.isArray(guests) ? guests.length : 0;

    if (health.ok) {
        if (statusPill) {
            statusPill.className = 'badge bg-success px-3 py-2';
            statusPill.innerHTML = `<i class="fas fa-check-circle me-1"></i> Supabase Online (${guestCount} convidados)`;
        }
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="d-flex align-items-center gap-2 text-success fw-bold mb-1">
                    <i class="fas fa-check-circle"></i> Supabase Conectado & Sincronizado
                </div>
                <div class="small text-light-muted">
                    Total de registros encontrados no banco: <strong>${guestCount} confirmações</strong>.
                    As atualizações estão sendo transmitidas em tempo real.
                </div>
            `;
        }
        if (showAlertOnSuccess) {
            alert(`Conexão com o Supabase testada com sucesso! ${guestCount} convidados encontrados no banco.`);
        }
    } else {
        if (statusPill) {
            statusPill.className = 'badge bg-danger px-3 py-2';
            statusPill.innerHTML = `<i class="fas fa-exclamation-triangle me-1"></i> Supabase com Erro RLS`;
        }
        if (statusBox) {
            statusBox.innerHTML = `
                <div class="d-flex align-items-center gap-2 text-danger fw-bold mb-1">
                    <i class="fas fa-exclamation-triangle"></i> Atenção: Bloqueio de Permissões no Supabase
                </div>
                <div class="small text-danger mb-2">
                    ${escapeHtml(health.message || 'Erro de leitura/escrita no banco.')}
                </div>
                <div class="small text-light-muted">
                    <strong>Como resolver:</strong> Clique no botão <em>Copiar Código SQL</em> abaixo, abra o <strong>SQL Editor</strong> no painel do Supabase, cole e execute com o botão <strong>Run</strong>.
                </div>
            `;
        }
        if (showAlertOnSuccess) {
            alert(`Atenção: Falha na conexão com o Supabase.\n\n${health.message}\n\nExecute o script SQL fornecido no painel Supabase para corrigir.`);
        }
    }
}

// ==========================================
// DATA EXPORTS: CSV, EXCEL, PRINT/PDF
// ==========================================
function initExportEvents() {
    const csvBtn = document.getElementById('export-csv-btn');
    const excelBtn = document.getElementById('export-excel-btn');
    const pdfBtn = document.getElementById('export-pdf-btn');

    if (csvBtn) csvBtn.addEventListener('click', exportToCSV);
    if (excelBtn) excelBtn.addEventListener('click', exportToExcel);
    if (pdfBtn) pdfBtn.addEventListener('click', exportToPDF);
}

async function exportToPDF() {
    const guests = await dbService.getGuests();
    if (!guests || guests.length === 0) {
        alert('Sem convidados para exportar em PDF.');
        return;
    }

    if (!window.jspdf) {
        alert('Carregando gerador de PDF... Tente novamente em alguns segundos.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Calculate general stats
    let totalPessoas = 0;
    let totalAdultos = 0;
    let totalCriancas = 0;
    guests.forEach(g => {
        totalPessoas += parseInt(g.guests_count || 0);
        totalAdultos += parseInt(g.adults_count || 0);
        totalCriancas += parseInt(g.kids_count || 0);
    });

    // 2. Draw Header Band
    doc.setFillColor(20, 92, 54);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFillColor(212, 175, 55);
    doc.rect(0, 30, 210, 2, 'F');

    // Header Titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text("15 ANOS MÁRCIA GORETE - CONTROLE DE PORTARIA E BUFFET", 14, 18);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text(`Mansão JK - Relatório Oficial de Presenças  |  Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 25);

    // Table Columns & Data
    const headers = [["Nome Principal", "Contato", "Qtd", "Adultos / Crianças", "Acompanhantes", "Observações Alimentares"]];
    const data = guests.map(g => [
        g.name || '—',
        `${g.phone || ''}\n${g.email || ''}`,
        g.guests_count || 1,
        `${g.adults_count || 1} Ad. / ${g.kids_count || 0} Cr.`,
        g.guest_names || 'Nenhum',
        g.obs || 'Nenhuma'
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 42,
        theme: 'grid',
        headStyles: {
            fillColor: [20, 92, 54],
            textColor: [212, 175, 55],
            fontStyle: 'bold',
            fontSize: 9
        },
        alternateRowStyles: {
            fillColor: [248, 250, 248]
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            valign: 'middle',
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 40 },
            2: { cellWidth: 12, halign: 'center' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 40 },
            5: { cellWidth: 33 }
        }
    });

    // 3. Draw Summary & Signature boxes on the last page
    let currentY = doc.previousAutoTable.finalY + 15;
    if (currentY > 230) {
        doc.addPage();
        currentY = 25;
    }

    doc.setFillColor(245, 247, 245);
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.rect(14, currentY, 182, 22, 'FD');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 92, 54);
    doc.text("RESUMO DE MÉTRIAS DO BUFFET", 20, currentY + 7);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    doc.text(`Total Confirmado: ${totalPessoas} convidados   |   Adultos: ${totalAdultos}   |   Crianças (<10 anos): ${totalCriancas}`, 20, currentY + 15);
    
    currentY += 40;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    
    doc.line(20, currentY, 95, currentY);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Responsável Mansão JK (Portaria/Buffet)", 20, currentY + 5);
    doc.text("Nome, Assinatura e Carimbo", 20, currentY + 9);
    
    doc.line(115, currentY, 190, currentY);
    doc.text("Responsável pela Debutante (Família/Cerimonial)", 115, currentY + 5);
    doc.text("Nome e Assinatura", 115, currentY + 9);

    doc.save("Lista_de_Convidados_Marcia_Gorete_Buffet.pdf");
}

async function generateDataRows() {
    const guests = await dbService.getGuests();
    if (!Array.isArray(guests)) return [];
    return guests.map(g => {
        return {
            Nome: g.name,
            Telefone: g.phone,
            Email: g.email,
            QtdConvidados: g.guests_count,
            Acompanhantes: g.guest_names || 'Nenhum',
            Adultos: g.adults_count,
            Criancas: g.kids_count,
            Observacoes: g.obs || 'Nenhuma',
            DataConfirmacao: new Date(g.created_at).toLocaleString('pt-BR')
        };
    });
}

async function exportToCSV() {
    const rows = await generateDataRows();
    if (rows.length === 0) {
        alert('Sem convidados para exportar.');
        return;
    }

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(';'),
        ...rows.map(row => headers.map(field => {
            let cell = row[field] === null || row[field] === undefined ? '' : row[field];
            cell = String(cell).replace(/"/g, '""').replace(/[\n\r]+/g, ' ');
            return `"${cell}"`;
        }).join(';'))
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, 'confirmados_marcia_gorete_15anos.csv');
}

async function exportToExcel() {
    const rows = await generateDataRows();
    if (rows.length === 0) {
        alert('Sem convidados para exportar.');
        return;
    }

    const headers = Object.keys(rows[0]);
    const tsvContent = [
        headers.join('\t'),
        ...rows.map(row => headers.map(field => {
            let cell = row[field] === null || row[field] === undefined ? '' : row[field];
            cell = String(cell).replace(/\t/g, ' ').replace(/[\n\r]+/g, ' ');
            return cell;
        }).join('\t'))
    ].join('\r\n');

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), tsvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    triggerDownload(blob, 'confirmados_marcia_gorete_15anos.xls');
}

function triggerDownload(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// MOBILE SIDEBAR CONTROLLER
// ==========================================
function initMobileSidebar() {
    const openBtn = document.getElementById('sidebar-toggle-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const overlay = document.getElementById('admin-sidebar-overlay');
    const sidebar = document.getElementById('admin-sidebar');

    function toggle(show) {
        if (show) {
            sidebar.classList.add('show');
            overlay.classList.add('show');
        } else {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        }
    }

    if (openBtn) openBtn.addEventListener('click', () => toggle(true));
    if (closeBtn) closeBtn.addEventListener('click', () => toggle(false));
    if (overlay) overlay.addEventListener('click', () => toggle(false));

    document.querySelectorAll('.admin-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.innerWidth < 768) toggle(false);
        });
    });
}

// Utility to escape html strings
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

// ==========================================
// RENDER TAB: GALLERY MANAGEMENT
// ==========================================
async function renderAdminGalleryList() {
    const tbody = document.getElementById('admin-gallery-table-body');
    if (!tbody) return;

    const gallery = await dbService.getGallery();
    tbody.innerHTML = '';

    if (!gallery || gallery.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">Nenhuma foto na galeria ainda.</td>
            </tr>
        `;
        return;
    }

    gallery.forEach(item => {
        const row = `
            <tr>
                <td data-label="Foto">
                    <img src="${item.url}" alt="${escapeHtml(item.caption || '')}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-gold-medium);">
                </td>
                <td data-label="Legenda">
                    <span class="text-dark">${item.caption ? escapeHtml(item.caption) : '<em class="text-muted">Sem legenda</em>'}</span>
                </td>
                <td data-label="Categoria">
                    <span class="badge ${item.category === 'Debutante' ? 'bg-success' : 'bg-primary'}">${item.category}</span>
                </td>
                <td data-label="Ações" class="text-center">
                    <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="window.deleteAdminGalleryItem('${item.id}')" title="Excluir"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function deleteAdminGalleryItem(id) {
    if (confirm('Deseja realmente excluir esta foto da galeria?')) {
        const success = await dbService.deleteGalleryItem(id);
        if (success) {
            renderAdminGalleryList();
        }
    }
}
window.deleteAdminGalleryItem = deleteAdminGalleryItem;
