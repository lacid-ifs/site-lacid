// ============================================
// LACID - SCRIPT GLOBAL
// Funções reutilizáveis para todo o site
// ============================================

/**
 * Cria um elemento de loading/spinner
 */
function mostrarLoading() {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(254, 247, 233, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 60px;
        height: 60px;
        border: 5px solid #FBAEE2;
        border-top: 5px solid #F20612;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    `;
    
    loading.appendChild(spinner);
    document.body.appendChild(loading);
    
    // Adiciona a animação de spin
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Remove o loading
 */
function esconderLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
        loading.style.opacity = '0';
        setTimeout(() => loading.remove(), 300);
    }
}

/**
 * Formata datas no padrão brasileiro
 */
function formatarData(data) {
    const opcoes = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(data).toLocaleDateString('pt-BR', opcoes);
}

/**
 * Valida email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Copia texto para área de transferência
 */
async function copiarParaClipboard(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        return true;
    } catch (err) {
        console.error('Erro ao copiar:', err);
        return false;
    }
}

/**
 * Debounce - útil para otimizar eventos como scroll e resize
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Detecta se o elemento está visível na viewport
 */
function isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Adiciona classe de animação quando elemento entra na viewport
 */
function animateOnScroll() {
    const elements = document.querySelectorAll('[data-animate]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationType = entry.target.getAttribute('data-animate');
                entry.target.classList.add(animationType);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => observer.observe(element));
}

/**
 * Configura todos os links externos para abrir em nova aba
 */
function configurarLinksExternos() {
    const links = document.querySelectorAll('a[href^="http"]');
    links.forEach(link => {
        if (!link.hostname.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }
    });
}

/**
 * Adiciona efeito de ripple em botões
 */
function addRippleEffect() {
    const buttons = document.querySelectorAll('button, .btn-card-branco, .btn-saiba-mais, .btn-aba-lateral');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                animation: ripple-animation 0.6s ease-out;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            
            if (!document.querySelector('[data-ripple-style]')) {
                style.setAttribute('data-ripple-style', '');
                document.head.appendChild(style);
            }
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Inicializa funções globais quando o DOM estiver pronto
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        configurarLinksExternos();
        animateOnScroll();
        addRippleEffect();
    });
} else {
    configurarLinksExternos();
    animateOnScroll();
    addRippleEffect();
}

// Exporta funções para uso global
window.LACID = {
    mostrarLoading,
    esconderLoading,
    formatarData,
    validarEmail,
    copiarParaClipboard,
    debounce,
    isElementVisible
};

// ============================================
// EASTER EGG - Confetti ao clicar no logo
// ============================================
const logoLACID = document.querySelector('.logo-imagem');

if (logoLACID) {
    let clickCount = 0;
    
    logoLACID.addEventListener('click', function() {
        clickCount++;
        
        if (clickCount >= 3) {
            criarConfetti();
            clickCount = 0;
        }
    });
}

function criarConfetti() {
    const cores = ['#F20612', '#1369D0', '#7280ED', '#FBAEE2'];
    const quantidade = 50;
    
    for (let i = 0; i < quantidade; i++) {
        const confetti = document.createElement('div');
        const cor = cores[Math.floor(Math.random() * cores.length)];
        const tamanho = Math.random() * 10 + 5;
        const posX = Math.random() * window.innerWidth;
        const delay = Math.random() * 0.3;
        const duration = Math.random() * 2 + 2;
        
        confetti.style.cssText = `
            position: fixed;
            width: ${tamanho}px;
            height: ${tamanho}px;
            background: ${cor};
            left: ${posX}px;
            top: -20px;
            z-index: 99999;
            border-radius: 50%;
            pointer-events: none;
            animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
    
    // Adiciona animação de queda
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confetti-fall {
            to {
                transform: translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg);
                opacity: 0;
            }
        }
    `;
    
    if (!document.querySelector('[data-confetti-style]')) {
        style.setAttribute('data-confetti-style', '');
        document.head.appendChild(style);
    }
}

// ============================================
// MODO ACESSIBILIDADE - Aumentar fonte
// ============================================
let fonteAumentada = false;

function toggleTamanhoFonte() {
    if (!fonteAumentada) {
        document.body.style.fontSize = '1.15em';
        fonteAumentada = true;
    } else {
        document.body.style.fontSize = '';
        fonteAumentada = false;
    }
}

// Atalho de teclado: Ctrl + +
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        toggleTamanhoFonte();
    }
});

