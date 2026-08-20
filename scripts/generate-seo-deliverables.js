const fs = require('fs');
const path = require('path');
const { indexableTrades, indexableLocalities, thresholds } = require('../seo/catalog');
const { constructionPaths } = require('../seo/sitemap');
const { LEGACY_REDIRECTS } = require('../seo/routes');

const directory = path.resolve(__dirname, '../seo-implementation');
const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const combinationKeys = new Set(thresholds.combination.allowlist.map((entry) => `${entry.trade}:${entry.locality}`));
const urlRows = constructionPaths().map((url) => {
    const segments = url.split('/').filter(Boolean);
    let family = 'national';
    let source = 'configuration';
    let rule = 'page pilier';
    if (segments.length === 2) {
        const slug = segments[1];
        if (indexableTrades.some((trade) => trade.slug === slug)) {
            family = 'métier'; source = 'metiers-seo.json'; rule = 'type A/B + contenu spécifique';
        } else {
            family = 'ville'; source = 'localites-seo.json'; rule = 'priorité 1/2 + contenu local + code NIS';
        }
    }
    if (segments.length === 3) {
        family = 'métier × ville'; source = 'seo-thresholds.json'; rule = combinationKeys.has(`${segments[1]}:${segments[2]}`) ? 'allowlist contrôlée' : 'non déterminé';
    }
    return [family, `https://indebel.be${url}`, 'oui', 'oui', source, rule];
});
const urlCsv = [['famille', 'url', 'indexable', 'sitemap', 'source', 'règle_qualité'], ...urlRows]
    .map((row) => row.map(quote).join(';')).join('\n');
fs.writeFileSync(path.join(directory, 'URLS_GENEREES.csv'), `${urlCsv}\n`);

const redirectRows = Object.entries(LEGACY_REDIRECTS).map(([source, destination]) => [source, destination, '301', 'implémentée', 'correspondance directe']);
redirectRows.push(
    ['/isolation-maison-wallonie.html', '', '', 'conservée', 'pas de page régionale équivalente dans ce lot'],
    ['/renovation-salle-de-bain-bruxelles.html', '', '', 'conservée', 'intention multi-métiers; cible unique à valider'],
    ['/artisan-brabant-wallon.html', '', '', 'conservée', 'pas de page province dans ce lot']
);
const redirectCsv = [['source', 'destination', 'code_http', 'statut', 'justification'], ...redirectRows]
    .map((row) => row.map(quote).join(';')).join('\n');
fs.writeFileSync(path.join(directory, 'REDIRECTIONS.csv'), `${redirectCsv}\n`);

console.log(`${urlRows.length} URL et ${redirectRows.length} décisions de redirection documentées.`);
