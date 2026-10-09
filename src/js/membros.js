import membrosData from '../data/membros.json';

(function () {
    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async function carregarMembros() {
        try {
            const list = membrosData.membros || [];
            return [...list].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        } catch (error) {
            console.error('Erro ao carregar membros:', error);
            return [];
        }
    }

    function renderizarMembro(membro) {
        return `
            <article class="card-membro">
                <div class="foto-container">
                    <img src="${escapeHtml(membro.foto)}" class="foto-membro" alt="Foto de ${escapeHtml(membro.nome)}">
                </div>
                <div class="membro-info">
                    <h3 class="nome-membro">${escapeHtml(membro.nome)}</h3>
                    <p class="cargo-membro">${escapeHtml(membro.cargo)}</p>
                    <p class="curso-membro">${escapeHtml(membro.curso)}</p>
                    <div class="membro-redes">
                        <a href="${escapeHtml(membro.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                            <i class="bi bi-linkedin"></i>
                        </a>
                        <a href="${escapeHtml(membro.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                            <i class="bi bi-github"></i>
                        </a>
                        <a href="${escapeHtml(membro.lattes || '#')}" target="_blank" rel="noopener noreferrer" aria-label="Currículo Lattes" title="Currículo Lattes">
                            <i class="bi bi-mortarboard-fill"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    async function initMembros() {
        const gridContainer = document.querySelector('#membros .grid-membros');
        if (!gridContainer) return;

        const membros = await carregarMembros();
        if (membros.length === 0) {
            gridContainer.innerHTML = '<p style="text-align: center; width: 100%; color: var(--azul-texto-claro);">Nenhum membro encontrado.</p>';
            return;
        }

        gridContainer.innerHTML = membros.map(renderizarMembro).join('');

        // Re-iniciar a animação de scroll reveal para os novos cards
        if (window.ScrollReveal) {
            window.ScrollReveal().reveal('.card-membro', {
                delay: 200,
                distance: '50px',
                duration: 1000,
                easing: 'cubic-bezier(0.5, 0, 0, 1)',
                interval: 100
            });
        }
    }

    document.addEventListener('DOMContentLoaded', initMembros);
})();
