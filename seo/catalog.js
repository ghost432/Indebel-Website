const trades = require('../seo-implementation/metiers-seo.json');
const localities = require('../seo-implementation/localites-seo.json');
const thresholds = require('../seo-implementation/seo-thresholds.json');

const tradeBySlug = new Map(trades.map((trade) => [trade.slug, trade]));
const localityBySlug = new Map(localities.map((locality) => [locality.slug, locality]));

const indexableTrades = trades.filter((trade) => trade.indexableByDefault);
const indexableLocalities = localities.filter((locality) => locality.indexableByDefault)
    .sort((a, b) => a.seoPriority - b.seoPriority || a.name.localeCompare(b.name, 'fr'));

module.exports = {
    trades,
    localities,
    thresholds,
    tradeBySlug,
    localityBySlug,
    indexableTrades,
    indexableLocalities
};
