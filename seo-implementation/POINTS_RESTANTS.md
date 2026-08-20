# Points restant à valider avant production

## Bloquants de recette

1. Confirmer la branche, le commit, le déclencheur et le processus de redémarrage Plesk/Express du site public.
2. Confirmer la priorité entre les routes Express et les fichiers statiques `public/sitemap*.xml`.
3. Retirer du dépôt et faire tourner le secret JWT présent dans la configuration PM2 de l’application.

## Données à structurer

1. Créer un endpoint d’agrégation SEO read-only sans données de contact.
2. Structurer à terme la commune des profils par code NIS.
3. Persister les compétences par identifiant plutôt que par libellé libre.
4. Ne rouvrir une combinaison qu’après 3 professionnels locaux et 1 demande validée avec mapping vérifié.

## Bloquants métier

1. Le stock des trois combinaisons est contrôlé et insuffisant ; les pages restent fermées.
2. Le lot initial est francophone, y compris pour Anvers, Gand, Bruges, Louvain et Malines.
3. Les 23 métiers/services sont validés ; les spécialités B restent en priorité 2.

## Technique et données

1. Confirmer que la production exécute bien `server.js`. Le dépôt contient aussi un `.htaccess` WordPress/LiteSpeed incohérent avec Express.
2. Ajouter à terme un endpoint public d’agrégats SEO ne retournant que les nombres de professionnels éligibles et demandes validées par couple métier/commune.
3. Définir la fraîcheur, la désactivation et le consentement des profils avant toute page profil indexable.
4. Remplacer l’allowlist par des seuils automatiques seulement après validation du mapping de données.
5. Envisager des slugs persistants en base lorsque le back-office gérera la taxonomie et les langues.

## Contenu et acquisition

1. Valider éditorialement les noms SEO, synonymes et textes métier.
2. Prioriser les villes selon la demande commerciale et la couverture réelle, pas uniquement la taille démographique.
3. Définir un calendrier d’enrichissement local plutôt qu’une ouverture simultanée des 581 communes.
4. Mesurer après mise en production via analytics et outils d’indexation disponibles; Search Console n’était pas dans le périmètre de l’audit initial.
