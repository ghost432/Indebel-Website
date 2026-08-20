# Rapport de recette préproduction

Date : 20 août 2026  
Branche locale : `seo/construction-belgique`  
Périmètre : recette locale, lecture seule sur les données de production

## 1. Statut général

La recette fonctionnelle et SEO locale passe. Le déploiement reste bloqué tant que la chaîne Plesk/Node du site public n’est pas confirmée par le développeur.

- 34 pages Construction sont indexables : 1 nationale, 23 métiers et 10 villes.
- Les 3 combinaisons métier × ville sont fermées, hors sitemap et répondent 404.
- 21 pages historiques restent au sitemap.
- 5 redirections 301 sont maintenues et testées sans chaîne.
- Le sitemap final contient 55 URL, toutes en 200, indexables et canoniques self.
- Aucun push, merge ou déploiement n’a été effectué.

## 2. Stock réel des trois combinaisons

Le contrôle agrégé couvre les 70 profils visibles dans l’administration, sans conserver ni restituer de donnée personnelle. Sur ce stock, 63 profils sont des prestataires et 51 déclarent le secteur `Rénovation & Construction`.

| Combinaison | Profils métier Belgique | Profils locaux plausibles | Demandes validées exactes | Seuil 3 profils + 1 demande | Décision |
|---|---:|---:|---:|---|---|
| Plombier × Bruxelles | 17 | 1 | 0 | Non atteint | 404, hors sitemap |
| Électricien × Bruxelles | 18 | 2 | 0 | Non atteint | 404, hors sitemap |
| Chauffagiste × Liège | 13 | 0 | 0 | Non atteint | 404, hors sitemap |

La compétence repose sur des libellés déclarés, sans clé étrangère persistée ; la commune du profil est déduite d’une adresse libre. Le mapping profil → ville est donc faible. Le mapping demande → métier est textuel et reste faible à moyen. Détails : `PREUVES_STOCK_COMBINAISONS.md`.

## 3. Architecture production confirmée ou non

### Site public

- Le live répond via `nginx`, `PleskLin` et `X-Powered-By: Express`.
- `/construction/` renvoie actuellement le HTML de l’accueil : le catch-all Express de la version de production est actif, mais les nouvelles routes ne sont pas déployées.
- `package.json` déclare `npm start` → `node server.js` et `server.js` enregistre les routes SEO avant `express.static`.
- Le dépôt Website ne contient ni workflow GitHub Actions, ni Dockerfile, ni Compose, ni Procfile, ni configuration PM2, ni documentation de déploiement.
- GitHub expose uniquement la branche distante `main`. Rien ne prouve qu’elle est la branche suivie par Plesk, ni qu’un push déclenche automatiquement un déploiement.
- `.htaccess` contient d’anciens blocs WordPress/LiteSpeed ; le live Nginx/Express ne permet pas de s’appuyer sur ces règles pour les routes SEO.

### Application Pro

- `Indebel-App` possède `main` et `dev`, sans workflow GitHub Actions.
- Le frontend est un build Vite statique avec fallback `.htaccess`.
- `backend/ecosystem.config.js` décrit un processus PM2 `indebel-api` dans l’arborescence Plesk, mais son utilisation effective n’a pas été confirmée depuis le dépôt.
- Un secret JWT est codé en dur dans ce fichier suivi par Git. Sa valeur n’est pas reprise ici ; rotation et retrait du dépôt sont requis côté développeur.

### Questions bloquantes au développeur

1. Quelle branche et quel commit sont actuellement déployés pour `indebel.be` ?
2. Le dépôt Git Plesk suit-il `main`, une autre branche ou une copie manuelle ?
3. Le déploiement est-il automatique au push, déclenché dans Plesk ou effectué par copie de fichiers ?
4. Quel processus exécute le site public : Plesk Node.js, PM2, systemd ou autre ?
5. Quelle commande redémarre ce processus après mise à jour de `server.js` ?
6. Quel est le `Application Root` et le `Document Root` configurés dans Plesk ?
7. Les fichiers `public/sitemap*.xml` sont-ils servis directement par Nginx ou les routes Express ont-elles priorité en production ?
8. Une préproduction reproduisant Nginx/Plesk/Express peut-elle être fournie avant mise en ligne ?
9. Le secret JWT suivi par Git a-t-il déjà été utilisé en production, et qui prend en charge sa rotation ?

