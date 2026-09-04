const fs = require('fs');
const path = require('path');
const { tradeBySlug, localityBySlug, thresholds, indexableTrades, indexableLocalities } = require('../seo/catalog');
const { nationalPage, tradePage, localityPage, combinationPage } = require('../seo/render');
const OUTPUT = path.resolve(__dirname, 'SIMILARITE_CONTENUS.csv');

function decodeEntities(value) {
    const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#039': "'" };
    return value.replace(/&([a-z]+|#\d+);/gi, (match, entity) => {
        if (entities[entity.toLowerCase()] !== undefined) return entities[entity.toLowerCase()];
        if (entity.startsWith('#')) return String.fromCharCode(Number(entity.slice(1)));
        return ' ';
    });
}

function removeClassBlock(html, className) {
    const expression = new RegExp(`<([a-z0-9]+)\\b[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
    return html.replace(expression, ' ');
}

function visibleMainText(html) {
    let main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
    main = main.replace(/<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');
    main = main.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, ' ');
    ['seo-actions', 'seo-cta', 'seo-card-grid', 'seo-location-list', 'seo-parent-links']
        .forEach((className) => { main = removeClassBlock(main, className); });
    return decodeEntities(main.replace(/<[^>]+>/g, ' '))
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function features(text) {
    const words = text.split(' ').filter((word) => word.length > 1);
    const map = new Map();
    const add = (key, weight) => map.set(key, (map.get(key) || 0) + weight);
    words.forEach((word) => add(`u:${word}`, 0.35));
    for (let index = 0; index < words.length - 1; index += 1) {
        add(`b:${words[index]} ${words[index + 1]}`, 0.65);
    }
    return map;
}

function cosine(left, right) {
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    left.forEach((value, key) => {
        leftNorm += value * value;
        dot += value * (right.get(key) || 0);
    });
    right.forEach((value) => { rightNorm += value * value; });
    if (!leftNorm || !rightNorm) return 0;
    return (dot / Math.sqrt(leftNorm * rightNorm)) * 100;
}

function pageType(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1) return 'national';
    if (segments.length === 3) return 'combinaison';
    if (tradeBySlug.has(segments[1])) return 'métier';
    if (localityBySlug.has(segments[1])) return 'ville';
    return 'inconnu';
}

function level(score) {
    if (score > 85) return 'critique';
    if (score >= 70) return 'élevé';
    if (score >= 50) return 'acceptable';
    return 'faible';
}

function quote(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

async function run() {
    const renderedPages = [
        { pathname: '/construction/', html: nationalPage({ demands: [], indexable: true }) },
        ...indexableTrades.map((trade) => ({ pathname: `/construction/${trade.slug}/`, html: tradePage({ trade, demands: [], indexable: true }) })),
        ...indexableLocalities.map((locality) => ({ pathname: `/construction/${locality.slug}/`, html: localityPage({ locality, demands: [], indexable: true }) })),
        ...thresholds.combination.allowlist.map((entry) => {
            const trade = tradeBySlug.get(entry.trade);
            const locality = localityBySlug.get(entry.locality);
            return { pathname: `/construction/${entry.trade}/${entry.locality}/`, html: combinationPage({ trade, locality, demands: [], indexable: true }) };
        })
    ];
    const pages = [];
    for (const { pathname, html } of renderedPages) {
        const text = visibleMainText(html);
        pages.push({ pathname, type: pageType(pathname), features: features(text), wordCount: text.split(' ').length });
    }

    const rows = [];
    for (let left = 0; left < pages.length; left += 1) {
        for (let right = left + 1; right < pages.length; right += 1) {
            const score = Number(cosine(pages[left].features, pages[right].features).toFixed(2));
            rows.push({
                urlA: pages[left].pathname,
                urlB: pages[right].pathname,
                family: `${pages[left].type} vs ${pages[right].type}`,
                score,
                level: level(score)
            });
        }
    }
    rows.sort((a, b) => b.score - a.score || a.urlA.localeCompare(b.urlA) || a.urlB.localeCompare(b.urlB));
    const csv = [
        ['URL A', 'URL B', 'famille comparée', 'score de similarité', 'niveau'],
        ...rows.map((row) => [row.urlA, row.urlB, row.family, row.score.toFixed(2), row.level])
    ].map((row) => row.map(quote).join(',')).join('\n');
    fs.writeFileSync(OUTPUT, `${csv}\n`);

    const counts = rows.reduce((result, row) => ({ ...result, [row.level]: (result[row.level] || 0) + 1 }), {});
    console.log(JSON.stringify({ method: 'snapshot éditorial déterministe; cosinus pondéré unigrammes 35 % / bigrammes 65 %', pages: pages.length, pairs: rows.length, counts, top: rows.slice(0, 10) }, null, 2));
}

run().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
