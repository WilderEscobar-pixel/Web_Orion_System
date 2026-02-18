/* ===================================================
   ORION SYSTEMS — Main JavaScript
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========== NAVBAR SCROLL ==========
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ========== MOBILE MENU ==========
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ========== SCROLL ANIMATIONS (Intersection Observer) ==========
    const animElements = document.querySelectorAll('.anim-fade-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    animElements.forEach(el => observer.observe(el));

    // ========== COUNTER ANIMATION ==========
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                const duration = 2000;
                const start = performance.now();

                const animate = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target);
                    if (progress < 1) requestAnimationFrame(animate);
                };

                requestAnimationFrame(animate);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ========== FAQ ACCORDION ==========
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) item.classList.add('active');

            // Update aria
            question.setAttribute('aria-expanded', !isActive);
        });
    });

    // ========== NICHE TOGGLE ==========
    window.toggleOtherNiche = (select) => {
        const wrapper = document.getElementById('otherNicheWrapper');
        if (!wrapper) return;
        if (select.value === 'Otro') {
            wrapper.style.display = 'block';
            wrapper.querySelector('input').setAttribute('required', 'true');
        } else {
            wrapper.style.display = 'none';
            wrapper.querySelector('input').removeAttribute('required');
        }
    };

    // ========== AUDIT MODAL ==========
    const modal = document.getElementById('auditModal');
    const auditForm = document.getElementById('auditForm');
    const modalSuccess = document.getElementById('modalSuccess');

    const openModal = () => {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        // Reset after animation
        setTimeout(() => {
            if (auditForm) { auditForm.style.display = ''; auditForm.reset(); }
            if (modalSuccess) modalSuccess.style.display = 'none';
        }, 300);
    };

    // Open triggers (safe — checks if element exists)
    ['openAuditBtn', 'heroAuditBtn', 'ctaAuditBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    });

    // Close triggers
    const closeBtn = document.getElementById('closeModal');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);
    if (modal) {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
    }



    // Form submission
    if (auditForm) {
        auditForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form Validation Highlight (User requested animation)
            const requiredFields = auditForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('input-error');
                    // Remove error on input
                    field.addEventListener('input', () => field.classList.remove('input-error'), { once: true });
                } else {
                    field.classList.remove('input-error');
                }
            });

            if (!isValid) return;

            // Collect form data
            const formData = new FormData(auditForm);
            const data = Object.fromEntries(formData);

            // Handle checkboxes (dolores) as an array
            data.dolores = formData.getAll('dolores');

            // Send to Webhook
            try {
                // Change UI to Loading
                const submitBtn = auditForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando análisis...';

                const response = await fetch('http://localhost:5678/webhook/f1627009-af17-4d84-bb8e-f224d111febf', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    console.log('Webhook sent successfully');
                    // Show success
                    auditForm.style.display = 'none';
                    if (modalSuccess) modalSuccess.style.display = 'block';
                } else {
                    throw new Error('Server respondio con error');
                }
            } catch (error) {
                console.error('Error sending webhook:', error);
                // Even on error, we show success to the user (professional) but log the error
                auditForm.style.display = 'none';
                if (modalSuccess) modalSuccess.style.display = 'block';
            }
        });
    }

    // ========== CONTACT FORM (contact.html) ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Build WhatsApp message for redundancy (optional, but keep it if user likes it)
            const message = `📩 *Nuevo Mensaje de Contacto — Orion Systems*%0A%0A` +
                `👤 *Nombre:* ${data.name}%0A` +
                `📱 *Teléfono:* ${data.phone}%0A` +
                `📧 *Email:* ${data.email}%0A` +
                `🏢 *Empresa:* ${data.company || 'No especificado'}%0A` +
                `🎯 *Servicio:* ${data.service || 'No especificado'}%0A` +
                `💬 *Mensaje:* ${data.message}`;

            try {
                // Send to Webhook
                fetch('http://localhost:5678/webhook/f1627009-af17-4d84-bb8e-f224d111febf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (err) { console.error('Webhook error:', err); }

            window.open(`https://wa.me/584145072232?text=${message}`, '_blank');
            const successDiv = document.getElementById('contactSuccess');
            if (successDiv) {
                contactForm.style.display = 'none';
                successDiv.style.display = 'block';
            }
        });
    }

    // ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            if (target && target !== '#') {
                e.preventDefault();
                const el = document.querySelector(target);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // ========== PARALLAX PLANET (subtle) ==========
    const planet = document.querySelector('.hero-planet');
    if (planet) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                planet.style.transform = `translateX(-50%) translateY(${scrollY * 0.1}px)`;
            }
        }, { passive: true });
    }

    // ========== ACTIVE NAV LINK ON SCROLL ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link:not(.nav-cta)');

    const updateActiveLink = () => {
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinksAll.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href*="${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', updateActiveLink, { passive: true });
});
