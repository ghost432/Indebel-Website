const SITE_URL = 'https://indebel.be';

function clamp(text, maximum) {
    if (text.length <= maximum) return text;
    return `${text.slice(0, maximum - 1).replace(/\s+\S*$/, '')}…`;
}

function buildMetadata({ kind, trade, locality, indexable = true }) {
    const definitions = {
        national: {
            title: 'Construction et rénovation en Belgique | Indebel',
            description: 'Trouvez le professionnel adapté à vos travaux de construction ou rénovation en Belgique et publiez une demande de devis détaillée.',
            path: '/construction/'
        },
        trade: {
            title: `${trade?.seoName} en Belgique : trouvez un professionnel | Indebel`,
            description: `Décrivez votre projet de ${trade?.seoName.toLowerCase()} et trouvez un professionnel en Belgique avec Indebel. Travaux, villes couvertes et demande de devis.`,
            path: `/construction/${trade?.slug}/`
        },
        locality: {
            title: `Artisans de la construction à ${locality?.name} | Indebel`,
            description: `Trouvez un professionnel pour vos travaux de construction ou rénovation à ${locality?.name}. Consultez les métiers et publiez votre projet sur Indebel.`,
            path: `/construction/${locality?.slug}/`
        },
        combination: {
            title: `${trade?.seoName} à ${locality?.name} : trouvez un professionnel | Indebel`,
            description: `Besoin d’un ${trade?.seoName.toLowerCase()} à ${locality?.name} ? Décrivez vos travaux et sollicitez des professionnels pertinents avec Indebel.`,
            path: `/construction/${trade?.slug}/${locality?.slug}/`
        }
    };
    const selected = definitions[kind];
    return {
        title: clamp(selected.title, 68),
        description: clamp(selected.description, 160),
        path: selected.path,
        canonical: `${SITE_URL}${selected.path}`,
        robots: indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow',
        ogType: 'website'
    };
}

module.exports = { SITE_URL, buildMetadata };
