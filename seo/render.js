const { buildMetadata, SITE_URL } = require('./metadata');
const { indexableTrades, indexableLocalities, tradeBySlug, localityBySlug } = require('./catalog');

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));
}

function jsonLd(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('fr-BE', {
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
}

function breadcrumbSchema(items) {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem', position: index + 1, name: item.name, item: `${SITE_URL}${item.path}`
        }))
    };
}

function itemListSchema(items) {
    return {
        '@type': 'ItemList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem', position: index + 1, name: item.name, url: `${SITE_URL}${item.path}`
        }))
    };
}

function breadcrumbs(items) {
    return `<nav class="seo-breadcrumbs" aria-label="Fil d’Ariane"><ol>${items.map((item, index) => (
        `<li>${index === items.length - 1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${item.path}">${escapeHtml(item.name)}</a>`}</li>`
    )).join('')}</ol></nav>`;
}

function header() {
    return `<header class="seo-site-header">
        <div class="seo-welcome">Besoin d’un professionnel ? Trouvez-le sur Indebel.</div>
        <div class="container seo-nav-row">
            <a class="seo-logo" href="/" aria-label="Indebel, accueil"><img src="/images/logo.png" width="174" height="54" alt="Indebel"></a>
            <nav class="seo-main-nav" aria-label="Navigation principale">
                <a href="/">Accueil</a><a href="/construction/" aria-current="page">Construction</a><a href="/secteurs">Nos secteurs</a><a href="/how-it-works">Comment ça marche ?</a>
            </nav>
            <a class="btn btn-primary seo-header-cta" href="https://pro.indebel.be/demande-devis">Publier un projet</a>
            <details class="seo-mobile-menu"><summary aria-label="Ouvrir le menu"><span aria-hidden="true"></span></summary><nav aria-label="Navigation mobile"><a href="/">Accueil</a><a href="/construction/" aria-current="page">Construction</a><a href="/secteurs">Nos secteurs</a><a href="/how-it-works">Comment ça marche ?</a></nav></details>
        </div>
    </header>`;
}

function footer() {
    return `<footer class="seo-site-footer"><div class="container seo-footer-grid">
        <div><img src="/images/logo.png" width="150" height="47" alt="Indebel"><p>Trouvez le professionnel adapté à votre projet en Belgique.</p></div>
        <nav aria-label="Liens Construction"><strong>Construction</strong><a href="/construction/">Tous les métiers</a><a href="/construction/bruxelles/">Professionnels à Bruxelles</a><a href="/construction/liege/">Professionnels à Liège</a></nav>
        <nav aria-label="Liens utiles"><strong>Liens utiles</strong><a href="/faqs-particuliers">Aide</a><a href="/contact">Contact</a><a href="/politique-de-confidentialite">Confidentialité</a></nav>
    </div><div class="seo-footer-bottom">© ${new Date().getFullYear()} Indebel. Tous droits réservés.</div></footer>`;
}

function pageHead(metadata, schemas) {
    return `<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(metadata.title)}</title>
    <meta name="description" content="${escapeHtml(metadata.description)}">
    <meta name="robots" content="${metadata.robots}">
    <link rel="canonical" href="${metadata.canonical}">
    <meta property="og:locale" content="fr_BE"><meta property="og:type" content="${metadata.ogType}">
    <meta property="og:site_name" content="Indebel"><meta property="og:title" content="${escapeHtml(metadata.title)}">
    <meta property="og:description" content="${escapeHtml(metadata.description)}"><meta property="og:url" content="${metadata.canonical}">
    <meta property="og:image" content="${SITE_URL}/images/hero-artisan.jpg">
    <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(metadata.title)}">
    <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
    <link rel="icon" type="image/png" href="/images/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/construction-seo.css">
    <script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': schemas })}</script>`;
}

function layout({ metadata, schemas, body, pageClass }) {
    return `<!DOCTYPE html><html lang="fr"><head>${pageHead(metadata, schemas)}</head>
    <body class="construction-seo ${pageClass}">${header()}<main>${body}</main>${footer()}</body></html>`;
}

