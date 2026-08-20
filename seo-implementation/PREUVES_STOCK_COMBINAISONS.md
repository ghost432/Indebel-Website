# Vérification du stock des combinaisons

Date de contrôle : 20 août 2026. Contrôle strictement en lecture seule, sans conservation d’identité, d’email, de téléphone ou d’adresse.

## Méthode

- 160 identifiants numériques ont été interrogés sur l’endpoint de profil public ; 70 profils ont répondu, soit le même total que le tableau de bord administrateur.
- Le calcul ne conserve que des agrégats : rôle, secteur, compétences, statut de vérification et correspondance textuelle de la localisation.
- 63 profils sont des prestataires et 51 déclarent le secteur `Rénovation & Construction`.
- Les demandes proviennent de `/api/devis/valides` : 27 demandes publiques au moment du contrôle.
- La compétence est rapprochée via les libellés source et synonymes. La ville de la demande doit correspondre exactement au slug SEO ; une correspondance régionale est indiquée séparément.

## Résultats

| Combinaison | Profils métier Belgique | Profils locaux plausibles | Profils locaux vérifiés | Demandes exactes validées | Demandes métier dans la région élargie | Décision |
|---|---:|---:|---:|---:|---:|---|
| Plombier × Bruxelles | 17 | 1 | 1 | 0 | 0 | Non indexable |
| Électricien × Bruxelles | 18 | 2 | 2 | 0 | 0 | Non indexable |
| Chauffagiste × Liège | 13 | 0 | 0 | 0 | 0 | Non indexable |

Les trois couples restent sous les seuils configurés de 3 professionnels locaux et 1 demande validée. Les anciennes landing pages sont donc conservées et les trois redirections sont annulées.

## Fiabilité des mappings

| Mapping | Fiabilité | Limite |
|---|---|---|
| Profil → secteur | Moyenne à forte | Libellé déclaré, sans taxonomie relationnelle persistée sur le profil |
| Profil → compétence | Moyenne à forte | Tableau de libellés, mais pas de clé étrangère vers `competences.id` |
| Profil → commune | Faible | `adresse` en texte libre, sans code NIS ni commune normalisée |
| Demande → métier | Faible à moyenne | Rapprochement textuel entre `type_travaux`, catégorie et synonymes |
| Demande → commune | Moyenne | Champ `ville`, mais saisie non garantie et parfois code postal ou localité voisine |

Un endpoint d’agrégation SEO read-only, sans données de contact, reste nécessaire avant toute ouverture automatique des combinaisons.
