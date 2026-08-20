# Tests SEO

## Contrôles automatisés

`npm test` valide la configuration avant démarrage :

- 30 compétences source et 581 communes;
- slugs uniques, y compris les deux communes Saint-Nicolas;
- aucun type D indexable;
- contenu spécifique pour chaque métier et ville indexable;
- 3 combinaisons candidates mais 0 combinaison indexable sous les seuils;
- 34 URL Construction actives et titles uniques.

`npm run seo:check` contrôle le serveur local :

- HTTP 200 des 55 URL présentes dans les deux sous-sitemaps;
- canonical self et absence de `noindex` pour les 55 URL sitemap;
- title présent et unique sur les 34 pages Construction;
- meta description, H1 unique et canonical self;
- robots indexable, Open Graph et BreadcrumbList;
- aucune page noindex dans les sitemaps;
- 5 redirections 301 sans chaîne, cible 200 et canonical self;
- variante à paramètres en `noindex,follow`;
- combinaison hors allowlist en 404;
- absence d’email ou téléphone dans les pages Construction.

## Contrôle visuel

Les quatre familles ont été inspectées à 1440 × 900, 768 × 1024 et 390 × 844. À chaque breakpoint : largeur du document égale au viewport, H1 et CTA contenus, images chargées et aucun débordement horizontal.

Résultat local du 20 août 2026 : tests de configuration et audit HTTP réussis.

## Tests ajoutés en recette

- `npm run seo:similarity` audite 37 gabarits et génère les 666 paires dans `SIMILARITE_CONTENUS.csv`.
- `npm run test:regression` vérifie les pages historiques, les assets, le CTA Pro, les landing pages préservées et les 3 combinaisons fermées.
- `npm run seo:check` vérifie aussi les doublons, paramètres, routes privées et sources redirigées dans les sitemaps.
