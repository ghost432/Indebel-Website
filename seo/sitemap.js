const { SITE_URL } = require('./metadata');
const { indexableTrades, indexableLocalities, tradeBySlug, localityBySlug, thresholds } = require('./catalog');
const { isTradeIndexable, isLocalityIndexable, isSeoCombinationIndexable } = require('./quality');

const LAST_MODIFIED = process.env.SEO_SITEMAP_LASTMOD || '2026-08-20';
const LEGACY_INDEXABLE_PATHS = [
    '/', '/particulier', '/blog-particulier',
    '/artisan-brabant-wallon.html', '/artisan-wavre.html', '/artisan-nivelles.html',
    '/artisan-ottignies.html', '/artisan-tournai.html', '/artisan-verviers.html', '/artisan-arlon.html',
    '/primes-renovation-wallonie-artisan-agree.html',
    '/comment-trouver-artisan-fiable-belgique.html',
    '/prix-renovation-salle-de-bain-belgique.html',
    '/renovation-salle-de-bain-bruxelles.html', '/isolation-maison-wallonie.html',
    '/comment-nous-verifions-nos-artisans.html', '/avis-clients-et-projets-locaux.html',
    '/comment-comparer-un-devis-travaux.html'
];

function constructionPaths() {
    const tradePaths = indexableTrades.filter(isTradeIndexable).map((trade) => `/construction/${trade.slug}/`);
    const localityPaths = indexableLocalities.filter(isLocalityIndexable).map((locality) => `/construction/${locality.slug}/`);
    const combinationPaths = thresholds.combination.allowlist.map((entry) => {
        const trade = tradeBySlug.get(entry.trade);
        const locality = localityBySlug.get(entry.locality);
        return isSeoCombinationIndexable(trade, locality) ? `/construction/${trade.slug}/${locality.slug}/` : null;
    }).filter(Boolean);
    return ['/construction/', ...tradePaths, ...localityPaths, ...combinationPaths];
}

function urlSet(paths) {
    const urls = paths.map((pagePath) => `  <url><loc>${SITE_URL}${pagePath}</loc><lastmod>${LAST_MODIFIED}</lastmod></url>`).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function sitemapIndex() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${SITE_URL}/sitemap-pages.xml</loc><lastmod>${LAST_MODIFIED}</lastmod></sitemap>\n  <sitemap><loc>${SITE_URL}/sitemap-construction.xml</loc><lastmod>${LAST_MODIFIED}</lastmod></sitemap>\n</sitemapindex>\n`;
}

module.exports = { LEGACY_INDEXABLE_PATHS, constructionPaths, urlSet, sitemapIndex };
