/* =========================================
   1. THEME SWITCHER LOGIC
   ========================================= */
const themes = ['light', 'dark', 'green', 'violet'];
const themeBtn = document.getElementById('theme-btn');
const themeIcon = themeBtn.querySelector('i');

function getCurrentThemeIndex() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    return themes.indexOf(current);
}

function updateIcon(theme) {
    themeIcon.className = ''; 
    if (theme === 'light') themeIcon.classList.add('fa-solid', 'fa-sun');
    else if (theme === 'dark') themeIcon.classList.add('fa-solid', 'fa-moon');
    else if (theme === 'green') themeIcon.classList.add('fa-solid', 'fa-terminal');
    else if (theme === 'violet') themeIcon.classList.add('fa-solid', 'fa-bolt');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateIcon(theme);
    
    // Update particles immediately when theme changes
    updateParticleColor();
}

themeBtn.addEventListener('click', () => {
    const currentIndex = getCurrentThemeIndex();
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
});

// Load saved theme
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
})();


/* =========================================
   2. PARTICLE NETWORK ANIMATION
   ========================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let currentColor = 'rgba(0,0,0,0.1)'; // Default

const config = {
    particleCount: 80,
    connectionDistance: 150,
    mouseDistance: 200,
    speed: 0.8 // Increased speed slightly for visibility
};

let mouse = { x: null, y: null };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}
window.addEventListener('resize', resize);

// Optimized: Only gets color when called, not every frame
function updateParticleColor() {
    const styles = getComputedStyle(document.documentElement);
    currentColor = styles.getPropertyValue('--particle-color').trim();
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.speed;
        this.vy = (Math.random() - 0.5) * config.speed;
        this.size = Math.random() * 2 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < config.mouseDistance) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (config.mouseDistance - distance) / config.mouseDistance;
                const directionX = forceDirectionX * force * 2;
                const directionY = forceDirectionY * force * 2;
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }

    draw() {
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
    updateParticleColor(); // Ensure color is set on init
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = 1 - (distance / config.connectionDistance);
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Start
resize();
animate();