document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('active');
            mobileMenuToggle.classList.toggle('is-open', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
        });
    }

    document.querySelectorAll('.main-nav .has-submenu > a').forEach(link => {
        link.setAttribute('aria-expanded', 'false');
        link.addEventListener('click', event => {
            if (!window.matchMedia('(max-width: 992px)').matches) return;

            event.preventDefault();
            const menuItem = link.parentElement;
            const isExpanded = menuItem.classList.toggle('is-expanded');
            link.setAttribute('aria-expanded', String(isExpanded));
        });
    });

    // Sticky Header
    // Sticky Header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    // Load Sectors if container exists
    const sectorsContainer = document.getElementById('sectors-container');
    if (sectorsContainer) {
        fetch('/api/sectors')
            .then(response => response.json())
            .then(sectors => {
                sectorsContainer.innerHTML = sectors.map(s => `
                    <div class="sector-item">
                        <i class="${s.icon_class}"></i>
                        <span>${s.name}</span>
                    </div>
                `).join('');
            })
            .catch(err => console.error('Error loading sectors:', err));
    }

    // Close Welcome Bar
    const closeWelcomeBtn = document.getElementById('closeWelcome');
    const welcomeBar = document.getElementById('welcomeBar');
    if (closeWelcomeBtn && welcomeBar) {
        closeWelcomeBtn.addEventListener('click', () => {
            welcomeBar.style.display = 'none';
        });
    }

    // Hero Switch Logic Removed

    // Recent Quotes Widget (Mock Data)
    const quotesContainer = document.getElementById('recent-quotes-container');
    if (quotesContainer) {
        const mockQuotes = [
            { title: 'Rénovation toiture', location: 'Namur', date: 'Il y a 2h' },
            { title: 'Développement Site Web', location: 'Bruxelles', date: 'Il y a 4h' },
            { title: 'Installation Chauffage', location: 'Liège', date: 'Il y a 5h' },
            { title: 'Peinture Façade', location: 'Charleroi', date: 'Il y a 1h' },
            { title: 'Jardinage', location: 'Mons', date: 'Il y a 30min' }
        ];

        let index = 0;

        function renderQuote() {
            const quote = mockQuotes[index];
            quotesContainer.innerHTML = `
                <div class="request-item">
                    <div class="request-info">
                        <strong>${quote.title}</strong>
                        <span>${quote.location}</span>
                    </div>
                    <div class="request-time">${quote.date}</div>
                </div>
            `;
            index = (index + 1) % mockQuotes.length;
        }

        renderQuote();
        setInterval(renderQuote, 4000); // Change every 4 seconds
    }
});
