import { initCarousel } from './carousel.js';

// ============================================
// NAVBAR ANIMADA NO SCROLL
// ============================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// SMOOTH SCROLL PARA NAVEGAÇÃO
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const setupReveal = (selector) => {
        document.querySelectorAll(selector).forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            const delay = (index % 6) * 0.1;
            card.style.transition = `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`;
            observer.observe(card);
        });
    };

    setupReveal('.card');        // Atividades
    setupReveal('.card-membro'); // Integrantes
}

// ============================================
// BOTÃO CONTATO - TOAST NOTIFICATION
// ============================================
function initContactToast() {
    const btnContato = document.querySelector('.btn-aba-lateral');
    if (!btnContato) return;

    btnContato.addEventListener('click', (e) => {
        e.preventDefault();
        const icone = '<i class="bi bi-envelope-at-fill" style="margin-right: 8px;"></i>';
        const mensagem = document.createElement('div');
        mensagem.innerHTML = icone + 'Entre em contato: lacid.ifs@gmail.com';
        mensagem.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: #1369D0;
            color: white;
            padding: 20px 30px;
            border-radius: 20px;
            font-family: 'AvantGarde-Medium', sans-serif;
            font-size: 1rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 3.5s forwards;
            display: flex;
            align-items: center;
        `;
        document.body.appendChild(mensagem);
        
        setTimeout(() => {
            mensagem.remove();
        }, 4000);
    });
}

// ============================================
// CARDS DE ATIVIDADES - INTERAÇÃO
// ============================================
function initActivityCards() {
    document.querySelectorAll('.card').forEach(card => {
        const btnSaibaMais = card.querySelector('.btn-card-branco');
        if (btnSaibaMais) {
            btnSaibaMais.addEventListener('click', (e) => {
                e.preventDefault();
                const tituloCard = card.querySelector('h3').textContent;
                const icone = '<i class="bi bi-info-circle-fill" style="margin-right: 8px;"></i>';
                const mensagem = document.createElement('div');
                mensagem.innerHTML = icone + `Em breve: Mais informações sobre ${tituloCard}!`;
                mensagem.style.cssText = `
                    position: fixed;
                    top: 100px;
                    right: 30px;
                    background: #1369D0;
                    color: white;
                    padding: 20px 30px;
                    border-radius: 20px;
                    font-family: 'AvantGarde-Medium', sans-serif;
                    font-size: 1rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                    z-index: 10000;
                    animation: slideInRight 0.5s ease, fadeOut 0.5s ease 3.5s forwards;
                    display: flex;
                    align-items: center;
                `;
                document.body.appendChild(mensagem);
                
                setTimeout(() => {
                    mensagem.remove();
                }, 4000);
            });
        }
    });
}


// ============================================
// HIDE NAVBAR ON FOOTER (UX IMPROVEMENT)
// ============================================
function initFooterObserver() {
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('.main-footer');
    if (!navbar || !footer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navbar.classList.add('navbar-hidden');
            } else {
                navbar.classList.remove('navbar-hidden');
            }
        });
    }, { threshold: 0.1 });

    observer.observe(footer);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initNavbarScroll();
    initSmoothScroll();
    initScrollReveal();
    initContactToast();
    initActivityCards();
    initFooterObserver();
});
