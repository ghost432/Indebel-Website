# Taxonomie Rénovation & Construction

La taxonomie reprend exactement les 30 compétences actives observées dans la source. Elle ne modifie ni la base ni les libellés du back-office. La couche SEO normalise seulement le nom public et le slug.

## Classes

- **A — métier / intention forte** : 16 entrées, indexables avec contenu spécifique.
- **B — service ou spécialité** : 9 entrées, dont 7 indexables dans le premier lot.
- **C — catégorie large** : 3 entrées, non indexables comme landing autonome.
- **D — trop vague** : 2 entrées, jamais utilisées comme landing.

| ID | Nom source | Nom SEO | Type | Indexable | Décision |
|---:|---|:---:|:---:|:---:|---|
| 61 | Plombier | Plombier | A | oui | Intention transactionnelle directe |
| 63 | Carrelage | Carreleur | A | oui | Nom métier plus naturel |
| 3 | Maçonnerie | Maçon | A | oui | Landing centrée sur le métier |
| 4 | Travaux spécialisés | Travaux spécialisés | D | non | Libellé sans intention définie |
| 5 | Toiture | Couvreur | A | oui | Intention métier principale |
| 6 | Couverture | Couverture de toiture | B | non | Rattachée à Couvreur pour éviter la cannibalisation |
| 7 | Gros œuvre | Gros œuvre | C | non | Catégorie structurelle trop large |
| 8 | Travaux de préparation des sites | Terrassier | B | oui | Service identifiable après normalisation |
| 9 | Installateur de panneaux photovoltaïques | Installateur photovoltaïque | A | oui | Intention métier claire |
| 10 | Chauffage | Chauffagiste | A | oui | Intention forte et landing historique |
| 11 | Électricité | Électricien | A | oui | Intention forte et landing historique |
| 12 | Ventilation / Climatisation | Installateur ventilation et climatisation | A | oui | Compétence source cohérente |
| 13 | Plafonnage / Cloisons | Plafonneur | A | oui | Nom métier plus recherché |
| 14 | Isolation | Entreprise d’isolation | B | oui | Service distinct à forte intention |
| 15 | Menuiserie Générale | Menuisier | A | oui | Casse et formulation normalisées |
| 16 | Serrurerie / Métallerie | Serrurier-métallier | A | oui | Métier mixte cohérent avec la source |
| 17 | Revêtements de sols | Poseur de revêtements de sol | B | oui | Service distinct du carrelage |
| 18 | Revêtements muraux | Poseur de revêtements muraux | B | oui | Spécialité distincte à surveiller |
| 19 | Peinture | Peintre en bâtiment | A | oui | Intention métier forte |
| 20 | Ravalement de façades | Entreprise de ravalement de façade | B | oui | Service autonome exploitable |
| 21 | Étanchéité | Entreprise d’étanchéité | B | oui | Besoin technique distinct |
| 22 | Énergies renouvelables | Énergies renouvelables | C | non | Catégorie couvrant plusieurs métiers |
| 23 | Sécurité incendie | Installateur en sécurité incendie | B | oui | Service réglementaire distinct |
| 24 | Aménagement extérieur | Entreprise d’aménagement extérieur | C | non | À ouvrir après sous-taxonomie |
| 25 | Gestion des déchets | Gestion des déchets de chantier | B | non | Offre Indebel non déterminée |
| 60 | Auditeur Logement agréé | Auditeur Logement agréé | A | oui | Intention spécialisée wallonne |
| 1 | Architecte (espace final source) | Architecte | A | oui | Libellé nettoyé dans la configuration |
| 62 | Ingénieur en génie civil | Ingénieur civil en construction | A | oui | Intention spécialisée claire |
| 2 | Piscines | Pisciniste | A | oui | Métier identifiable |
| 64 | Autres | Autres | D | non | Jamais transformé en URL SEO |

Les détails éditoriaux, synonymes, relations et notes sont versionnés dans `metiers-seo.json`. À long terme, des slugs persistants en base seraient utiles si le back-office devient propriétaire de la taxonomie multilingue, mais aucune migration n’est justifiée pour ce premier lot.
