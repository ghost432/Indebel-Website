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
