// 15 Anos Márcia Gorete — A Bela e a Fera
// Administrative Panel Core Application Entrypoint & Business Logic

import { dbService } from './services/db.js';
import { getSupabaseClient } from './config/supabase.js';

let chartInstance = null;
let currentTab = 'dashboard';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session check on page load
    checkAuthSession();

    // 2. Auth Login Form Submission
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // 3. Tab switching events
    const tabEl = document.getElementById('adminTabs');
    if (tabEl) {
        tabEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.admin-nav-item');
            if (!btn || btn.id === 'admin-logout-btn') return;
            
            // Switch tabs visually and reload content
            const tabId = btn.id.replace('-tab', '');
            currentTab = tabId;
            loadTabContent(tabId);
        });
    }

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

    const addGiftForm = document.getElementById('add-gift-form');
    if (addGiftForm) {
        addGiftForm.addEventListener('submit', handleAddGiftSubmit);
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

    // 9. Logout button event
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// ==========================================
// SESSION AND AUTH LOGIN
// ==========================================
function checkAuthSession() {
    const isAuthed = sessionStorage.getItem('admin_authenticated') === 'true';
    const loginOverlay = document.getElementById('admin-login-overlay');
    const dashboardWrapper = document.getElementById('admin-dashboard-wrapper');

    if (isAuthed) {
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (dashboardWrapper) dashboardWrapper.classList.remove('d-none');
        // Initial load of content
        loadTabContent('dashboard');
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
        // Try authenticating through Supabase standard Auth
        const { data, error } = await client.auth.signInWithPassword({
            email: username,
            password: password
        });
        if (!error && data.session) {
            authenticated = true;
        }
    }

    // Local / Offline credential check (admin / castelo2026)
    if (!authenticated) {
        if (username === 'admin' && password === 'castelo2026') {
            authenticated = true;
        }
    }

    if (authenticated) {
        sessionStorage.setItem('admin_authenticated', 'true');
        if (errMsg) errMsg.classList.add('d-none');
        checkAuthSession();
    } else {
        if (errMsg) errMsg.classList.remove('d-none');
    }
}

function handleLogout() {
    sessionStorage.removeItem('admin_authenticated');
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
        case 'gifts':
            renderGiftsList();
            break;
        case 'messages':
            renderMessagesList();
            break;
        case 'settings':
            loadSettingsValues();
            break;
    }
}

