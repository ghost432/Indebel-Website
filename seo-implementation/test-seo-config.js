const assert = require('assert');
const { trades, localities, indexableTrades, indexableLocalities, thresholds, tradeBySlug, localityBySlug } = require('../seo/catalog');
const { isSeoCombinationIndexable } = require('../seo/quality');
const { constructionPaths } = require('../seo/sitemap');
const { buildMetadata } = require('../seo/metadata');

assert.equal(trades.length, 30, 'La taxonomie doit contenir les 30 compétences source');
assert.equal(localities.length, 581, 'La source doit contenir 581 communes');
assert.equal(new Set(trades.map((trade) => trade.slug)).size, trades.length, 'Les slugs métier doivent être uniques');
assert.equal(new Set(localities.map((locality) => locality.slug)).size, localities.length, 'Les slugs commune doivent être uniques');
assert(!trades.find((trade) => trade.type === 'D' && trade.indexableByDefault), 'Un type D ne peut pas être indexable');
assert(indexableTrades.every((trade) => trade.intro && trade.scope?.length >= 3), 'Chaque métier indexable doit avoir un contenu spécifique');
assert(indexableLocalities.every((locality) => locality.intro && /^\d{5}$/.test(locality.nisCode)), 'Chaque ville indexable doit avoir une introduction et un code NIS');

const combinations = thresholds.combination.allowlist.filter((entry) => (
    isSeoCombinationIndexable(tradeBySlug.get(entry.trade), localityBySlug.get(entry.locality))
));
assert.equal(combinations.length, 3, 'Seules les trois combinaisons contrôlées doivent être ouvertes');
assert(!constructionPaths().some((url) => url.includes('/autres/')), 'Autres ne doit jamais produire une URL SEO');
assert.equal(constructionPaths().length, 37, 'Le premier lot doit contenir exactement 37 URL Construction');

const titles = [
    buildMetadata({ kind: 'national' }).title,
    ...indexableTrades.map((trade) => buildMetadata({ kind: 'trade', trade }).title),
    ...indexableLocalities.map((locality) => buildMetadata({ kind: 'locality', locality }).title),
    ...combinations.map((entry) => buildMetadata({ kind: 'combination', trade: tradeBySlug.get(entry.trade), locality: localityBySlug.get(entry.locality) }).title)
];
assert.equal(new Set(titles).size, titles.length, 'Les titles générés doivent être uniques');
assert(titles.every((title) => title.length <= 68), 'Les titles doivent respecter la limite configurée');

console.log(`Configuration valide: ${indexableTrades.length} métiers, ${indexableLocalities.length} villes, ${combinations.length} combinaisons.`);
