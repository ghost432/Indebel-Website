(function () {
    const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    const API_BASE = isLocal ? 'http://localhost:5000/api' : 'https://pro.indebel.be/api';
    const DETAIL_BASE = isLocal ? 'http://localhost:5175/devis' : 'https://pro.indebel.be/devis';
    const LIMIT = 9;
    const GRID_ID = 'devisGrid';
    const SLIDER_ID = 'devisSlider';

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
    }

    function getAuthToken() {
        try {
            const keys = ['token', 'authToken', 'accessToken', 'indebel_token', 'jwt'];
            for (const key of keys) {
                const value = localStorage.getItem(key) || sessionStorage.getItem(key);
                if (value) return value.replace(/^Bearer\s+/i, '');
            }
        } catch (error) {}
        return null;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Date non spécifiée';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'Date invalide';
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function truncateText(text, maxLength = 132) {
        const value = String(text || '').trim();
        if (value.length <= maxLength) return value;
        return value.slice(0, maxLength).trim() + '…';
    }

    function createCard(devis) {
        const isUrgent = devis.urgence === 'urgent' || devis.urgence === 'tres_urgent';
        const urgencyClass = isUrgent ? 'devis-urgency-urgent' : 'devis-urgency-normal';
        const urgencyLabel = isUrgent ? 'Urgent' : 'Normal';
        const location = [devis.ville, devis.region].filter(Boolean).join(', ') || 'Belgique';
        const description = truncateText(devis.description || '', 132);
        const categorie = devis.categorie || devis.type_travaux || 'Travaux';
        const title = devis.type_travaux || 'Demande de devis';
        const detailUrl = `${DETAIL_BASE}/${devis.id}`;
        const budget = devis.budget_estime ? `${Number(devis.budget_estime).toLocaleString('fr-FR')} €` : 'Non communiqué';

        return `
            <article class="devis-card" onclick="window.location.href='${detailUrl}'" role="button" tabindex="0" aria-label="${escapeHtml(title)} - ${escapeHtml(location)}">
                <div class="devis-card-header">
                    <div class="devis-card-top-meta">
                        <span class="devis-card-category"><i class="fas fa-layer-group"></i> ${escapeHtml(categorie)}</span>
                        <span class="${urgencyClass}"><i class="fas fa-bolt"></i> ${urgencyLabel}</span>
                    </div>
                    <h3 class="devis-card-title">${escapeHtml(title)}</h3>
                    <div class="devis-card-location"><i class="fas fa-location-dot"></i>${escapeHtml(location)}</div>
                </div>
                <div class="devis-card-body">
                    <div style="margin-bottom: 8px; color: #c02525; font-weight: 800; font-size: 0.9rem;">Budget estimé: ${budget}</div>
                    <p class="devis-card-description"><strong>Description:</strong> ${escapeHtml(description)}</p>
                </div>
                <div class="devis-card-actions"><a href="${detailUrl}" onclick="event.stopPropagation()" class="devis-card-cta">Voir la demande</a></div>
                <div class="devis-card-footer">
                    <time class="devis-card-date"><i class="fas fa-calendar-alt"></i> ${formatDate(devis.date_souhaite)}</time>
                    <svg class="devis-card-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#044CF3" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>
                </div>
            </article>
        `;
    }

    function renderGrid(devis) {
        const grid = document.getElementById(GRID_ID);
        if (!grid) return;
        if (!devis || devis.length === 0) {
            grid.innerHTML = `<div class="devis-widget-empty" style="text-align:center;padding:3rem 1rem;color:#6b7280;grid-column:1/-1;width:100%;"><p style="font-size:1.125rem;font-weight:700;margin:0;color:#1f2937;">Aucune demande de devis disponible</p><p style="font-size:.875rem;margin-top:.5rem;">De nouvelles opportunités seront ajoutées bientôt.</p></div>`;
            return;
        }
        grid.innerHTML = devis.map(createCard).join('');
    }

    function renderSlider(devis) {
        const slider = document.getElementById(SLIDER_ID);
        if (!slider) return;
        if (!devis || devis.length === 0) {
            slider.innerHTML = `<div class="devis-widget-empty" style="text-align:center;padding:2rem;color:#6b7280;width:100%;">Aucune demande disponible.</div>`;
            return;
        }
        slider.innerHTML = devis.map(d => `<div class="devis-slide">${createCard(d)}</div>`).join('');
    }

    function renderError(message) {
        const errorHtml = `<div class="devis-widget-error" style="grid-column:1/-1;text-align:center;padding:2rem;color:#b91c1c;background:#fff1f2;border:1px solid #fecdd3;border-radius:18px;">Erreur de chargement : ${escapeHtml(message)}</div>`;
        const grid = document.getElementById(GRID_ID);
        const slider = document.getElementById(SLIDER_ID);
        if (grid) grid.innerHTML = errorHtml;
        if (slider) slider.innerHTML = errorHtml;
    }

    async function fetchDevis() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const token = getAuthToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            let response = await fetch(`${API_BASE}/devis/valides?limit=${LIMIT}`, { signal: controller.signal, headers }).catch(() => null);
            if (!response || !response.ok) {
                response = await fetch(`${API_BASE}/devis/valides?limit=${LIMIT}`, { signal: controller.signal, headers }).catch(() => null);
            }
            clearTimeout(timeoutId);
            if (response && response.ok) {
                const data = await response.json();
                if (data.success && Array.isArray(data.data)) return data.data.slice(0, LIMIT);
            }
            throw new Error('API indisponible');
        } catch (err) {
            console.error('API error:', err);
            renderError('Impossible de charger les données.');
            return [];
        }
    }

    function startAutoScroll() {
        const slider = document.getElementById(SLIDER_ID);
        if (!slider) return;
        let interval;
        const start = () => {
            if (window.innerWidth <= 768) {
                interval = setInterval(() => {
                    const slide = slider.querySelector('.devis-slide');
                    const step = slide ? slide.getBoundingClientRect().width + 16 : slider.clientWidth;
                    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 8) slider.scrollTo({ left: 0, behavior: 'smooth' });
                    else slider.scrollBy({ left: step, behavior: 'smooth' });
                }, 3000);
            }
        };
        const stop = () => clearInterval(interval);
        window.addEventListener('resize', () => { stop(); start(); });
        ['touchstart', 'mouseenter'].forEach(evt => slider.addEventListener(evt, stop));
        ['touchend', 'mouseleave'].forEach(evt => slider.addEventListener(evt, start));
        start();
    }

    async function init() {
        const devis = await fetchDevis();
        renderGrid(devis);
        renderSlider(devis);
        startAutoScroll();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
