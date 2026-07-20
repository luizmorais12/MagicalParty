// 15 Anos Márcia Gorete — A Bela e a Fera
// Cinematic Loading Screen and Split Gates Transitions Controller

import { initMusicPlayer } from './music.js';

export function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const castleGates = document.getElementById('castle-gates');
    const loadingProgressBar = document.getElementById('loading-progress-bar');
    const loadingPercentage = document.getElementById('loading-percentage');

    // Initialize the music player
    initMusicPlayer(false);

    // Start loading progress directly
    startLoadingProgress();

    // 2. Simulate Loading Progress
    function startLoadingProgress() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 4; // Incremental advances

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                triggerCinematicReveal(); // Loaded! Start transitions
            }

            // Update UI displays
            if (loadingProgressBar) loadingProgressBar.style.width = `${progress}%`;
            if (loadingPercentage) loadingPercentage.textContent = `${progress}%`;
        }, 120);
    }

    // 3. Cinematic Rose Bloom & Gates Open
    function triggerCinematicReveal() {
        const timeline = gsap.timeline();

        // Step A: Bloom the rose inside the glass dome
        timeline.to(".rose-petal-bloom", {
            scale: 1.15,
            rotation: 0,
            filter: "brightness(1.2) drop-shadow(0 0 15px #e31837)",
            duration: 2.2,
            ease: "power2.out"
        });

        // Step B: Fade out the glass dome and text
        timeline.to([".glass-dome", ".dome-top-knob", ".dome-base", ".dome-glow", ".loading-text"], {
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.inOut"
        }, "+=0.3");

        // Step C: Fade out the loading screen wrapper
        timeline.to(loadingScreen, {
            opacity: 0,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                loadingScreen.style.display = 'none';
                // Trigger gates opening
                document.body.classList.add('gates-open');
                
                // Animate main page elements entrance
                animateHeroEntrance();
            }
        }, "-=0.3");

        // Step D: Open castle gates (Split screen slide)
        // Gates open class was added in step C. After animation completes, clean gates from DOM to free memory.
        setTimeout(() => {
            if (castleGates) {
                gsap.to(castleGates, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => castleGates.remove()
                });
            }
        }, 4500); // Wait for the gate transition to fully play out (1.8s + lag buffer)
    }

    // 4. Hero Section elements arrival
    function animateHeroEntrance() {
        // Animate subtitle, title, phrases, buttons
        gsap.from(".hero-subtitle", {
            opacity: 0,
            y: -30,
            duration: 1.2,
            ease: "power3.out",
            delay: 0.5
        });

        gsap.from(".hero-title", {
            opacity: 0,
            scale: 0.9,
            duration: 1.5,
            ease: "back.out(1.7)",
            delay: 0.8
        });

        gsap.from(".gold-divider", {
            width: 0,
            duration: 1.0,
            ease: "power2.out",
            delay: 1.2
        });

        gsap.from([".hero-phrase", ".hero-date"], {
            opacity: 0,
            y: 30,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out",
            delay: 1.4
        });

        gsap.from(".hero-btns a", {
            opacity: 0,
            y: 20,
            scale: 0.8,
            duration: 1.0,
            stagger: 0.15,
            ease: "back.out(1.5)",
            delay: 1.8
        });

        // Small receptionist silhouette entrance
        gsap.from(".hero-receptionist", {
            opacity: 0,
            x: 50,
            rotation: 5,
            duration: 1.5,
            ease: "power2.out",
            delay: 2.2
        });
    }
}
