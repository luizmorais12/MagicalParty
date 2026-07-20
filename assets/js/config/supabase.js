// 15 Anos Márcia Gorete — A Bela e a Fera
// Supabase Client Config & Initialization

export function getSupabaseClient() {
    // Get credentials from localstorage (saves in admin panel settings) or window globals
    const url = localStorage.getItem('supabase_url') || window.SUPABASE_URL;
    const key = localStorage.getItem('supabase_anon_key') || window.SUPABASE_ANON_KEY;

    // Check if the script CDN is loaded and variables are present
    if (!url || !key || typeof supabase === 'undefined') {
        return null;
    }

    try {
        // Return initialized Supabase client
        return supabase.createClient(url, key, {
            auth: {
                persistSession: true,
                autoRefreshToken: true
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar cliente Supabase:", error);
        return null;
    }
}

export function isSupabaseConnected() {
    return getSupabaseClient() !== null;
}