function demandCards(demands) {
    if (!demands.length) return '<p class="seo-empty-state">Aucune demande publique n’est attribuée avec assez de précision à cette page pour le moment. Vous pouvez néanmoins décrire votre propre projet.</p>';
    return `<div class="seo-demand-list">${demands.slice(0, 6).map((demand) => `<article class="seo-demand-card">
        <div><span class="seo-kicker">Demande publique</span><h3>${escapeHtml(demand.workType)}</h3></div>
        <p>${escapeHtml([demand.city, demand.region].filter(Boolean).join(' · '))}</p>
        ${formatDate(demand.createdAt) ? `<time datetime="${escapeHtml(demand.createdAt)}">Publiée le ${escapeHtml(formatDate(demand.createdAt))}</time>` : ''}
    </article>`).join('')}</div>`;
}

function tradeCards(trades, locality) {
    return `<div class="seo-card-grid">${trades.map((trade) => {
        const href = locality ? `/construction/${trade.slug}/${locality.slug}/` : `/construction/${trade.slug}/`;
        const comboAvailable = !locality || ['plombier:bruxelles', 'electricien:bruxelles', 'chauffagiste:liege'].includes(`${trade.slug}:${locality.slug}`);
        const target = comboAvailable ? href : `/construction/${trade.slug}/`;
        return `<article class="seo-link-card"><span>${escapeHtml(trade.category)}</span><h3><a href="${target}">${escapeHtml(trade.seoName)}</a></h3><p>${escapeHtml(trade.scope?.[0] || trade.notes)}</p><a class="seo-arrow-link" href="${target}">Voir la page <span aria-hidden="true">→</span></a></article>`;
    }).join('')}</div>`;
}

function localityLinks(localities, trade) {
    return `<div class="seo-location-list">${localities.map((locality) => {
        const comboAvailable = trade && ['plombier:bruxelles', 'electricien:bruxelles', 'chauffagiste:liege'].includes(`${trade.slug}:${locality.slug}`);
        const path = comboAvailable ? `/construction/${trade.slug}/${locality.slug}/` : `/construction/${locality.slug}/`;
        return `<a href="${path}"><strong>${escapeHtml(locality.name)}</strong><span>${escapeHtml(locality.province)}</span></a>`;
    }).join('')}</div>`;
}

function faqSection(faqs) {
    return `<section class="seo-section seo-faq"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Questions fréquentes</span><h2>Bien préparer votre recherche</h2></div>
        <div class="seo-faq-list">${faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('')}</div>
    </div></section>`;
}

