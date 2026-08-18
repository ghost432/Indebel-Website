document.addEventListener("DOMContentLoaded", function () {
    const headerPlaceholder = document.getElementById("header-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    const headerSrc = headerPlaceholder?.getAttribute("data-src") || "/components/header.html";
    const footerSrc = footerPlaceholder?.getAttribute("data-src") || "/components/footer.html";

    loadComponent("header-placeholder", headerSrc, setupHeader);
    loadComponent("footer-placeholder", footerSrc, setupFooter);
});

function loadComponent(elementId, filePath, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error("Component not found");
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
            if (callback) callback();
        })
        .catch(err => console.error(`Error loading ${elementId}:`, err));
}

function setupHeader() {
    // 1. Highlight the current page and its parent navigation section.
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkPath = href.split('?')[0];
        const isCurrentPage = linkPath && linkPath !== '#' && linkPath === currentPath;

        link.classList.toggle('active', isCurrentPage);
        link.parentElement.classList.toggle('active', isCurrentPage);
        if (isCurrentPage) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    document.querySelectorAll('.main-nav .has-submenu').forEach(menuItem => {
        const hasCurrentChild = Array.from(menuItem.querySelectorAll('.submenu a')).some(link => {
            const href = link.getAttribute('href') || '';
            return href.split('?')[0] === currentPath;
        });
        const trigger = menuItem.querySelector(':scope > a');

        menuItem.classList.toggle('active', hasCurrentChild);
        trigger?.classList.toggle('active', hasCurrentChild);
        if (hasCurrentChild) trigger?.setAttribute('aria-current', 'page');
    });

    // 1b. Identify the active audience space in the top selector.
    document.querySelectorAll('.top-audience .nav-role-link[href]').forEach(link => {
        const linkPath = (link.getAttribute('href') || '').split('?')[0];
        const isActive = linkPath === currentPath;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });

    // 2. Mobile Menu Toggle Logic (Re-attach listeners since header is dynamic)
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', function () {
            const isOpen = mainNav.classList.toggle('active');
            this.classList.toggle('is-open', isOpen);
            this.setAttribute('aria-expanded', String(isOpen));
            this.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
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

    // 3. Welcome Bar Close Logic
    const closeWelcome = document.getElementById('closeWelcome');
    const welcomeBar = document.getElementById('welcomeBar');
    if (closeWelcome && welcomeBar) {
        closeWelcome.addEventListener('click', () => {
            welcomeBar.style.display = 'none';
        });
    }

    // 4. Keep the navigation background consistent with the page hero.
    syncHeaderBackground();

    // 5. Scroll Listener for Sticky Header
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Init on load
}

function handleHeaderScroll() {
    const headerWrapper = document.querySelector('.header-wrapper');
    if (headerWrapper) {
        if (window.scrollY > 50) {
            headerWrapper.classList.add('scrolled');
        } else {
            headerWrapper.classList.remove('scrolled');
        }
    }
}

function setupFooter() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    const currentPath = window.location.pathname;
    document.querySelectorAll('.main-footer .footer-links a[href]').forEach(link => {
        const href = link.getAttribute('href') || '';
        const isInternalLink = href.startsWith('/');
        const isCurrentPage = isInternalLink && href.split('?')[0] === currentPath;

        link.classList.toggle('active', isCurrentPage);
        if (isCurrentPage) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function syncHeaderBackground() {
    const hero = document.querySelector([
        'main > .hero-section',
        'main > .hero-banner',
        'main > .page-header',
        'main > .page-hero',
        'main > .blog-hero',
        'main > .article-hero',
        'main > .label-hero',
        'main > .city-hero',
        'main > .contact-hero',
        'main > section'
    ].join(','));
    const heroBackgroundLayer = document.querySelector('.hero-absolute-bg');

    const heroBackground = heroBackgroundLayer
        ? window.getComputedStyle(heroBackgroundLayer).backgroundColor
        : (hero ? window.getComputedStyle(hero).backgroundColor : '');
    const pageBackground = window.getComputedStyle(document.body).backgroundColor;
    const background = heroBackground && heroBackground !== 'rgba(0, 0, 0, 0)'
        ? heroBackground
        : pageBackground;

    if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
        document.documentElement.style.setProperty('--page-hero-background', background);
    }
}
