# Points restant à valider avant production

## Bloquants métier

1. Confirmer le stock réel de professionnels pour `plombier × Bruxelles`, `électricien × Bruxelles` et `chauffagiste × Liège`. L’allowlist reprend les landings historiques, mais le mapping profil-compétence-localité n’est pas assez fiable pour valider automatiquement l’offre.
2. Décider si Anvers, Gand, Bruges, Louvain et Malines doivent être indexées en français dans le premier lot ou attendre des pages néerlandaises et une stratégie `hreflang`.
3. Valider les 23 métiers/services indexables, notamment les spécialités B susceptibles de faible volume ou de cannibalisation.

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
