// 15 Anos Márcia Gorete — A Bela e a Fera
// Performance-Optimized Custom Cursor & Gold Particle Trail (Canvas-based)

export function initCustomCursor() {
    // Check if device has touch capability to avoid adding unnecessary events on mobile
    if (window.matchMedia("(max-width: 991.98px)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
        return;
    }

    // 1. Create and position the main cursor elements in DOM if they don't exist
    let cursor = document.getElementById('custom-cursor');
    let glow = document.querySelector('.cursor-glow');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);
    }
    if (!glow) {
        glow = document.createElement('div');
        glow.className = 'cursor-glow';
        document.body.appendChild(glow);
    }

    // 2. Create the trail Canvas overlay
    const canvas = document.createElement('canvas');
    canvas.id = 'cursor-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let targetMouse = { x: 0, y: 0 };

    // Resize canvas on window changes
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse coordinates
    document.addEventListener('mousemove', (e) => {
        targetMouse.x = e.clientX;
        targetMouse.y = e.clientY;

        // Position core elements immediately (hardware-accelerated translations)
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;

        // Spawn gold dust particles
        if (Math.random() < 0.4) {
            particles.push(new Particle(e.clientX, e.clientY));
        }
    });

    // Particle constructor
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            // Spread slightly around cursor
            this.vx = (Math.random() - 0.5) * 1.2;
            this.vy = (Math.random() - 0.5) * 1.2 - 0.5; // Slight upward draft (fairy dust)
            this.alpha = 1.0;
            this.decay = Math.random() * 0.02 + 0.015;
            this.size = Math.random() * 2.5 + 0.8;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            // Radial gold glow style
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(212, 175, 55, ${this.alpha})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#d4af37';
            ctx.fill();
            ctx.restore();
        }
    }

    // Smooth lerp (linear interpolation) for the lagging cursor outer ring
    let glowX = 0;
    let glowY = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update lag ring coordinates
        glowX += (targetMouse.x - glowX) * 0.15;
        glowY += (targetMouse.y - glowY) * 0.15;
        glow.style.left = `${glowX}px`;
        glow.style.top = `${glowY}px`;

        // Render and prune particle array
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            } else {
                particles[i].draw();
            }
        }

        requestAnimationFrame(animate);
    }
    animate();

    // 3. Magnify effects when hovering interactive elements
    const clickables = 'a, button, [role="button"], .pix-card, .gallery-item, .select-gift-btn, input, textarea, select';
    
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(clickables)) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
            cursor.style.backgroundColor = 'var(--color-rose-red)';
            cursor.style.boxShadow = '0 0 15px var(--color-rose-red)';
            glow.style.transform = 'translate(-50%, -50%) scale(1.4)';
            glow.style.borderColor = 'var(--color-rose-red)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(clickables)) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'var(--color-gold-primary)';
            cursor.style.boxShadow = '0 0 10px var(--color-gold-primary), 0 0 20px var(--color-gold-primary)';
            glow.style.transform = 'translate(-50%, -50%) scale(1)';
            glow.style.borderColor = 'var(--color-gold-primary)';
        }
    });
}
