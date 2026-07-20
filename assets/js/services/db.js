// 15 Anos Márcia Gorete — A Bela e a Fera
// Database Service Layer (Supabase with LocalStorage Transparent Fallback)

import { getSupabaseClient } from '../config/supabase.js';

// Default Seed Data for local storage fallback and initial state
const MOCK_GIFTS = [
    { id: 'gift-1', name: 'Fragrância Imperial', description: 'Perfume sofisticado e marcante para a debutante.', price: 350.00, image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-2', name: 'Brincos Dourados', description: 'Um detalhe banhado a ouro para complementar o visual mágico do grande baile.', price: 280.00, image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=400&auto=format&fit=crop', is_available: false, reserved_by: 'Madrinha Sandra', reserved_at: '2026-07-19T10:00:00Z' },
    { id: 'gift-3', name: 'Bolsa Tiracolo', description: 'Bolsa clutch elegante para ocasiões festivas e saídas inesquecíveis.', price: 180.00, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-4', name: 'Sapato de Cristal', description: 'Salto moderno e confortável para dançar a valsa e aproveitar a festa ao máximo.', price: 320.00, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-5', name: 'Kit de Beleza', description: 'Paleta de cores elegantes e maquiagens finas para realçar seu brilho natural.', price: 150.00, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-6', name: 'Biblioteca Clássica', description: 'Coleção de livros encadernados de romance e aventuras imperiais.', price: 200.00, image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-7', name: 'Câmera Instantânea', description: 'Para fotografar na hora os melhores momentos e guardar no mural físico.', price: 450.00, image_url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null },
    { id: 'gift-8', name: 'Experiência Dia de SPA', description: 'Um dia inteiro de massagens e tratamentos relaxantes antes do grande baile.', price: 500.00, image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=400&auto=format&fit=crop', is_available: true, reserved_by: null, reserved_at: null }
];

const MOCK_TIMELINE = [
    { id: 't-1', time: '20:00', title: 'Recepção Real', description: 'Abertura dos portões do castelo para acolhimento dos convidados com música suave instrumental.', icon: 'fas fa-door-open', order_index: 1 },
    { id: 't-2', time: '21:30', title: 'Jantar Imperial', description: 'Banquete especialmente preparado com os melhores sabores para celebrar esta data especial.', icon: 'fas fa-utensils', order_index: 2 },
    { id: 't-3', time: '23:00', title: 'Entrada da Debutante', description: 'O momento mais esperado da noite: a apresentação de Márcia em seu belo vestido de gala.', icon: 'fas fa-crown', order_index: 3 },
    { id: 't-4', time: '23:15', title: 'A Grande Valsa', description: 'Márcia dança a valsa tradicional no centro do salão com seu pai e príncipes, abrindo a pista.', icon: 'fas fa-gem', order_index: 4 },
    { id: 't-5', time: '23:45', title: 'Homenagens e Parabéns', description: 'Momento de emoção com retrospectiva, discursos e o tradicional parabéns ao redor do bolo real.', icon: 'fas fa-heart', order_index: 5 },
    { id: 't-6', time: '00:00', title: 'Abertura da Pista', description: 'Muita música, dança e alegria. A comemoração continua pela madrugada com coquetéis mágicos.', icon: 'fas fa-music', order_index: 6 },
    { id: 't-7', time: '04:00', title: 'Encerramento do Conto', description: 'Agradecimento final e despedida dos convidados com lembranças especiais do castelo.', icon: 'fas fa-moon', order_index: 7 }
];

const MOCK_SETTINGS = {
    name: "Márcia Gorete do Carmo Medeiros",
    date: "2026-10-03T20:00:00",
    location: "Salão Imperial Maison D'Or - Av. dos Nobres Castelos, 1500 - Jardim das Rosas, São Paulo - SP",
    phrase: "Uma noite encantada espera por você no baile real.",
    pix_key: "marcia15anos@pix.com.br",
    theme: "classic-gold"
};

const MOCK_GUESTS = [
    { id: 'g-1', name: 'Tio João da Silva', phone: '(11) 98765-4321', email: 'joao.silva@email.com', guests_count: 2, guest_names: 'Clara da Silva (esposa)', adults_count: 2, kids_count: 0, message: 'Parabéns Márcia! Estaremos lá para prestigiar esse grande dia.', obs: '', created_at: '2026-07-19T10:30:00Z' },
    { id: 'g-2', name: 'Maria Eduarda de Souza', phone: '(11) 97777-8888', email: 'madu@email.com', guests_count: 2, guest_names: 'Pedro de Souza (filho)', adults_count: 1, kids_count: 1, message: 'Que festa linda você vai ter! A Duda aqui está ansiosa!', obs: 'Criança tem alergia a glúten.', created_at: '2026-07-19T11:15:00Z' }
];

const MOCK_MESSAGES = [
    { id: 'm-1', author: 'Madrinha Sandra', text: 'Parabéns Márcia! Que seu dia seja tão lindo e brilhante quanto você. Que Deus abençoe seus passos.', approved: true, created_at: '2026-07-19T10:00:00Z' },
    { id: 'm-2', author: 'Família Medeiros', text: 'Estamos muito felizes em poder compartilhar dessa data mágica com você. Um super beijo e nos vemos no castelo!', approved: true, created_at: '2026-07-19T10:05:00Z' },
    { id: 'm-3', author: 'Ana Clara (Escola)', text: 'Migaaa, você vai estar uma verdadeira princesa! Mal posso esperar para dançar muito na pista com você!', approved: false, created_at: '2026-07-19T10:10:00Z' }
];

const MOCK_GALLERY = [
    { id: 'gal-1', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop', caption: 'Um ensaio sob a luz suave do entardecer', category: 'Ensaio', order_index: 1 },
    { id: 'gal-2', url: 'https://images.unsplash.com/photo-1549417229-aa67d3263c09?q=80&w=600&auto=format&fit=crop', caption: 'Momentos de pura felicidade e sonhos', category: 'Ensaio', order_index: 2 },
    { id: 'gal-3', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600&auto=format&fit=crop', caption: 'A elegância de um dia inesquecível', category: 'Debutante', order_index: 3 },
    { id: 'gal-4', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop', caption: 'A rosa encantada reflete sua beleza e brilho', category: 'Debutante', order_index: 4 },
    { id: 'gal-5', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop', caption: 'Caminhos dourados de contos de fadas', category: 'Ensaio', order_index: 5 },
    { id: 'gal-6', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop', caption: 'À espera de uma noite espetacular', category: 'Debutante', order_index: 6 }
];

// Helper to initialize local data if not present
function initializeLocalDB() {
    if (!localStorage.getItem('mb_settings')) {
        localStorage.setItem('mb_settings', JSON.stringify(MOCK_SETTINGS));
    }
    if (!localStorage.getItem('mb_gifts')) {
        localStorage.setItem('mb_gifts', JSON.stringify(MOCK_GIFTS));
    }
    if (!localStorage.getItem('mb_timeline')) {
        localStorage.setItem('mb_timeline', JSON.stringify(MOCK_TIMELINE));
    }
    if (!localStorage.getItem('mb_guests')) {
        localStorage.setItem('mb_guests', JSON.stringify(MOCK_GUESTS));
    }
    if (!localStorage.getItem('mb_messages')) {
        localStorage.setItem('mb_messages', JSON.stringify(MOCK_MESSAGES));
    }
    if (!localStorage.getItem('mb_gallery')) {
        localStorage.setItem('mb_gallery', JSON.stringify(MOCK_GALLERY));
    }
}

// Auto-run local database initialization
initializeLocalDB();

// ==========================================
// DB SERVICE METHODS
// ==========================================
export const dbService = {

    // 1. SETTINGS OPERATIONS
    async getSettings() {
        const client = getSupabaseClient();
        if (client) {
            const { data, error } = await client.from('settings').select('*').eq('key', 'event_settings').single();
            if (!error && data) {
                return data.value;
            }
            console.warn("Error fetching Supabase settings, using fallback", error);
        }
        return JSON.parse(localStorage.getItem('mb_settings'));
    },

    async updateSettings(newSettings) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('settings').upsert({
                key: 'event_settings',
                value: newSettings,
                updated_at: new Date().toISOString()
            });
            if (!error) return true;
            console.error("Error updating Supabase settings", error);
        }
        localStorage.setItem('mb_settings', JSON.stringify(newSettings));
        return true;
    },

    // 2. GUESTS OPERATIONS (RSVP)
    async getGuests() {
        const client = getSupabaseClient();
        if (client) {
            const { data, error } = await client.from('guests').select('*').order('created_at', { ascending: false });
            if (!error && data) return data;
            console.warn("Supabase guest read failed, using fallback", error);
        }
        return JSON.parse(localStorage.getItem('mb_guests'));
    },

    async addGuest(guestData) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('guests').insert([{
                ...guestData,
                created_at: new Date().toISOString()
            }]);
            if (!error) return true;
            console.error("Supabase guest insert failed", error);
        }
        const guests = JSON.parse(localStorage.getItem('mb_guests') || '[]');
        const newGuest = {
            id: 'g-' + Date.now(),
            ...guestData,
            created_at: new Date().toISOString()
        };
        guests.unshift(newGuest);
        localStorage.setItem('mb_guests', JSON.stringify(guests));
        return true;
    },

    async updateGuest(id, updatedData) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('guests').update(updatedData).eq('id', id);
            if (!error) return true;
            console.error("Supabase guest update failed, using local storage fallback", error);
        }
        const guests = JSON.parse(localStorage.getItem('mb_guests') || '[]');
        const index = guests.findIndex(g => String(g.id) === String(id));
        if (index !== -1) {
            guests[index] = { ...guests[index], ...updatedData };
            localStorage.setItem('mb_guests', JSON.stringify(guests));
        }
        return true;
    },

    async deleteGuest(id) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('guests').delete().eq('id', id);
            if (!error) return true;
            console.error("Supabase guest deletion failed, using local storage fallback", error);
        }
        let guests = JSON.parse(localStorage.getItem('mb_guests') || '[]');
        guests = guests.filter(g => String(g.id) !== String(id));
        localStorage.setItem('mb_guests', JSON.stringify(guests));
        return true;
    },

    // 3. MESSAGES OPERATIONS (Guestbook)
    async getMessages(approvedOnly = true) {
        const client = getSupabaseClient();
        const forceLocal = localStorage.getItem('mb_use_local_fallback_messages') === 'true';
        if (client && !forceLocal) {
            let query = client.from('messages').select('*').order('created_at', { ascending: false });
            if (approvedOnly) {
                query = query.eq('approved', true);
            }
            const { data, error } = await query;
            if (!error && data && data.length > 0) return data;
            console.warn("Supabase messages query failed or empty, using fallback", error);
        }
        const messages = JSON.parse(localStorage.getItem('mb_messages') || '[]');
        return approvedOnly ? messages.filter(m => m.approved) : messages;
    },

    async addMessage(author, text) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('messages').insert([{
                author,
                text,
                approved: false,
                created_at: new Date().toISOString()
            }]);
            if (!error) return true;
            console.error("Supabase message insert failed", error);
        }
        const messages = JSON.parse(localStorage.getItem('mb_messages') || '[]');
        const newMsg = {
            id: 'm-' + Date.now(),
            author,
            text,
            approved: false,
            created_at: new Date().toISOString()
        };
        messages.unshift(newMsg);
        localStorage.setItem('mb_messages', JSON.stringify(messages));
        return true;
    },

    async approveMessage(id) {
        const client = getSupabaseClient();
        let supaOk = false;
        if (client) {
            const { error } = await client.from('messages').update({ approved: true }).eq('id', id);
            if (!error) supaOk = true;
            else console.error("Supabase message approval failed, fallback to local storage", error);
        }
        if (!supaOk) {
            localStorage.setItem('mb_use_local_fallback_messages', 'true');
        }
        const messages = JSON.parse(localStorage.getItem('mb_messages') || '[]');
        const index = messages.findIndex(m => String(m.id) === String(id));
        if (index !== -1) {
            messages[index].approved = true;
            localStorage.setItem('mb_messages', JSON.stringify(messages));
        }
        return true;
    },

    async deleteMessage(id) {
        const client = getSupabaseClient();
        let supaOk = false;
        if (client) {
            const { error } = await client.from('messages').delete().eq('id', id);
            if (!error) supaOk = true;
            else console.error("Supabase message deletion failed, fallback to local storage", error);
        }
        if (!supaOk) {
            localStorage.setItem('mb_use_local_fallback_messages', 'true');
        }
        let messages = JSON.parse(localStorage.getItem('mb_messages') || '[]');
        messages = messages.filter(m => String(m.id) !== String(id));
        localStorage.setItem('mb_messages', JSON.stringify(messages));
        return true;
    },

    // 4. GIFTS OPERATIONS
    async getGifts() {
        const client = getSupabaseClient();
        const forceLocal = localStorage.getItem('mb_use_local_fallback_gifts') === 'true';
        if (client && !forceLocal) {
            const { data, error } = await client.from('gifts').select('*').order('name', { ascending: true });
            if (!error && data && data.length > 0) return data;
            console.warn("Supabase gifts fetch failed or empty, using fallback", error);
        }
        return JSON.parse(localStorage.getItem('mb_gifts'));
    },

    async addGift(giftData) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('gifts').insert([giftData]);
            if (!error) return true;
            console.error("Supabase gift insertion failed", error);
        }
        const gifts = JSON.parse(localStorage.getItem('mb_gifts') || '[]');
        gifts.push({
            is_available: true,
            reserved_by: null,
            reserved_at: null,
            ...giftData
        });
        localStorage.setItem('mb_gifts', JSON.stringify(gifts));
        return true;
    },

    async deleteGift(id) {
        const client = getSupabaseClient();
        let supaOk = false;
        if (client) {
            const { error } = await client.from('gifts').delete().eq('id', id);
            if (!error) supaOk = true;
            else console.error("Supabase gift deletion failed, fallback to local storage", error);
        }
        if (!supaOk) {
            localStorage.setItem('mb_use_local_fallback_gifts', 'true');
        }
        let gifts = JSON.parse(localStorage.getItem('mb_gifts') || '[]');
        gifts = gifts.filter(g => String(g.id) !== String(id));
        localStorage.setItem('mb_gifts', JSON.stringify(gifts));
        return true;
    },

    async reserveGift(id, reservedBy) {
        const client = getSupabaseClient();
        const reservedAt = new Date().toISOString();
        let supaOk = false;
        if (client) {
            const { error } = await client.from('gifts').update({
                is_available: false,
                reserved_by: reservedBy,
                reserved_at: reservedAt
            }).eq('id', id);
            if (!error) supaOk = true;
            else console.error("Supabase gift reservation failed, fallback to local storage", error);
        }
        if (!supaOk) {
            localStorage.setItem('mb_use_local_fallback_gifts', 'true');
        }
        const gifts = JSON.parse(localStorage.getItem('mb_gifts') || '[]');
        const index = gifts.findIndex(g => String(g.id) === String(id));
        if (index !== -1) {
            gifts[index].is_available = false;
            gifts[index].reserved_by = reservedBy;
            gifts[index].reserved_at = reservedAt;
            localStorage.setItem('mb_gifts', JSON.stringify(gifts));
        }
        return true;
    },

    async releaseGift(id) {
        const client = getSupabaseClient();
        let supaOk = false;
        if (client) {
            const { error } = await client.from('gifts').update({
                is_available: true,
                reserved_by: null,
                reserved_at: null
            }).eq('id', id);
            if (!error) supaOk = true;
            else console.error("Supabase gift release failed, fallback to local storage", error);
        }
        if (!supaOk) {
            localStorage.setItem('mb_use_local_fallback_gifts', 'true');
        }
        const gifts = JSON.parse(localStorage.getItem('mb_gifts') || '[]');
        const index = gifts.findIndex(g => String(g.id) === String(id));
        if (index !== -1) {
            gifts[index].is_available = true;
            gifts[index].reserved_by = null;
            gifts[index].reserved_at = null;
            localStorage.setItem('mb_gifts', JSON.stringify(gifts));
        }
        return true;
    },

    // 5. TIMELINE OPERATIONS
    async getTimeline() {
        const client = getSupabaseClient();
        if (client) {
            const { data, error } = await client.from('timeline').select('*').order('order_index', { ascending: true });
            if (!error && data) return data;
            console.warn("Supabase timeline fetch failed, using fallback", error);
        }
        return JSON.parse(localStorage.getItem('mb_timeline'));
    },

    async updateTimelineItem(id, itemData) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('timeline').update(itemData).eq('id', id);
            if (!error) return true;
            console.error("Supabase timeline item update failed, fallback to local storage", error);
        }
        const timeline = JSON.parse(localStorage.getItem('mb_timeline') || '[]');
        const index = timeline.findIndex(t => String(t.id) === String(id));
        if (index !== -1) {
            timeline[index] = { ...timeline[index], ...itemData };
            localStorage.setItem('mb_timeline', JSON.stringify(timeline));
        }
        return true;
    },

    // 6. GALLERY ALBUM OPERATIONS
    async getGallery() {
        const client = getSupabaseClient();
        if (client) {
            const { data, error } = await client.from('gallery').select('*').order('order_index', { ascending: true });
            if (!error && data) return data;
            console.warn("Supabase gallery fetch failed, using fallback", error);
        }
        return JSON.parse(localStorage.getItem('mb_gallery'));
    },

    async addGalleryItem(item) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('gallery').insert([item]);
            if (!error) return true;
            console.error("Supabase gallery item insert failed", error);
        }
        const gallery = JSON.parse(localStorage.getItem('mb_gallery') || '[]');
        gallery.push({
            id: 'gal-' + Date.now(),
            ...item
        });
        localStorage.setItem('mb_gallery', JSON.stringify(gallery));
        return true;
    },

    async deleteGalleryItem(id) {
        const client = getSupabaseClient();
        if (client) {
            const { error } = await client.from('gallery').delete().eq('id', id);
            if (!error) return true;
            console.error("Supabase gallery deletion failed, fallback to local storage", error);
        }
        let gallery = JSON.parse(localStorage.getItem('mb_gallery') || '[]');
        gallery = gallery.filter(g => String(g.id) !== String(id));
        localStorage.setItem('mb_gallery', JSON.stringify(gallery));
        return true;
    },

    // 7. REST DATABASE BACK TO FACTORY SEEDS
    resetDatabase() {
        localStorage.clear();
        initializeLocalDB();
        return true;
    }
};
