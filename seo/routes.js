const { tradeBySlug, localityBySlug, trades } = require('./catalog');
const { isTradeIndexable, isLocalityIndexable, getCombinationDecision } = require('./quality');
const { getPublicDemands, isConstructionDemand, demandMatchesTrade, demandMatchesLocality } = require('./public-data');
const { nationalPage, tradePage, localityPage, combinationPage, notFoundPage } = require('./render');

const LEGACY_REDIRECTS = {
    '/artisan-bruxelles.html': '/construction/bruxelles/',
    '/artisan-liege.html': '/construction/liege/',
    '/artisan-charleroi.html': '/construction/charleroi/',
    '/artisan-namur.html': '/construction/namur/',
    '/artisan-mons.html': '/construction/mons/'
};

function hasIndexingParameters(query) {
    const keys = new Set(['q', 'search', 'filter', 'page', 'ville', 'metier', 'rayon', 'sort']);
    return Object.keys(query).some((key) => keys.has(key.toLowerCase()));
}

function hasAnyQuery(query) {
    return Object.keys(query).length > 0;
}

function registerSeoRoutes(app) {
    app.use((req, res, next) => {
        if (['/login', '/register'].includes(req.path) || req.path.startsWith('/admin')) {
            res.set('X-Robots-Tag', 'noindex, nofollow');
        }
        next();
    });
    Object.entries(LEGACY_REDIRECTS).forEach(([source, destination]) => {
        app.get(source, (req, res) => res.redirect(301, destination));
    });

    app.use((req, res, next) => {
        if (req.method === 'GET' && req.path.startsWith('/construction') && !req.path.endsWith('/')) {
            const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
            return res.redirect(301, `${req.path}/${query}`);
        }
        if ((req.path.startsWith('/construction') && hasAnyQuery(req.query)) || hasIndexingParameters(req.query)) {
            res.set('X-Robots-Tag', 'noindex, follow');
        }
        next();
    });

    app.get('/construction/', async (req, res) => {
        const publicDemands = await getPublicDemands();
        const demands = publicDemands.filter((demand) => isConstructionDemand(demand, trades)).slice(0, 6);
        const indexable = !hasAnyQuery(req.query);
        res.status(200).send(nationalPage({ demands, indexable }));
    });

    app.get('/construction/:slug/', async (req, res) => {
        const trade = tradeBySlug.get(req.params.slug);
        const locality = localityBySlug.get(req.params.slug);
        const indexable = !hasAnyQuery(req.query);

        if (trade && isTradeIndexable(trade)) {
            const publicDemands = await getPublicDemands();
            const demands = publicDemands.filter((demand) => demandMatchesTrade(demand, trade)).slice(0, 6);
            return res.status(200).send(tradePage({ trade, demands, indexable }));
        }
        if (locality && isLocalityIndexable(locality)) {
            const publicDemands = await getPublicDemands();
            const demands = publicDemands.filter((demand) => demandMatchesLocality(demand, locality)).slice(0, 6);
            return res.status(200).send(localityPage({ locality, demands, indexable }));
        }
        return res.status(404).send(notFoundPage());
    });

    app.get('/construction/:trade/:locality/', async (req, res) => {
        const trade = tradeBySlug.get(req.params.trade);
        const locality = localityBySlug.get(req.params.locality);
        const decision = getCombinationDecision(trade, locality);
        if (!decision.indexable) return res.status(404).send(notFoundPage());

        const publicDemands = await getPublicDemands();
        const demands = publicDemands.filter((demand) => (
            demandMatchesTrade(demand, trade) && demandMatchesLocality(demand, locality)
        )).slice(0, 6);
        const indexable = !hasAnyQuery(req.query);
        return res.status(200).send(combinationPage({ trade, locality, demands, indexable }));
    });
}

module.exports = { LEGACY_REDIRECTS, registerSeoRoutes };