function faqSchema(faqs) {
    return { '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({
        '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    })) };
}

function nationalPage({ demands = [], indexable = true }) {
    const metadata = buildMetadata({ kind: 'national', indexable });
    const crumbs = [{ name: 'Accueil', path: '/' }, { name: 'Construction', path: '/construction/' }];
    const faqs = [
        { question: 'Comment trouver le bon professionnel pour mes travaux ?', answer: 'Décrivez le type de travaux, la localisation, le délai et l’état de l’existant. Indebel utilise ces informations pour orienter la demande vers les compétences pertinentes.' },
        { question: 'Puis-je demander plusieurs types de travaux ?', answer: 'Oui. Pour un projet qui combine plusieurs métiers, détaillez chaque lot afin que les professionnels comprennent le périmètre et les interfaces entre interventions.' },
        { question: 'Les coordonnées des demandeurs sont-elles publiques ?', answer: 'Non. Les pages Construction n’affichent que des informations publiques minimales sur les projets et ne publient ni email, ni téléphone, ni adresse privée.' }
    ];
    const body = `<section class="seo-hero seo-hero-national"><div class="container">${breadcrumbs(crumbs)}<div class="seo-hero-copy">
        <span class="seo-kicker">Rénovation & Construction</span><h1>Trouvez le professionnel adapté à vos travaux en Belgique</h1>
        <p>Plomberie, toiture, électricité, rénovation énergétique ou transformation complète : partez du métier réellement nécessaire et publiez un projet suffisamment précis pour recevoir des réponses pertinentes.</p>
        <div class="seo-actions"><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Décrire mon projet</a><a class="btn seo-secondary-button" href="#metiers">Explorer les métiers</a></div>
    </div><div class="seo-stat-row"><div><strong>${indexableTrades.length}</strong><span>métiers et services qualifiés</span></div><div><strong>${indexableLocalities.length}</strong><span>communes prioritaires dans ce lot</span></div><div><strong>581</strong><span>communes structurées, sans génération massive</span></div></div></div></section>
    <section class="seo-section" id="metiers"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Par métier</span><h2>Choisissez la compétence correspondant au chantier</h2><p>Chaque page décrit un périmètre de travaux distinct et évite les catégories trop vagues.</p></div>${tradeCards(indexableTrades)}</div></section>
    <section class="seo-section seo-band"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Par commune</span><h2>Principales zones du premier lot</h2><p>Seules les communes dotées d’un contenu local spécifique sont ouvertes à l’indexation.</p></div>${localityLinks(indexableLocalities)}</div></section>
    <section class="seo-section"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Demandes récentes</span><h2>Des projets publics, sans coordonnées personnelles</h2><p>Ces informations proviennent de l’API publique Indebel et sont limitées au type de travaux, à la commune et à la date.</p></div>${demandCards(demands)}</div></section>
    <section class="seo-section seo-process"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Fonctionnement</span><h2>Un parcours simple, centré sur le besoin</h2></div><ol><li><strong>Décrivez les travaux</strong><span>Contexte, photos, délai et budget indicatif.</span></li><li><strong>Choisissez la compétence</strong><span>Un métier précis limite les réponses hors sujet.</span></li><li><strong>Comparez les échanges</strong><span>Vérifiez le périmètre, les assurances et les conditions.</span></li></ol></div></section>
    ${faqSection(faqs)}<section class="seo-cta"><div class="container"><div><span class="seo-kicker">Votre projet</span><h2>Expliquez ce qui doit être réalisé</h2><p>Une demande claire est le meilleur point de départ pour identifier le bon professionnel.</p></div><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Publier une demande</a></div></section>`;
    const schemas = [
        { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: 'Indebel', url: `${SITE_URL}/`, logo: `${SITE_URL}/images/logo.png` },
        { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'Indebel', publisher: { '@id': `${SITE_URL}/#organization` }, inLanguage: 'fr-BE' },
        breadcrumbSchema(crumbs),
        itemListSchema(indexableTrades.map((trade) => ({ name: trade.seoName, path: `/construction/${trade.slug}/` }))),
        faqSchema(faqs)
    ];
    return layout({ metadata, schemas, body, pageClass: 'seo-national-page' });
}

function tradePage({ trade, demands = [], indexable = true }) {
    const metadata = buildMetadata({ kind: 'trade', trade, indexable });
    const crumbs = [{ name: 'Accueil', path: '/' }, { name: 'Construction', path: '/construction/' }, { name: trade.seoName, path: metadata.path }];
    const related = (trade.related || []).map((slug) => tradeBySlug.get(slug)).filter((item) => item?.indexableByDefault);
    const faqs = [
        { question: `Quels travaux confier à un ${trade.seoName.toLowerCase()} ?`, answer: `Cette compétence couvre notamment : ${trade.scope.join(', ').toLowerCase()}. Le périmètre exact doit être confirmé dans la demande et le devis.` },
        { question: 'Quelles informations fournir pour obtenir une réponse pertinente ?', answer: 'Indiquez la commune, l’état de l’existant, les dimensions utiles, le délai souhaité et joignez des photos lorsque celles-ci aident à comprendre le chantier.' },
        { question: 'Comment comparer les propositions ?', answer: 'Comparez le périmètre inclus, les matériaux, le calendrier, les assurances et les conditions de paiement, pas uniquement le montant total.' }
    ];
    const body = `<section class="seo-hero"><div class="container">${breadcrumbs(crumbs)}<div class="seo-hero-copy"><span class="seo-kicker">${escapeHtml(trade.category)}</span><h1>${escapeHtml(trade.seoName)} en Belgique</h1><p>${escapeHtml(trade.intro)}</p><div class="seo-actions"><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Demander un devis</a><a class="btn seo-secondary-button" href="#travaux">Voir les travaux</a></div></div></div></section>
    <section class="seo-section" id="travaux"><div class="container seo-two-column"><div><div class="seo-section-heading"><span class="seo-kicker">Périmètre</span><h2>Travaux associés à cette compétence</h2><p>Le libellé source Indebel est « ${escapeHtml(trade.sourceName.trim())} ». La page utilise « ${escapeHtml(trade.seoName)} » pour correspondre à l’intention de recherche.</p></div><ul class="seo-check-list">${trade.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><aside class="seo-brief"><h2>Préparer la demande</h2><p>Décrivez le problème ou le résultat attendu, puis ajoutez les contraintes d’accès et de calendrier.</p><a class="seo-arrow-link" href="https://pro.indebel.be/demande-devis">Créer la demande <span aria-hidden="true">→</span></a></aside></div></section>
    <section class="seo-section seo-band"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Zones prioritaires</span><h2>Rechercher par commune</h2><p>Une combinaison métier et commune n’est publiée que lorsqu’elle figure dans l’allowlist qualité. Sinon, le lien mène vers la page locale générale.</p></div>${localityLinks(indexableLocalities, trade)}</div></section>
    <section class="seo-section"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Signaux publics</span><h2>Demandes correspondant clairement à ${escapeHtml(trade.seoName.toLowerCase())}</h2><p>Le rapprochement est volontairement conservateur : aucune demande ambiguë n’est utilisée comme preuve de disponibilité.</p></div>${demandCards(demands)}</div></section>
    ${related.length ? `<section class="seo-section seo-related"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Métiers connexes</span><h2>Compétences souvent liées au projet</h2></div>${tradeCards(related)}</div></section>` : ''}
    ${faqSection(faqs)}<section class="seo-cta"><div class="container"><div><span class="seo-kicker">Passer à l’action</span><h2>Présentez votre chantier à un ${escapeHtml(trade.seoName.toLowerCase())}</h2></div><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Publier mon projet</a></div></section>`;
    const schemas = [
        breadcrumbSchema(crumbs),
        { '@type': 'Service', name: `${trade.seoName} en Belgique`, serviceType: trade.sourceName.trim(), provider: { '@type': 'Organization', name: 'Indebel', url: `${SITE_URL}/` }, areaServed: { '@type': 'Country', name: 'Belgique' }, url: metadata.canonical },
        faqSchema(faqs)
    ];
    return layout({ metadata, schemas, body, pageClass: 'seo-trade-page' });
}

function localityPage({ locality, demands = [], indexable = true }) {
    const metadata = buildMetadata({ kind: 'locality', locality, indexable });
    const crumbs = [{ name: 'Accueil', path: '/' }, { name: 'Construction', path: '/construction/' }, { name: locality.name, path: metadata.path }];
    const featuredTrades = indexableTrades.filter((trade) => trade.type === 'A').slice(0, 12);
    const faqs = [
        { question: `Comment publier un projet de travaux à ${locality.name} ?`, answer: 'Choisissez la compétence principale, décrivez les travaux et indiquez la commune. Les coordonnées privées ne sont pas affichées sur cette page publique.' },
        { question: 'Tous les métiers sont-ils disponibles immédiatement ?', answer: 'Non. Indebel n’affiche aucun volume de professionnels sans agrégat fiable. La disponibilité est confirmée au moment de la mise en relation.' },
        { question: 'Pourquoi certaines combinaisons métier et ville ne sont-elles pas indexées ?', answer: 'Une page combinée n’est ouverte que si elle possède des signaux réels et un contenu distinctif. Les autres recherches restent accessibles depuis les pages métier ou commune.' }
    ];
    const body = `<section class="seo-hero"><div class="container">${breadcrumbs(crumbs)}<div class="seo-hero-copy"><span class="seo-kicker">${escapeHtml(locality.province)}</span><h1>Artisans et professionnels de la construction à ${escapeHtml(locality.name)}</h1><p>${escapeHtml(locality.intro)}</p><div class="seo-actions"><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Publier un projet à ${escapeHtml(locality.name)}</a><a class="btn seo-secondary-button" href="#metiers">Choisir un métier</a></div></div></div></section>
    <section class="seo-section" id="metiers"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Compétences</span><h2>Métiers pertinents pour votre projet</h2><p>Les pages combinées ne sont proposées que pour les couples validés; les autres cartes renvoient vers la page métier nationale.</p></div>${tradeCards(featuredTrades, locality)}</div></section>
    <section class="seo-section seo-band"><div class="container seo-two-column"><div><div class="seo-section-heading"><span class="seo-kicker">Contexte de demande</span><h2>Informations utiles à préciser à ${escapeHtml(locality.name)}</h2></div><ul class="seo-check-list">${locality.focus.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}<li>Code postal, accès et contraintes de stationnement</li><li>Photos et état actuel des supports</li></ul></div><aside class="seo-brief"><h2>Identification officielle</h2><dl><dt>Commune</dt><dd>${escapeHtml(locality.name)}</dd><dt>Code NIS</dt><dd>${escapeHtml(locality.nisCode)}</dd><dt>Région</dt><dd>${escapeHtml(locality.region)}</dd></dl></aside></div></section>
    <section class="seo-section"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Demandes locales</span><h2>Projets publics attribués à ${escapeHtml(locality.name)}</h2><p>Seules les demandes dont la commune correspond exactement sont affichées. Aucun email, téléphone, budget ou adresse n’est repris.</p></div>${demandCards(demands)}</div></section>
    ${faqSection(faqs)}<section class="seo-cta"><div class="container"><div><span class="seo-kicker">À ${escapeHtml(locality.name)}</span><h2>Décrivez votre projet avant de solliciter un professionnel</h2></div><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Commencer ma demande</a></div></section>`;
    const schemas = [breadcrumbSchema(crumbs), itemListSchema(featuredTrades.map((trade) => ({ name: trade.seoName, path: `/construction/${trade.slug}/` }))), faqSchema(faqs)];
    return layout({ metadata, schemas, body, pageClass: 'seo-locality-page' });
}

function combinationPage({ trade, locality, demands = [], indexable = true }) {
    const metadata = buildMetadata({ kind: 'combination', trade, locality, indexable });
    const crumbs = [{ name: 'Accueil', path: '/' }, { name: 'Construction', path: '/construction/' }, { name: trade.seoName, path: `/construction/${trade.slug}/` }, { name: locality.name, path: metadata.path }];
    const related = (trade.related || []).map((slug) => tradeBySlug.get(slug)).filter((item) => item?.indexableByDefault).slice(0, 3);
    const faqs = [
        { question: `Comment trouver un ${trade.seoName.toLowerCase()} à ${locality.name} ?`, answer: `Décrivez le besoin, indiquez ${locality.name} comme commune d’intervention et précisez les informations techniques utiles. Indebel oriente ensuite la demande vers la compétence ${trade.sourceName.trim()}.` },
        { question: 'La présence d’une page garantit-elle une disponibilité immédiate ?', answer: 'Non. La page correspond à une combinaison contrôlée, mais la disponibilité d’un professionnel doit toujours être confirmée pour les dates et le périmètre du projet.' },
        { question: 'Quelles données sont affichées publiquement ?', answer: 'Uniquement des informations minimales sur le type de travaux et la commune. Les coordonnées, adresses privées et autres données de contact ne sont jamais reprises.' }
    ];
    const body = `<section class="seo-hero seo-combination-hero"><div class="container">${breadcrumbs(crumbs)}<div class="seo-hero-copy"><span class="seo-kicker">${escapeHtml(trade.category)} · ${escapeHtml(locality.province)}</span><h1>${escapeHtml(trade.seoName)} à ${escapeHtml(locality.name)}</h1><p>${escapeHtml(trade.intro)} À ${escapeHtml(locality.name)}, la demande doit aussi préciser la commune d’intervention, l’accès au bâtiment et les contraintes propres au site.</p><div class="seo-actions"><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Demander un devis</a><a class="btn seo-secondary-button" href="#preparer">Préparer le projet</a></div></div></div></section>
    <section class="seo-section" id="preparer"><div class="container seo-two-column"><div><div class="seo-section-heading"><span class="seo-kicker">Travaux concernés</span><h2>Définir l’intervention avant la mise en relation</h2></div><ul class="seo-check-list">${trade.scope.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><aside class="seo-brief"><h2>Repères locaux</h2><p>${escapeHtml(locality.intro)}</p><dl><dt>Commune</dt><dd>${escapeHtml(locality.name)}</dd><dt>Code NIS</dt><dd>${escapeHtml(locality.nisCode)}</dd></dl></aside></div></section>
    <section class="seo-section seo-band"><div class="container"><div class="seo-section-heading"><span class="seo-kicker">Données disponibles</span><h2>Demandes publiques clairement rapprochées</h2><p>L’absence de demande ci-dessous n’est pas remplacée par un faux volume. Le système attend un mapping fiable avant d’automatiser l’ouverture d’autres combinaisons.</p></div>${demandCards(demands)}</div></section>
    <section class="seo-section"><div class="container"><div class="seo-parent-links"><a href="/construction/${trade.slug}/"><span>Métier parent</span><strong>${escapeHtml(trade.seoName)} en Belgique</strong></a><a href="/construction/${locality.slug}/"><span>Page locale</span><strong>Construction à ${escapeHtml(locality.name)}</strong></a></div>${related.length ? `<div class="seo-section-heading seo-related-heading"><span class="seo-kicker">Même projet</span><h2>Métiers connexes</h2></div>${tradeCards(related, locality)}` : ''}</div></section>
    ${faqSection(faqs)}<section class="seo-cta"><div class="container"><div><span class="seo-kicker">${escapeHtml(locality.name)}</span><h2>Présentez votre besoin à un ${escapeHtml(trade.seoName.toLowerCase())}</h2></div><a class="btn btn-primary" href="https://pro.indebel.be/demande-devis">Publier le projet</a></div></section>`;
    const schemas = [breadcrumbSchema(crumbs), { '@type': 'Service', name: `${trade.seoName} à ${locality.name}`, serviceType: trade.sourceName.trim(), areaServed: { '@type': 'AdministrativeArea', name: locality.name, identifier: locality.nisCode }, provider: { '@type': 'Organization', name: 'Indebel', url: `${SITE_URL}/` }, url: metadata.canonical }, faqSchema(faqs)];
    return layout({ metadata, schemas, body, pageClass: 'seo-combination-page' });
}

function notFoundPage() {
    const metadata = { ...buildMetadata({ kind: 'national', indexable: false }), title: 'Page Construction non disponible | Indebel', canonical: `${SITE_URL}/construction/` };
    return layout({ metadata, schemas: [], pageClass: 'seo-not-found', body: `<section class="seo-hero"><div class="container"><div class="seo-hero-copy"><span class="seo-kicker">Page non générée</span><h1>Cette combinaison n’est pas encore disponible</h1><p>Indebel ne publie pas de landing locale sans signaux suffisants. Explorez les métiers et communes déjà validés.</p><div class="seo-actions"><a class="btn btn-primary" href="/construction/">Retour à Construction</a></div></div></div></section>` });
}

module.exports = { nationalPage, tradePage, localityPage, combinationPage, notFoundPage };
