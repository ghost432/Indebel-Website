const assert = require('assert');

const BASE_URL = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const preservedPages = [
    '/plombier-bruxelles.html',
    '/electricien-bruxelles.html',
    '/chauffagiste-liege.html',
    '/isolation-maison-wallonie.html',
    '/renovation-salle-de-bain-bruxelles.html',
    '/artisan-brabant-wallon.html'
];

async function text(pathname) {
    const response = await fetch(`${BASE_URL}${pathname}`, { redirect: 'manual' });
    return { response, body: await response.text() };
}

async function run() {
    const publicPages = ['/', '/particulier', '/blog-particulier', ...preservedPages];
    for (const pathname of publicPages) {
        const page = await text(pathname);
        assert.equal(page.response.status, 200, `${pathname}: HTTP 200 attendu`);
        if (preservedPages.includes(pathname)) {
            const canonical = page.body.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
            assert(canonical && new URL(canonical).pathname === pathname, `${pathname}: canonical self attendu`);
            assert(!/pourquoi cette page est strategique|doit bien performer|trafic qualifie|valeur transactionnelle|la requete/i.test(page.body), `${pathname}: formulation SEO artificielle visible`);
        }
    }

    for (const pathname of ['/css/style.css', '/css/construction-seo.css', '/images/logo.png', '/js/layout-loader.js', '/robots.txt', '/sitemap.xml']) {
        const response = await fetch(`${BASE_URL}${pathname}`);
        assert.equal(response.status, 200, `${pathname}: ressource indisponible`);
    }

    const construction = await text('/construction/');
    assert(construction.body.includes('https://pro.indebel.be/demande-devis'), 'Le CTA vers pro.indebel.be doit rester présent');
    const pro = await fetch('https://pro.indebel.be/demande-devis', { redirect: 'manual' });
    assert([200, 301, 302, 303, 307, 308].includes(pro.status), 'Le lien public pro.indebel.be doit répondre');

    const sitemap = await text('/sitemap-pages.xml');
    preservedPages.forEach((pathname) => assert(sitemap.body.includes(`https://indebel.be${pathname}`), `${pathname}: absent du sitemap historique`));

    for (const pathname of ['/construction/plombier/bruxelles/', '/construction/electricien/bruxelles/', '/construction/chauffagiste/liege/']) {
        const page = await text(pathname);
        assert.equal(page.response.status, 404, `${pathname}: combinaison sous seuil doit répondre 404`);
    }

    console.log(`Régression réussie: ${publicPages.length} pages, 6 ressources, 6 landing pages préservées et 3 combinaisons fermées.`);
}

run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
