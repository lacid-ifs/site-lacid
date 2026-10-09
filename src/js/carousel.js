import carouselData from '../data/carousel.json';

export async function initCarousel() {
    const track = document.getElementById('track');
    const container = document.querySelector('.carousel-container');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!track || !container || !dotsContainer) return;

    try {
        const slidesData = carouselData.slides || [];
        if (slidesData.length === 0) return;

        track.innerHTML = slidesData.map(slide => 
            `<img src="${slide.src}" class="slide" alt="${slide.alt}" loading="lazy">`
        ).join('');

        dotsContainer.innerHTML = slidesData.map((_, index) => 
            `<span class="dot${index === 0 ? ' active' : ''}"></span>`
        ).join('');

        const slides = Array.from(track.children);
        const dots = document.querySelectorAll('.dot');
        const originalCount = slides.length;

        slides.forEach(slide => {
            const clone = slide.cloneNode(true);
            track.appendChild(clone);
        });

        let currentPos = 0;
        let isPaused = true;
        let isStarting = true;
        const speed = 0.6;
        let animationId;

        function updateDots() {
            if (!dots.length) return;
            const slideWidth = slides[0].offsetWidth;
            if (slideWidth === 0) return;
            const exactIndex = Math.abs(currentPos) / slideWidth;
            const targetIndex = Math.round(exactIndex) % originalCount;
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === targetIndex);
            });
        }

        function animate() {
            if (!isPaused) {
                currentPos -= speed;
                const totalWidth = slides[0].offsetWidth * originalCount;
                if (Math.abs(currentPos) >= totalWidth) {
                    currentPos = 0;
                }
                track.style.transform = `translateX(${currentPos}px)`;
                updateDots();
            }
            animationId = requestAnimationFrame(animate);
        }

        function snapToImage() {
            if (isStarting) return;
            isPaused = true;
            const slideWidth = slides[0].offsetWidth;
            const exactIndex = Math.abs(currentPos) / slideWidth;
            const targetIndex = Math.round(exactIndex);
            
            currentPos = -(targetIndex * slideWidth);
            track.classList.add('snapping');
            track.style.transform = `translateX(${currentPos}px)`;
            updateDots();
        }

        function resumeAnimation() {
            if (isStarting) return;
            track.classList.remove('snapping');
            isPaused = false;
        }

        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isStarting) {
                    isStarting = false;
                }
                const slideWidth = slides[0].offsetWidth;
                currentPos = -(index * slideWidth);
                track.classList.add('snapping');
                track.style.transform = `translateX(${currentPos}px)`;
                updateDots();
            });
        });

        container.addEventListener('mouseenter', snapToImage);
        container.addEventListener('mouseleave', resumeAnimation);

        animate();

        setTimeout(() => {
            isStarting = false;
            isPaused = false;
        }, 2000);

        window.addEventListener('resize', () => {
            if (!isPaused) {
                currentPos = 0;
            }
        });

    } catch (error) {
        console.error('Erro ao inicializar o carrossel dinâmico:', error);
        const slides = Array.from(track.children);
        if (slides.length > 0) {
            let currentPos = 0;
            function animateFallback() {
                track.style.transform = `translateX(0px)`;
            }
            animateFallback();
        }
    }
}
