document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader Logic
    const preloader = document.getElementById('preloader');
    const loaderBar = document.getElementById('loader-bar');
    const loaderPercentage = document.getElementById('loader-percentage');
    const body = document.body;

    if (preloader) {
        const loaderVideo = document.getElementById('loader-video');
        
        // Ensure video plays (crucial for some mobile browsers)
        if (loaderVideo) {
            loaderVideo.play().catch(error => {
                console.log("Autoplay was prevented. Waiting for interaction or browser policy change.");
            });
        }

        let progress = 0;
        const interval = setInterval(() => {
            // Simulated loading progress
            progress += Math.floor(Math.random() * 5) + 1;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Finalize loading
                setTimeout(() => {
                    preloader.classList.add('fade-out');
                    body.classList.remove('loading');
                }, 500);
            }
            
            // Update UI
            loaderBar.style.width = `${progress}%`;
            loaderPercentage.innerText = `${progress}%`;
            
        }, 100);
    }
    // 1. Smooth Navigation and Active State
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const header = document.querySelector('.top-header');

    // Smooth scrolling to section
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const headerHeight = header ? header.offsetHeight : 0;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50; // offset a bit
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            // the link href is like "#nosotros", so we substring to get "nosotros"
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
        
        // Add scrolled class to header for blur effect
        if (window.pageYOffset > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Glitch Effect on Hero Text
    const glitchText = document.querySelector('.glitch');
    if (glitchText) {
        setInterval(() => {
            const randomX = (Math.random() - 0.5) * 10;
            const randomY = (Math.random() - 0.5) * 10;
            const randomSkew = (Math.random() - 0.5) * 20;

            if (Math.random() > 0.8) {
                glitchText.style.transform = `translate(${randomX}px, ${randomY}px) skewX(${randomSkew}deg)`;
                glitchText.style.textShadow = `
                    ${(Math.random() - 0.5) * 20}px ${(Math.random() - 0.5) * 20}px 0 rgba(100,100,100,0.8),
                    ${(Math.random() - 0.5) * 20}px ${(Math.random() - 0.5) * 20}px 0 rgba(255,255,255,0.4)
                `;
                
                setTimeout(() => {
                    glitchText.style.transform = 'translate(0, 0) skewX(0)';
                    glitchText.style.textShadow = '0 0 40px rgba(0,0,0,1)';
                }, 100);
            }
        }, 2000);
    }

    // 3. Animar separadores (hr) al hacer scroll
    const dividers = document.querySelectorAll('.section-divider');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                // Removemos la clase si queremos que la animación se repita cada vez que entramos
                entry.target.classList.remove('active');
            }
        });
    }, { 
        threshold: 0.01,
        rootMargin: '0px 0px -50px 0px' // Activa un poco antes de salir/entrar
    });

    dividers.forEach(divider => {
        observer.observe(divider);
    });

    // 4. Parallax / 3D Tilt Effect for Hero Shirts
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(el => {
        const wrapper = el.querySelector('.shirt-wrapper');
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            const rotateX = -(y / rect.height) * 40; 
            const rotateY = (x / rect.width) * 40;  
            
            wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        el.addEventListener('mouseleave', () => {
            wrapper.style.transform = `rotateX(0) rotateY(0)`;
        });
    });

    // 5. Reusable Infinite Carousel Function
    function initCarousel(trackId, prevBtnId, nextBtnId) {
        const track = document.getElementById(trackId);
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);
        
        if (!track || !prevBtn || !nextBtn) return;

        let items = Array.from(track.children);
        const itemCount = items.length;
        let currentIndex = 0;
        let isTransitioning = false;

        // Clone items for infinite loop
        const clonesToStart = items.slice(-3).map(el => el.cloneNode(true));
        const clonesToEnd = items.slice(0, 3).map(el => el.cloneNode(true));
        
        clonesToStart.reverse().forEach(clone => track.prepend(clone));
        clonesToEnd.forEach(clone => track.append(clone));

        // Initial Position
        currentIndex = 3; 
        updatePosition(false);

        function updatePosition(transition = true) {
            if (!transition) track.style.transition = 'none';
            else track.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            
            const viewportWidth = track.parentElement.offsetWidth;
            const isMobile = window.innerWidth <= 900;
            
            // Calculamos el ancho basado en las nuevas proporciones: 100% en móvil (1 en 1), 40% en escritorio
            const itemWidth = isMobile ? viewportWidth * 1.0 : viewportWidth * 0.4;
            const gap = 30;
            
            const centerOffset = (viewportWidth - itemWidth) / 2;
            const offset = (currentIndex * (itemWidth + gap)) - centerOffset;
            
            track.style.transform = `translateX(-${offset}px)`;
        }

        function next() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            updatePosition();
        }

        function prev() {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            updatePosition();
        }

        track.addEventListener('transitionend', () => {
            isTransitioning = false;
            if (currentIndex >= itemCount + 3) {
                currentIndex = 3;
                updatePosition(false);
            }
            if (currentIndex <= 0) {
                currentIndex = itemCount;
                updatePosition(false);
            }
        });

        nextBtn.addEventListener('click', () => {
            next();
            resetAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            prev();
            resetAutoPlay();
        });

        let autoPlayInterval = setInterval(next, 5000);

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(next, 5000);
        }

        window.addEventListener('resize', () => {
            updatePosition(false);
        });
    }

    // Initialize Carousels
    initCarousel('carouselTrack', 'prevBtn', 'nextBtn'); // Colección
    initCarousel('accTrack', 'accPrevBtn', 'accNextBtn'); // Accesorios
});

