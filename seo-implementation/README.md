# Architecture SEO Construction

Cette implémentation ajoute à `indebel.be` une surface HTML rendue côté serveur :

- `/construction/`
- `/construction/{metier}/`
- `/construction/{ville}/`
- `/construction/{metier}/{ville}/`

Le contenu SEO principal, les métadonnées et les données structurées sont présents dans la réponse HTML initiale. `pro.indebel.be` n’héberge aucune landing SEO; son API publique fournit seulement des demandes récentes après réduction à six champs non sensibles.

## Commandes locales

```bash
npm ci
npm run seo:build
npm test
npm start
npm run seo:check
npm run seo:similarity
npm run test:regression
```

`seo:build` régénère les 581 communes à partir de `../Indebel-App/frontend/src/data/belgianCommunes.js`, puis les sitemaps et les CSV d’inventaire. Le chemin source peut être remplacé avec `INDEBEL_COMMUNES_SOURCE`.

## Règles centrales

- Les métiers viennent de `metiers-seo.json`; aucun slug n’est ajouté en base.
- Une page métier exige un type A ou B, un identifiant source et trois blocs de travaux spécifiques.
- Une page ville exige un code NIS, une priorité 1 ou 2 et une introduction locale spécifique.
- Une page métier × ville exige des parents valides, une entrée validée, 3 professionnels locaux, 1 demande validée et 3 signaux distinctifs.
- Une combinaison hors allowlist répond 404 et n’entre jamais dans le sitemap.
- Une variante Construction avec paramètres de filtre reçoit `noindex,follow` et garde un canonical propre.
- Les sitemaps ne contiennent que les pages canoniques et indexables du lot.

## Données publiques

`seo/public-data.js` consomme uniquement `GET /api/devis/valides`. Le rendu conserve `id`, type de travaux, catégorie, commune, région et date. Description, code postal, budget, adresse, email, téléphone et pièces jointes ne sont jamais transmis aux pages SEO.

Le mapping entre profils, compétences et demandes n’étant pas suffisamment fiable, aucun nombre de professionnels n’est affiché et aucun volume n’ouvre automatiquement une combinaison.

## Déploiement futur

Le serveur Express doit rester l’origine qui traite ces routes et les redirections. La recette a confirmé Nginx/Plesk devant Express en production, mais pas la branche, le déclencheur ni le redémarrage du processus. Aucun déploiement ne doit être préparé avant validation des questions listées dans `RAPPORT_RECETTE_PREPROD.md`.