// ==========================================
// RENDER TAB: DASHBOARD
// ==========================================
async function renderDashboardStats() {
    const guests = await dbService.getGuests();
    const gifts = await dbService.getGifts();
    const messages = await dbService.getMessages(false); // get all

    let totalConfirmed = 0;
    let adults = 0;
    let kids = 0;

    guests.forEach(g => {
        totalConfirmed += parseInt(g.guests_count || 0);
        adults += parseInt(g.adults_count || 0);
        kids += parseInt(g.kids_count || 0);
    });

    const reservedGifts = gifts.filter(g => !g.is_available).length;
    const pendingMessages = messages.filter(m => !m.approved).length;

    // Apply counters safely to DOM
    updateDOMElement('stat-total', totalConfirmed);
    updateDOMElement('stat-adults', adults);
    updateDOMElement('stat-kids', kids);
    updateDOMElement('stat-families', guests.length);
    updateDOMElement('stat-gifts', reservedGifts);
    updateDOMElement('stat-messages', pendingMessages);

    // Draw Chart.js Donut
    renderAttendanceChart(adults, kids);
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
    const colors = hasData ? ['#d4af37', '#e31837'] : ['rgba(255,255,255,0.08)'];

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataSet,
                backgroundColor: colors,
                borderColor: '#0f1d36',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#dfd5be', font: { family: 'Montserrat', size: 11 } }
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

    const query = filterQuery.toLowerCase().trim();
    const filtered = guests.filter(g => {
        return g.name.toLowerCase().includes(query) || 
               g.email.toLowerCase().includes(query) ||
               (g.guest_names && g.guest_names.toLowerCase().includes(query)) ||
               (g.obs && g.obs.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-light-muted py-4">Nenhum convidado confirmado com os critérios de busca.</td>
            </tr>
        `;
        return;
    }

    filtered.forEach(g => {
        const dateFormatted = new Date(g.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        // Expose functions globally for click callbacks
        window.openEditGuestModal = openEditGuestModal;
        window.deleteGuest = deleteGuest;

        const row = `
            <tr>
                <td><strong>${escapeHtml(g.name)}</strong></td>
                <td>
                    <div style="font-size: 0.85rem;"><i class="fas fa-phone me-1" style="color: var(--color-gold-light);"></i> ${escapeHtml(g.phone)}</div>
                    <div style="font-size: 0.85rem;"><i class="far fa-envelope me-1" style="color: var(--color-gold-light);"></i> ${escapeHtml(g.email)}</div>
                </td>
                <td class="text-center"><span class="badge bg-secondary">${g.guests_count}</span></td>
                <td><span class="small text-light-muted">${g.guest_names ? escapeHtml(g.guest_names) : '—'}</span></td>
                <td>
                    <span class="badge bg-info text-dark">${g.adults_count} Ad.</span>
                    <span class="badge bg-success">${g.kids_count} Cr.</span>
                </td>
                <td><span class="small text-warning fw-semibold">${g.obs ? escapeHtml(g.obs) : '—'}</span></td>
                <td><span style="font-size: 0.8rem;">${dateFormatted}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-warning rounded-circle me-1" onclick="openEditGuestModal('${g.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-outline-danger rounded-circle" onclick="deleteGuest('${g.id}')" title="Excluir"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function openEditGuestModal(id) {
    const guests = await dbService.getGuests();
    const guest = guests.find(g => g.id === id);
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
    }
}

async function deleteGuest(id) {
    if (confirm('Tem certeza absoluta que deseja remover este convidado do reino?')) {
        const success = await dbService.deleteGuest(id);
        if (success) renderGuestsList();
    }
}

// Expose admin actions globally for inline onclick attributes
window.approveMessage = approveMessage;
window.deleteMessage = deleteMessage;
window.releaseGift = releaseGift;
window.deleteGift = deleteGift;
window.openEditGuestModal = openEditGuestModal;
window.deleteGuest = deleteGuest;

// ==========================================
// RENDER TAB: GIFTS LIST
// ==========================================
async function renderGiftsList() {
    const tbody = document.getElementById('gifts-table-body');
    if (!tbody) return;

    const gifts = await dbService.getGifts();
    tbody.innerHTML = '';

    gifts.forEach(g => {
        const isReserved = !g.is_available;
        const priceFormatted = Number(g.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const statusHtml = isReserved 
            ? `<span class="badge bg-danger"><i class="fas fa-bookmark"></i> Reservado por ${escapeHtml(g.reserved_by)}</span>` 
            : `<span class="badge bg-success">Disponível</span>`;

        const actionHtml = isReserved
            ? `<button class="btn btn-sm btn-outline-success rounded-pill btn-release-gift" data-gift-id="${g.id}" onclick="window.releaseGift('${g.id}')"><i class="fas fa-undo"></i> Liberar</button>`
            : `<button class="btn btn-sm btn-outline-danger rounded-circle btn-delete-gift" data-gift-id="${g.id}" onclick="window.deleteGift('${g.id}')"><i class="fas fa-trash-alt"></i></button>`;

        const row = `
            <tr>
                <td><img src="${g.image_url}" alt="${g.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid var(--color-gold-primary);"></td>
                <td><strong>${g.name}</strong></td>
                <td><span class="small text-light-muted">${g.description}</span></td>
                <td>${priceFormatted}</td>
                <td>${statusHtml}</td>
                <td class="text-center">${actionHtml}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function releaseGift(id) {
    if (confirm('Deseja liberar a cota de reserva deste presente?')) {
        const success = await dbService.releaseGift(id);
        if (success) {
            await renderGiftsList();
            renderDashboardStats();
        }
    }
}

async function deleteGift(id) {
    if (confirm('Deseja deletar este item permanentemente do catálogo de presentes?')) {
        const success = await dbService.deleteGift(id);
        if (success) {
            await renderGiftsList();
            renderDashboardStats();
        }
    }
}

async function handleAddGiftSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('add-gift-name').value.trim();
    const description = document.getElementById('add-gift-desc').value.trim();
    const price = parseFloat(document.getElementById('add-gift-price').value);
    const imageUrl = document.getElementById('add-gift-img').value.trim();

    const giftPayload = {
        id: 'gift-' + Date.now(),
        name, description, price, image_url: imageUrl
    };

    const success = await dbService.addGift(giftPayload);
    if (success) {
        bootstrap.Modal.getInstance(document.getElementById('addGiftModal')).hide();
        document.getElementById('add-gift-form').reset();
        await renderGiftsList();
        renderDashboardStats();
    }
}

// ==========================================
// RENDER TAB: MESSAGES WALL MODERATION
// ==========================================
async function renderMessagesList() {
    const tbody = document.getElementById('messages-table-body');
    if (!tbody) return;

    const messages = await dbService.getMessages(false); // get all
    tbody.innerHTML = '';

    if (messages.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-light-muted py-4">Nenhuma mensagem no livro ainda.</td>
            </tr>
        `;
        return;
    }

    messages.forEach(msg => {
        const dateFormatted = new Date(msg.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        const statusHtml = msg.approved
            ? `<span class="badge bg-success"><i class="fas fa-check"></i> Visível no Mural</span>`
            : `<span class="badge bg-warning text-dark"><i class="fas fa-clock"></i> Pendente</span>`;

        const approveBtn = msg.approved
            ? ''
            : `<button class="btn btn-sm btn-outline-success rounded-circle me-1 btn-approve-msg" data-msg-id="${msg.id}" onclick="window.approveMessage('${msg.id}')" title="Aprovar"><i class="fas fa-check-circle"></i></button>`;

        const row = `
            <tr>
                <td><strong>${escapeHtml(msg.author)}</strong></td>
                <td><p class="mb-0 text-light-muted font-serif" style="font-size: 0.95rem; line-height: 1.4;">"${escapeHtml(msg.text)}"</p></td>
                <td><span style="font-size: 0.8rem;">${dateFormatted}</span></td>
                <td>${statusHtml}</td>
                <td class="text-center" style="min-width: 100px;">
                    ${approveBtn}
                    <button class="btn btn-sm btn-outline-danger rounded-circle btn-delete-msg" data-msg-id="${msg.id}" onclick="window.deleteMessage('${msg.id}')" title="Remover"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

async function approveMessage(id) {
    const success = await dbService.approveMessage(id);
    if (success) {
        await renderMessagesList();
        renderDashboardStats();
    }
}

async function deleteMessage(id) {
    if (confirm('Deseja deletar esta mensagem definitivamente?')) {
        const success = await dbService.deleteMessage(id);
        if (success) {
            await renderMessagesList();
            renderDashboardStats();
        }
    }
}

// ==========================================
// RENDER TAB: SETTINGS & ADJUSTS
// ==========================================
async function loadSettingsValues() {
    const settings = await dbService.getSettings();
    
    document.getElementById('cfg-name').value = settings.name || '';
    document.getElementById('cfg-date').value = settings.date ? settings.date.substring(0, 16) : '';
    document.getElementById('cfg-location').value = settings.location || '';
    document.getElementById('cfg-phrase').value = settings.phrase || '';
    document.getElementById('cfg-pix-key').value = settings.pix_key || '';

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
    const pixKey = document.getElementById('cfg-pix-key').value.trim();

    const settingsPayload = {
        name, date, location: locationVal, phrase, pix_key: pixKey,
        theme: "beauty-and-the-beast"
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
        alert('As configurações do reino foram atualizadas com sucesso!');
        if (triggerReload) {
            location.reload();
        } else {
            loadSettingsValues();
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

    // Title & Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text("Márcia Gorete — 15 Anos | Lista Real de Convidados", 14, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 25);

    // Table Data
    const headers = [["Nome", "Telefone", "Total", "Adultos", "Crianças", "Acompanhantes"]];
    const data = guests.map(g => [
        g.name || '—',
        g.phone || '—',
        g.guests_count || 1,
        g.adults_count || 1,
        g.kids_count || 0,
        g.guest_names || 'Nenhum'
    ]);

    doc.autoTable({
        head: headers,
        body: data,
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [15, 29, 54],
            textColor: [212, 175, 55],
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        styles: {
            fontSize: 9,
            cellPadding: 3
        }
    });

    // Direct PDF File Download
    doc.save("Lista_de_Convidados_Marcia_Gorete.pdf");
}

async function generateDataRows() {
    const guests = await dbService.getGuests();
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
        headers.join(';'), // Excel direct separation for standard PT-BR
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

    // Collapse on sidebar menu click in mobile layouts
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
