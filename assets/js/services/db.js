// 15 Anos Márcia Gorete — A Princesa e o Sapo
// Database Service Layer (Supabase with LocalStorage Transparent Fallback)

import { getSupabaseClient } from '../config/supabase.js';

// Default Seed Data for local storage fallback and initial state


const MOCK_TIMELINE = [
    { id: 't-1', time: '20:00', title: 'Entrada Jazz Lounge', description: 'Recepção instrumental com jazz clássico de New Orleans dos anos 1920, luzes suaves e LEDs simulando vaga-lumes.', icon: 'fas fa-music', order_index: 1 },
    { id: 't-2', time: '21:30', title: 'Banquete & Estação de Beignets', description: 'Jantar com culinária típica cajun e creole, além dos famosos Beignets da Tiana servidos com calda de chocolate quente.', icon: 'fas fa-utensils', order_index: 2 },
    { id: 't-3', time: '23:00', title: 'Visual da Debutante (Jazz Era)', description: 'Entrada oficial de recepção de Márcia vestindo seu elegante look lilás e dourado no autêntico estilo anos 20.', icon: 'fas fa-crown', order_index: 3 },
    { id: 't-4', time: '23:15', title: 'Valsa da Estrela (Verde-Sálvia)', description: 'Márcia dança a valsa principal com o clássico vestido rodado verde-sálvia sob a luz dos vaga-lumes.', icon: 'fas fa-star', order_index: 4 },
    { id: 't-5', time: '23:45', title: 'Mesa de Doces Iluminada', description: 'Homenagens e parabéns ao redor da mesa repleta de folhagens, luzes suspensas e nenúfares lilases e brancas.', icon: 'fas fa-heart', order_index: 5 },
    { id: 't-6', time: '00:00', title: 'Abertura da Pista de Jazz & Ritmos', description: 'Muita dança e comemoração pela madrugada com coquetéis mágicos e ritmos contagiantes.', icon: 'fas fa-compact-disc', order_index: 6 },
    { id: 't-7', time: '04:00', title: 'Encerramento e Lembranças', description: 'Agradecimento especial e entrega de mimos de Nova Orleans para selar esta noite inesquecível.', icon: 'fas fa-moon', order_index: 7 }
];

const SEED_VERSION = "v8_empty_captions";

const MOCK_SETTINGS = {
    name: "Márcia Gorete do Carmo Medeiros",
    date: "2026-10-03T20:00:00",
    location: "Mansão JK - Rua Padre Eustáquio 660 - Biritiba, Poá - SP, 08562-400",
    phrase: "Encontre sua estrela da noite e deixe a magia acontecer.",
    theme: "princess-and-the-frog",
    seed_version: SEED_VERSION
};

const MOCK_GUESTS = [
    { id: 'g-1', name: 'Tio João da Silva', phone: '(11) 98765-4321', email: 'joao.silva@email.com', guests_count: 2, guest_names: 'Clara da Silva (esposa)', adults_count: 2, kids_count: 0, message: 'Parabéns Márcia! Estaremos lá para prestigiar esse grande dia.', obs: '', created_at: '2026-07-19T10:30:00Z' },
    { id: 'g-2', name: 'Maria Eduarda de Souza', phone: '(11) 97777-8888', email: 'madu@email.com', guests_count: 2, guest_names: 'Pedro de Souza (filho)', adults_count: 1, kids_count: 1, message: 'Que festa linda você vai ter! A Duda aqui está ansiosa!', obs: 'Criança tem alergia a glúten.', created_at: '2026-07-19T11:15:00Z' }
];

const MOCK_MESSAGES = [
    { id: 'm-1', author: 'Madrinha Sandra', text: 'Parabéns Márcia! Que seu dia seja tão lindo e brilhante quanto você. Que Deus abençoe seus passos.', approved: true, created_at: '2026-07-19T10:00:00Z' },
    { id: 'm-2', author: 'Família Medeiros', text: 'Estamos muito felizes em poder compartilhar dessa data mágica com você. Um super beijo e nos vemos na festa!', approved: true, created_at: '2026-07-19T10:05:00Z' },
    { id: 'm-3', author: 'Ana Clara (Escola)', text: 'Migaaa, você vai estar uma verdadeira princesa! Mal posso esperar para dançar muito na pista com você!', approved: false, created_at: '2026-07-19T10:10:00Z' }
];

const MOCK_GALLERY = [
    { id: 'gal-1', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(1).jpeg', caption: '', category: 'Debutante', order_index: 1 },
    { id: 'gal-2', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(2).jpeg', caption: '', category: 'Debutante', order_index: 2 },
    { id: 'gal-3', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.40%20(3).jpeg', caption: '', category: 'Debutante', order_index: 3 },
    { id: 'gal-4', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41.jpeg', caption: '', category: 'Debutante', order_index: 4 },
    { id: 'gal-5', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41%20(1).jpeg', caption: '', category: 'Debutante', order_index: 5 },
    { id: 'gal-6', url: 'assets/img/WhatsApp%20Image%202026-08-24%20at%2000.01.41%20(2).jpeg', caption: '', category: 'Debutante', order_index: 6 }
];

    // Helper to initialize local data if not present or stale theme/seed
function initializeLocalDB() {
    let settings = null;
    try {
        settings = JSON.parse(localStorage.getItem('mb_settings'));
    } catch(e) {}

    // Force re-initialization if theme is not princess-and-the-frog or if the seed version is outdated
    if (!settings || settings.theme !== 'princess-and-the-frog' || settings.seed_version !== SEED_VERSION) {
        localStorage.setItem('mb_settings', JSON.stringify(MOCK_SETTINGS));
        localStorage.setItem('mb_timeline', JSON.stringify(MOCK_TIMELINE));
        localStorage.setItem('mb_guests', JSON.stringify(MOCK_GUESTS));
        localStorage.setItem('mb_messages', JSON.stringify(MOCK_MESSAGES));
        localStorage.setItem('mb_gallery', JSON.stringify(MOCK_GALLERY));
        return;
    }

    if (!localStorage.getItem('mb_settings')) {
        localStorage.setItem('mb_settings', JSON.stringify(MOCK_SETTINGS));
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
            const { id, ...supabaseItem } = item;
            const itemToInsert = (id && String(id).startsWith('gal-')) ? supabaseItem : item;
            const { error } = await client.from('gallery').insert([itemToInsert]);
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
