const axios = require('axios');

const ENDPOINT = 'https://pro.indebel.be/api/devis/valides';
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = { expiresAt: 0, rows: [] };

function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function sanitizeDemand(row) {
    return {
        id: Number(row.id),
        workType: String(row.type_travaux || '').slice(0, 100),
        category: String(row.categorie || '').slice(0, 80),
        city: String(row.ville || '').slice(0, 80),
        region: String(row.region || '').slice(0, 80),
        createdAt: row.created_at || null
    };
}

async function getPublicDemands() {
    if (cache.expiresAt > Date.now()) return cache.rows;
    try {
        const response = await axios.get(ENDPOINT, {
            params: { page: 1, limit: 100 },
            timeout: 2500,
            headers: { Accept: 'application/json' }
        });
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        cache = { expiresAt: Date.now() + CACHE_TTL_MS, rows: rows.map(sanitizeDemand) };
    } catch (error) {
        console.warn('SEO public data unavailable:', error.message);
        cache = { expiresAt: Date.now() + 30 * 1000, rows: [] };
    }
    return cache.rows;
}

function isConstructionDemand(demand, trades) {
    const category = normalize(demand.category);
    if (category.includes('renovation') && category.includes('construction')) return true;
    return trades.some((trade) => [trade.sourceName, trade.seoName, ...(trade.synonyms || [])]
        .some((term) => category === normalize(term)));
}

function demandMatchesTrade(demand, trade) {
    const haystack = normalize(`${demand.category} ${demand.workType}`);
    const terms = [trade.sourceName, trade.seoName, ...(trade.synonyms || [])]
        .map(normalize).filter((term) => term.length >= 4);
    return terms.some((term) => haystack.includes(term));
}

function demandMatchesLocality(demand, locality) {
    return normalize(demand.city) === normalize(locality.name);
}

module.exports = {
    getPublicDemands,
    isConstructionDemand,
    demandMatchesTrade,
    demandMatchesLocality
};
