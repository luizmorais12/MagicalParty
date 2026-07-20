// 15 Anos Márcia Gorete — A Bela e a Fera
// Persistent Ambient Music Player Widget Controller

let isPlaying = false;
let audio = null;
let toggleBtn = null;
let statusText = null;

export function initMusicPlayer(forcePlay = false) {
    audio = document.getElementById('bg-audio');
    toggleBtn = document.getElementById('music-toggle');
    statusText = document.getElementById('music-status');

    if (!audio || !toggleBtn) return;

    // Set standard comfortable background volume
    audio.volume = 0.25;

    // Direct action triggers (like envelope seal clicks)
    if (forcePlay && !isPlaying) {
        startPlay();
    }

    // Toggle button event click
    toggleBtn.addEventListener('click', () => {
        if (isPlaying) {
            stopPlay();
        } else {
            startPlay();
        }
    });

    // Handle audio errors or alternate sources
    audio.addEventListener('error', () => {
        console.warn("Primary audio source error. Attempting secondary...");
        if (statusText) statusText.textContent = "Carregando áudio...";
    });
}

function startPlay() {
    if (!audio) return;
    
    audio.play().then(() => {
        isPlaying = true;
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        if (statusText) statusText.textContent = 'Música ativada 🎵';
        
        // Add subtle animation to button when playing
        toggleBtn.classList.add('music-playing');
    }).catch(err => {
        console.warn("Audio autoplay blocked or cancelled by browser interaction checks.", err);
        if (statusText) statusText.textContent = 'Clique para ouvir o Baile';
        isPlaying = false;
    });
}

function stopPlay() {
    if (!audio) return;
    
    audio.pause();
    isPlaying = false;
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    if (statusText) statusText.textContent = 'Música desativada';
    
    toggleBtn.classList.remove('music-playing');
}
