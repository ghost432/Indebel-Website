const fs = require('fs');
const path = require('path');
const { LEGACY_INDEXABLE_PATHS, constructionPaths, urlSet, sitemapIndex } = require('../seo/sitemap');

const publicDirectory = path.resolve(__dirname, '../public');
const files = {
    'sitemap.xml': sitemapIndex(),
    'sitemap-pages.xml': urlSet(LEGACY_INDEXABLE_PATHS),
    'sitemap-construction.xml': urlSet(constructionPaths())
};

Object.entries(files).forEach(([name, contents]) => {
    fs.writeFileSync(path.join(publicDirectory, name), contents);
});
console.log(`Sitemaps générés: ${LEGACY_INDEXABLE_PATHS.length} pages existantes, ${constructionPaths().length} pages Construction.`);
