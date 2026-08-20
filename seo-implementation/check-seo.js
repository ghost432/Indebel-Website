const assert = require('assert');
const { LEGACY_REDIRECTS } = require('../seo/routes');

const BASE_URL = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

function firstMatch(html, expression) {
    return html.match(expression)?.[1]?.trim() || '';
}

function countMatches(html, expression) {
    return [...html.matchAll(expression)].length;
}

function sitemapLocations(xml) {
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

async function fetchText(pathname, options = {}) {
    const response = await fetch(`${BASE_URL}${pathname}`, options);
    return { response, text: await response.text() };
}

async function run() {
    const index = await fetchText('/sitemap.xml');
    assert.equal(index.response.status, 200, 'Le sitemap index doit répondre 200');
    const sitemapPaths = sitemapLocations(index.text).map((url) => new URL(url).pathname);
    assert(sitemapPaths.length >= 2, 'Le sitemap index doit référencer plusieurs sous-sitemaps');

    const pagePaths = [];
    for (const sitemapPath of sitemapPaths) {
        const child = await fetchText(sitemapPath);
        assert.equal(child.response.status, 200, `${sitemapPath} doit répondre 200`);
        pagePaths.push(...sitemapLocations(child.text).map((url) => new URL(url).pathname));
    }
    assert.equal(pagePaths.length, 55, 'Le sitemap doit contenir exactement 55 URL recettées');
    assert.equal(new Set(pagePaths).size, pagePaths.length, 'Le sitemap ne doit contenir aucun doublon');
    pagePaths.forEach((pathname) => {
        assert(!pathname.includes('?'), `${pathname}: paramètre interdit dans le sitemap`);
        assert(!/(?:login|register|admin|account|recherche|search)/i.test(pathname), `${pathname}: route privée ou de recherche interdite`);
        assert(!Object.prototype.hasOwnProperty.call(LEGACY_REDIRECTS, pathname), `${pathname}: une source redirigée ne doit pas figurer au sitemap`);
    });

    const titles = new Map();
    const sitemapFailures = [];
    for (const pathname of pagePaths) {
        const page = await fetchText(pathname);
        assert.equal(page.response.status, 200, `${pathname} est présent dans le sitemap mais ne répond pas 200`);
        const robots = firstMatch(page.text, /<meta\s+name="robots"\s+content="([^"]+)"/i);
        const canonical = firstMatch(page.text, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
        if (!canonical) sitemapFailures.push(`${pathname}: canonical manquant`);
        else if (new URL(canonical).pathname !== pathname) sitemapFailures.push(`${pathname}: canonical non self`);
        if (robots.includes('noindex')) sitemapFailures.push(`${pathname}: noindex`);
        if (!pathname.startsWith('/construction/')) continue;

        const title = firstMatch(page.text, /<title>([^<]+)<\/title>/i);
        const description = firstMatch(page.text, /<meta\s+name="description"\s+content="([^"]+)"/i);
        assert(title, `${pathname}: title manquant`);
        assert(description, `${pathname}: meta description manquante`);
        assert.equal(countMatches(page.text, /<h1[\s>][\s\S]*?<\/h1>/gi), 1, `${pathname}: un seul H1 est requis`);
        assert(/property="og:title"/.test(page.text) && /property="og:url"/.test(page.text), `${pathname}: Open Graph incomplet`);
        assert(/"@type":"BreadcrumbList"/.test(page.text), `${pathname}: BreadcrumbList absent`);
        assert(!/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(page.text), `${pathname}: email détecté`);
        assert(!/(?:\+32|0032)[\s./-]*\d{1,3}(?:[\s./-]*\d{2,3}){2,4}/.test(page.text), `${pathname}: téléphone détecté`);
        assert(!titles.has(title), `${pathname}: title dupliqué avec ${titles.get(title)}`);
        titles.set(title, pathname);
    }
    assert.equal(sitemapFailures.length, 0, `URL sitemap invalides:\n${sitemapFailures.join('\n')}`);

    for (const [source, destination] of Object.entries(LEGACY_REDIRECTS)) {
        const response = await fetch(`${BASE_URL}${source}`, { redirect: 'manual' });
        assert.equal(response.status, 301, `${source}: redirection 301 attendue`);
        assert.equal(new URL(response.headers.get('location'), BASE_URL).pathname, destination, `${source}: mauvaise cible`);
        const target = await fetchText(destination);
        assert.equal(target.response.status, 200, `${destination}: la cible doit répondre directement 200`);
        const targetCanonical = firstMatch(target.text, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
        assert.equal(new URL(targetCanonical).pathname, destination, `${destination}: canonical self attendu sur la cible`);
    }

    const parameterPage = await fetchText('/construction/plombier/?ville=bruxelles');
    assert(/content="noindex,follow"/.test(parameterPage.text), 'Une variante à paramètres doit être noindex,follow');
    const rejectedCombination = await fetchText('/construction/plombier/namur/');
    assert.equal(rejectedCombination.response.status, 404, 'Une combinaison hors allowlist ne doit pas être générée');

    console.log(`Audit SEO réussi: ${pagePaths.length} URL sitemap, ${titles.size} pages Construction, ${Object.keys(LEGACY_REDIRECTS).length} redirections.`);
}

run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
