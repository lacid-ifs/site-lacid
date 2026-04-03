(function () {
    const NEWS_URL = 'news.json';
    let newsCache = null;

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getNewsDateLabel(dateString) {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function getNewsSlugFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    async function loadNews() {
        if (newsCache) {
            return newsCache;
        }

        const response = await fetch(NEWS_URL);
        if (!response.ok) {
            throw new Error('Não foi possível carregar o arquivo de notícias.');
        }

        const data = await response.json();
        newsCache = Array.isArray(data.news) ? data.news : [];
        return newsCache;
    }

    function renderFeaturedNewsItem(item) {
        return `
            <div class="noticias-conteudo">
                <span class="noticias-tag">
                    Notícias | <a href="noticias.html" class="link-ver-todas">Ver todas <i class="bi bi-arrow-right"></i></a>
                </span>
                <h2>${escapeHtml(item.homeTitle || item.title)}</h2>
                <p class="noticias-texto">${escapeHtml(item.homeSummary).replace(/\n\n/g, '<br><br>')}</p>
            </div>
            <a href="noticia-expandida.html?slug=${encodeURIComponent(item.slug)}" class="btn-saiba-mais">Saiba mais <i class="bi bi-arrow-right"></i></a>
        `;
    }

    function renderNewsList(newsItems) {
        const grouped = newsItems.reduce((accumulator, item) => {
            const label = getNewsDateLabel(item.publishedAt);
            if (!accumulator[label]) {
                accumulator[label] = [];
            }
            accumulator[label].push(item);
            return accumulator;
        }, {});

        return Object.entries(grouped)
            .map(([label, items]) => `
                <section class="grupo-noticias" data-news-group="${escapeHtml(label)}">
                    <h2 class="data-noticia">${escapeHtml(label)}</h2>
                    ${items.map((item) => `
                        <article class="item-noticia" data-news-title="${escapeHtml(item.title.toLowerCase())}" data-news-day="${new Date(item.publishedAt + 'T00:00:00').getDate()}">
                            <a href="noticia-expandida.html?slug=${encodeURIComponent(item.slug)}" class="link-noticia">${escapeHtml(item.title)}</a>
                        </article>
                    `).join('')}
                </section>
            `)
            .join('');
    }

    function renderNewsSections(sections) {
        return sections.map((section) => `
            <section class="bloco-texto">
                <h3 class="topico-texto">${escapeHtml(section.title)}</h3>
                ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
                ${Array.isArray(section.list) && section.list.length ? `
                    <ul class="lista-etapas">
                        ${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
                    </ul>
                ` : ''}
            </section>
        `).join('');
    }

    function renderNewsAttachments(attachments) {
        return `
            <div class="box-links">
                <h2 class="titulo-anexos">Anexos</h2>
                <ul class="lista-anexos">
                    ${attachments.map((attachment) => `
                        <li>
                            <a href="${escapeHtml(attachment.href)}" target="_blank">
                                <i class="bi ${escapeHtml(attachment.icon || 'bi-file-earmark-text')}"></i>
                                ${escapeHtml(attachment.label)}
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    function initNewsListAnimations(listRoot) {
        const items = listRoot.querySelectorAll('.item-noticia');
        if (!items.length) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -30px 0px'
        });

        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(item);
        });
    }

    function showNewsError(container, message) {
        if (!container) {
            return;
        }

        container.innerHTML = `<p class="noticias-texto">${escapeHtml(message)}</p>`;
    }

    function initNewsSearch(listRoot) {
        const input = document.querySelector('.input-busca');
        const button = document.querySelector('.btn-busca');
        const groups = Array.from(listRoot.querySelectorAll('.grupo-noticias'));

        if (!input || !button || !groups.length) {
            return;
        }

        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'mensagem-sem-resultados';
        emptyMessage.style.display = 'none';
        emptyMessage.style.textAlign = 'center';
        emptyMessage.style.padding = '40px';
        emptyMessage.style.fontFamily = "'AvantGarde-Medium', sans-serif";
        emptyMessage.style.fontSize = '1.2rem';
        emptyMessage.style.color = 'var(--azul-texto-claro)';
        emptyMessage.textContent = 'Nenhuma notícia encontrada.';
        listRoot.appendChild(emptyMessage);

        const applyFilter = () => {
            const searchTerm = input.value.toLowerCase().trim();
            let visibleCount = 0;

            groups.forEach((group) => {
                const items = Array.from(group.querySelectorAll('.item-noticia'));
                let groupHasVisibleItems = false;

                items.forEach((item) => {
                    const title = item.dataset.newsTitle || '';
                    const matches = !searchTerm || title.includes(searchTerm);
                    item.style.display = matches ? 'block' : 'none';
                    if (matches) {
                        groupHasVisibleItems = true;
                        visibleCount += 1;
                    }
                });

                group.style.display = groupHasVisibleItems ? 'block' : 'none';
            });

            emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
        };

        button.addEventListener('click', applyFilter);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                applyFilter();
            }
        });
        input.addEventListener('input', applyFilter);
    }

    function initCalendarFilter(listRoot) {
        const days = Array.from(document.querySelectorAll('.tabela-mes td'));
        const groups = Array.from(listRoot.querySelectorAll('.grupo-noticias'));

        if (!days.length || !groups.length) {
            return;
        }

        days.forEach((day) => {
            day.addEventListener('click', () => {
                const selectedDay = Number(day.textContent.trim());
                if (Number.isNaN(selectedDay)) {
                    return;
                }

                days.forEach((item) => item.classList.remove('dia-ativo'));
                day.classList.add('dia-ativo');

                groups.forEach((group) => {
                    const items = Array.from(group.querySelectorAll('.item-noticia'));
                    let groupHasVisibleItems = false;

                    items.forEach((item) => {
                        const matches = Number(item.dataset.newsDay) === selectedDay;
                        item.style.display = matches ? 'block' : 'none';
                        if (matches) {
                            groupHasVisibleItems = true;
                        }
                    });

                    group.style.display = groupHasVisibleItems ? 'block' : 'none';
                });
            });
        });
    }

    function initDetailInteractions() {
        const blocks = document.querySelectorAll('.bloco-texto');
        const sideBoxes = document.querySelectorAll('.box-links');

        if (blocks.length || sideBoxes.length) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            blocks.forEach((block, index) => {
                block.style.opacity = '0';
                block.style.transform = 'translateY(30px)';
                block.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(block);
            });

            sideBoxes.forEach((box, index) => {
                box.style.opacity = '0';
                box.style.transform = 'translateX(30px)';
                box.style.transition = `opacity 0.6s ease ${index * 0.2}s, transform 0.6s ease ${index * 0.2}s`;
                observer.observe(box);
            });
        }

        if (!document.querySelector('[data-reading-progress]')) {
            const progressBar = document.createElement('div');
            progressBar.setAttribute('data-reading-progress', 'true');
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 4px;
                background: linear-gradient(90deg, #F20612, #FBAEE2);
                z-index: 9999;
                transition: width 0.2s ease;
            `;
            document.body.appendChild(progressBar);

            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
                progressBar.style.width = `${scrolled}%`;
            });
        }

        const links = document.querySelectorAll('.lista-anexos a');
        links.forEach((link) => {
            link.addEventListener('click', () => {
                link.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 200);
            });
        });

        if (!document.querySelector('[data-back-to-top]')) {
            const button = document.createElement('button');
            button.setAttribute('data-back-to-top', 'true');
            button.innerHTML = '↑';
            button.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #F20612;
                color: white;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease, transform 0.3s ease;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            `;
            document.body.appendChild(button);

            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    button.style.opacity = '1';
                    button.style.transform = 'scale(1)';
                } else {
                    button.style.opacity = '0';
                    button.style.transform = 'scale(0.8)';
                }
            });

            button.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            button.addEventListener('mouseenter', () => {
                button.style.backgroundColor = '#FBAEE2';
                button.style.transform = 'scale(1.1)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.backgroundColor = '#F20612';
                if (window.pageYOffset > 300) {
                    button.style.transform = 'scale(1)';
                }
            });
        }
    }

    async function initHomeNews() {
        const featuredContainer = document.querySelector('[data-news-featured]');
        if (!featuredContainer) {
            return;
        }

        try {
            const news = await loadNews();
            const featuredItem = news[0];

            if (!featuredItem) {
                showNewsError(featuredContainer, 'Nenhuma notícia disponível no momento.');
                return;
            }

            featuredContainer.innerHTML = renderFeaturedNewsItem(featuredItem);
        } catch (error) {
            showNewsError(featuredContainer, `${error.message} Use um servidor local para carregar o JSON.`);
        }
    }

    async function initNewsListPage() {
        const listContainer = document.querySelector('[data-news-list]');
        if (!listContainer) {
            return;
        }

        try {
            const news = await loadNews();
            listContainer.innerHTML = renderNewsList(news);
            initNewsSearch(listContainer);
            initCalendarFilter(listContainer);
            initNewsListAnimations(listContainer);
        } catch (error) {
            showNewsError(listContainer, `${error.message} Use um servidor local para carregar o JSON.`);
        }
    }

    async function initNewsDetailPage() {
        const contentContainer = document.querySelector('[data-news-detail-content]');
        const attachmentsContainer = document.querySelector('[data-news-detail-attachments]');

        if (!contentContainer || !attachmentsContainer) {
            return;
        }

        try {
            const news = await loadNews();
            const slug = getNewsSlugFromUrl();
            const currentItem = news.find((item) => item.slug === slug) || news[0];

            if (!currentItem) {
                showNewsError(contentContainer, 'Notícia não encontrada.');
                return;
            }

            document.title = `${currentItem.title} - LACID`;
            const detailTitleLines = Array.isArray(currentItem.detailTitleLines) && currentItem.detailTitleLines.length
                ? currentItem.detailTitleLines
                : [currentItem.title];
            contentContainer.innerHTML = `
                <h1 class="titulo-principal-noticia">${detailTitleLines.map((line) => escapeHtml(line)).join('<br>')}</h1>
                <p class="subtitulo-noticia"><em>${escapeHtml(currentItem.subtitle)}</em></p>
                ${renderNewsSections(currentItem.sections || [])}
            `;
            attachmentsContainer.innerHTML = renderNewsAttachments(currentItem.attachments || []);
            initDetailInteractions();
        } catch (error) {
            showNewsError(contentContainer, `${error.message} Use um servidor local para carregar o JSON.`);
        }
    }

    async function initNewsComponents() {
        await Promise.all([
            initHomeNews(),
            initNewsListPage(),
            initNewsDetailPage()
        ]);
    }

    document.addEventListener('DOMContentLoaded', initNewsComponents);
})();