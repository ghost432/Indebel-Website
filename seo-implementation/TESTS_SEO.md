# Tests SEO

## Contrôles automatisés

`npm test` valide la configuration avant démarrage :

- 30 compétences source et 581 communes;
- slugs uniques, y compris les deux communes Saint-Nicolas;
- aucun type D indexable;
- contenu spécifique pour chaque métier et ville indexable;
- exactement 3 combinaisons allowlistées;
- 37 URL Construction et titles uniques.

`npm run seo:check` contrôle le serveur local :

- HTTP 200 des 55 URL présentes dans les deux sous-sitemaps;
- canonical self et absence de `noindex` pour les 55 URL sitemap;
- title présent et unique sur les 37 pages Construction;
- meta description, H1 unique et canonical self;
- robots indexable, Open Graph et BreadcrumbList;
- aucune page noindex dans les sitemaps;
- 8 redirections 301 sans chaîne;
- variante à paramètres en `noindex,follow`;
- combinaison hors allowlist en 404;
- absence d’email ou téléphone dans les pages Construction.

## Contrôle visuel

Les quatre familles ont été inspectées à 1440 × 900, 768 × 1024 et 390 × 844. À chaque breakpoint : largeur du document égale au viewport, H1 et CTA contenus, images chargées et aucun débordement horizontal.

Résultat local du 20 août 2026 : tests de configuration et audit HTTP réussis.