Conclusion : `server.js` fonctionne localement pour les routes, redirections et sitemaps, mais la méthode de livraison et de redémarrage production n’est pas confirmée.

## 4. Similarité des contenus

Méthode reproductible : extraction de `<main>`, retrait du header, footer, navigations, breadcrumbs, CTA globaux et blocs de maillage ; normalisation ; cosinus pondéré sur unigrammes (35 %) et bigrammes (65 %). Le corpus contient les 34 pages actives et les 3 gabarits de combinaison examinés en recette.

| Niveau | Nombre de paires |
|---|---:|
| Critique, > 85 % | 1 |
| Élevé, 70–85 % | 254 |
| Acceptable, 50–70 % | 52 |
| Faible, < 50 % | 359 |

La seule paire critique est `plombier × Bruxelles` / `électricien × Bruxelles` à 88,37 %. Ces deux pages sont désormais non générées, 404 et hors sitemap. Aucune paire active n’est critique.

Les pages villes ont été enrichies avec un cadrage opérationnel spécifique ; leur maximum reste dans la zone à examiner, autour de 80 %. Les pages métier ne dépassent pas 80,88 %. Leur structure fonctionnelle commune explique une partie du score ; un suivi éditorial reste recommandé avant d’étendre le volume. Le fichier `SIMILARITE_CONTENUS.csv` contient les 666 paires et le script `check-content-similarity.js` produit exactement le même hash sur deux exécutions.

## 5. Taxonomie validée

Les 23 pages métier restent distinctes : 17 intentions de type A et 6 services de type B. Aucun type C ou D n’est indexé.

Les paires plombier/chauffagiste, couvreur/étanchéité/ravalement, peintre/revêtements muraux, carreleur/revêtements de sol, architecte/ingénieur et chauffage/ventilation ont été examinées. Aucune fusion immédiate n’est recommandée ; les frontières d’intention sont documentées dans `AUDIT_METIERS_RECETTE.md`.

## 6. Stratégie FR/NL

“Couverture SEO francophone de la Belgique dans le lot initial. Une extension néerlandaise devra faire l'objet d'un lot distinct avec traductions/localisations réelles, URL NL et hreflang réciproques.”

Anvers, Gand, Bruges, Louvain et Malines restent des pages francophones. Aucun alias NL, contenu traduit automatiquement ou `hreflang` incomplet n’a été ajouté. Voir `STRATEGIE_LANGUES.md`.

## 7. Redirections

### Redirections maintenues

| Source | Cible | Résultat |
|---|---|---|
| `/artisan-bruxelles.html` | `/construction/bruxelles/` | 301 → 200, canonical self |
| `/artisan-liege.html` | `/construction/liege/` | 301 → 200, canonical self |
| `/artisan-charleroi.html` | `/construction/charleroi/` | 301 → 200, canonical self |
| `/artisan-namur.html` | `/construction/namur/` | 301 → 200, canonical self |
| `/artisan-mons.html` | `/construction/mons/` | 301 → 200, canonical self |

Aucune chaîne, boucle ou cible redirigée n’a été détectée.

### Redirections annulées après contrôle du stock

- `/plombier-bruxelles.html`
- `/electricien-bruxelles.html`
- `/chauffagiste-liege.html`

Ces trois pages répondent 200, ont un canonical self et restent dans le sitemap historique. Leur texte visible a été réécrit pour supprimer les formulations artificielles parlant de “requête”, “trafic” ou “performance SEO”.

### Pages historiques examinées

- `/isolation-maison-wallonie.html` : 200, canonical self, intention régionale éditoriale distincte de la page métier nationale ; conservée au sitemap.
- `/renovation-salle-de-bain-bruxelles.html` : 200, canonical self, intention projet multi-métiers ; conservée au sitemap.
- `/artisan-brabant-wallon.html` : 200, canonical self, intention province distincte des pages communes ; conservée au sitemap.

Le risque de cannibalisation est moyen mais contrôlable par les intentions. Aucun redirect arbitraire n’est recommandé dans ce lot.

## 8. Sitemap

| Famille | Production actuelle | Version locale recettée |
|---|---:|---:|
| Historique | 26 | 21 |
| Construction | 0 | 34 |
| Total | 26 | 55 |

La phase 2 prévoyait 18 URL historiques et 8 redirections. La recette stock a annulé 3 de ces redirections ; le résultat final conserve donc 21 URL historiques et n’en retire que 5. Les 5 URL disparues correspondent exactement aux pages artisan ville redirigées.

Chaque URL des deux sitemaps enfants répond 200, est indexable, canonical self, sans paramètre, sans redirection, sans doublon et n’appartient pas à une route privée. Les 3 combinaisons et toutes les pages de recherche/filtres sont exclues.

Le sitemap index reste identique dans sa structure : `sitemap-pages.xml` et `sitemap-construction.xml`. La capture existante de l’index reste valide ; les contenus enfants sont vérifiés automatiquement.

## 9. Régression

Contrôles passés sur l’accueil, `/particulier`, `/blog-particulier`, les 6 landing pages préservées, le CTA vers `pro.indebel.be`, les CSS, JavaScript, images, `robots.txt` et `sitemap.xml`.

Les trois combinaisons sous seuil répondent 404. Les pages historiques restent 200 et aucune formulation SEO interne n’est visible dans les trois anciennes landing pages métier-ville.

Le contrôle visuel couvre 7 pages à 1440×900, 1024×768 et 390×844 : aucun débordement horizontal, texte tronqué ou H1 multiple ; CTA et breadcrumb restent visibles. Les captures de recette sont dans `captures/`.

## 10. Tests

- `npm run seo:build` : 581 communes, 21 URL historiques, 34 URL Construction.
- `npm test` : 23 métiers, 10 villes, 0 combinaison.
- `npm run seo:check` : 55 URL sitemap, 34 pages Construction, 5 redirections.
- `npm run seo:similarity` : 37 gabarits, 666 paires, résultat déterministe.
- `npm run test:regression` : 9 pages, 6 ressources, 6 landing pages préservées, 3 combinaisons fermées.
- `git diff --check` : attendu sans erreur au contrôle final.

## 11. Corrections effectuées localement

- Désactivation des 3 entrées `validated:true` non démontrées.
- Obligation réelle de satisfaire les seuils profils, demandes et signaux distinctifs.
- Suppression des 3 redirections métier-ville et réintégration des landing pages historiques au sitemap.
- Remplacement des liens internes vers les combinaisons par les pages métier nationales.
- Enrichissement spécifique des 10 pages villes.
- Réécriture utile des 3 anciennes landing pages conservées.
- Ajout des scripts de similarité et de régression.
- Renforcement des contrôles sitemap, canonical et redirections.
- Ajout de la stratégie linguistique et de l’audit des 23 métiers.

## 12. Risques restants

1. Chaîne de déploiement Plesk/Express non documentée : bloquant avant production.
2. Secret JWT suivi dans le dépôt App : rotation et retrait requis.
3. Commune des profils non structurée : aucune ouverture automatique métier × ville.
4. Mapping demande → métier textuel : agrégateur SEO read-only nécessaire.
5. Similarité élevée, mais non critique, sur les familles utilisant un gabarit commun : suivi éditorial avant extension.
6. Les anciennes landing pages préservées utilisent encore l’ancien composant de mise en page ; leur refonte graphique complète est hors recette.
7. Les captures de combinaisons de phase 2 sont historiques et ne représentent plus des pages indexables.

NO-GO — CORRECTIONS / INFORMATIONS REQUISES
