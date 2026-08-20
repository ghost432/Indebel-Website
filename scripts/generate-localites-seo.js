const fs = require('fs');
const path = require('path');

const SOURCE_PATH = process.env.INDEBEL_COMMUNES_SOURCE
    || path.resolve(__dirname, '../../Indebel-App/frontend/src/data/belgianCommunes.js');
const OUTPUT_PATH = path.resolve(__dirname, '../seo-implementation/localites-seo.json');

const PROVINCES_BY_NIS_PREFIX = {
    11: 'Province d’Anvers', 12: 'Province d’Anvers', 13: 'Province d’Anvers',
    21: 'Région de Bruxelles-Capitale', 23: 'Province du Brabant flamand',
    24: 'Province du Brabant flamand', 25: 'Province du Brabant wallon',
    31: 'Province de Flandre occidentale', 32: 'Province de Flandre occidentale',
    33: 'Province de Flandre occidentale', 34: 'Province de Flandre occidentale',
    35: 'Province de Flandre occidentale', 36: 'Province de Flandre occidentale',
    37: 'Province de Flandre occidentale', 41: 'Province de Flandre orientale',
    42: 'Province de Flandre orientale', 43: 'Province de Flandre orientale',
    44: 'Province de Flandre orientale', 45: 'Province de Flandre orientale',
    46: 'Province de Flandre orientale', 51: 'Province de Hainaut',
    52: 'Province de Hainaut', 53: 'Province de Hainaut', 54: 'Province de Hainaut',
    55: 'Province de Hainaut', 56: 'Province de Hainaut', 57: 'Province de Hainaut',
    58: 'Province de Hainaut', 61: 'Province de Liège', 62: 'Province de Liège',
    63: 'Province de Liège', 64: 'Province de Liège', 71: 'Province de Limbourg',
    72: 'Province de Limbourg', 73: 'Province de Limbourg', 81: 'Province de Luxembourg',
    82: 'Province de Luxembourg', 83: 'Province de Luxembourg', 84: 'Province de Luxembourg',
    85: 'Province de Luxembourg', 91: 'Province de Namur', 92: 'Province de Namur',
    93: 'Province de Namur'
};

const PRIORITY_OVERRIDES = {
    Bruxelles: {
        priority: 1, indexable: true,
        intro: "À Bruxelles, les demandes de rénovation concernent aussi bien les appartements que les maisons des dix-neuf communes. Indebel aide à cadrer le besoin et à solliciter un professionnel selon le métier requis.",
        focus: ['rénovation d’appartement', 'mise en conformité', 'dépannage technique'],
        guidance: [
            "Pour une intervention dans un appartement, la demande doit distinguer la partie privative d’un éventuel équipement commun et préciser l’étage, l’accès au chantier et les plages d’intervention possibles.",
            "Pour une maison ou un local, indiquez la commune bruxelloise exacte, le code postal, l’état de l’existant et les contraintes de livraison. Ces informations sont plus utiles qu’une simple mention « Bruxelles »."
        ],
        nearby: ['anderlecht', 'ixelles', 'uccle']
    },
    Liège: {
        priority: 1, indexable: true,
        intro: "À Liège, Indebel met en relation les porteurs de projets avec des professionnels pour l’entretien, la réparation et la rénovation du bâti. La sélection part du travail à réaliser, pas d’une liste générique d’entreprises.",
        focus: ['chauffage', 'peinture', 'rénovation intérieure'],
        guidance: [
            "Pour le chauffage, précisez l’équipement en place, son énergie, le symptôme constaté et l’existence d’un entretien récent. Une demande d’entretien ne relève pas du même périmètre qu’un remplacement complet.",
            "Pour les finitions intérieures, joignez des photos des supports et séparez les réparations, la préparation et la finition attendue. Le code postal et les conditions d’accès complètent utilement le brief liégeois."
        ], nearby: ['seraing', 'herstal']
    },
    Charleroi: {
        priority: 1, indexable: true,
        intro: "À Charleroi, la plateforme couvre les besoins de rénovation intérieure, de gros travaux et d’amélioration énergétique. Une demande détaillée permet d’orienter le projet vers la compétence adaptée.",
        focus: ['rénovation intérieure', 'isolation', 'maçonnerie'],
        guidance: [
            "Un projet de maçonnerie doit préciser si l’intervention touche un mur porteur, une ouverture, une réparation ou un nouvel ouvrage. Les plans disponibles et des vues larges évitent de réduire le besoin à un intitulé vague.",
            "Pour l’isolation ou la rénovation intérieure, décrivez les parois concernées, leur état et l’occupation des lieux pendant les travaux. Indiquez aussi la section de Charleroi et le code postal du chantier."
        ], nearby: ['châtelet', 'courcelles']
    },
    Namur: {
        priority: 1, indexable: true,
        intro: "À Namur, les projets peuvent porter sur une rénovation complète comme sur une intervention ciblée. Indebel structure la demande par métier afin de faciliter des réponses réellement pertinentes.",
        focus: ['toiture', 'menuiserie', 'électricité'],
        guidance: [
            "Pour une toiture, indiquez sa forme, le matériau visible, la zone du problème et les possibilités d’accès. Une infiltration, un entretien et une réfection complète appellent des diagnostics différents.",
            "Pour la menuiserie ou l’électricité, ajoutez les dimensions, photos ou rapports disponibles. La commune exacte, le code postal et le calendrier souhaité permettent de cadrer le déplacement et l’organisation du chantier namurois."
        ], nearby: ['andenne', 'gembloux']
    },
    Mons: {
        priority: 1, indexable: true,
        intro: "À Mons, Indebel permet de publier un projet de construction ou de rénovation avec son contexte, son calendrier et le métier recherché. Les demandes publiques disponibles alimentent la page sans exposer les coordonnées du demandeur.",
        focus: ['peinture', 'façades', 'chauffage'],
        guidance: [
            "Pour une façade, photographiez le support, les fissures et les traces d’humidité, puis précisez les possibilités d’accès. Le nettoyage, la réparation d’enduit et la finition doivent être séparés dans le descriptif.",
            "Pour la peinture ou le chauffage, détaillez les surfaces ou équipements concernés et l’état actuel. La commune, le code postal et la période d’intervention donnent au professionnel un contexte exploitable autour de Mons."
        ], nearby: ['quaregnon', 'saint-ghislain']
    },
    Anvers: {
        priority: 1, indexable: true,
        intro: "À Anvers, la page rassemble les accès vers les métiers de rénovation couverts par Indebel. Le contenu reste en français dans ce premier lot; une version néerlandaise devra être conçue avant une extension SEO en Flandre.",
        focus: ['rénovation urbaine', 'électricité', 'menuiserie'],
        guidance: [
            "Cette page répond aux recherches francophones visant Anvers. La demande doit conserver le nom officiel utilisé par Indebel, le code postal et une description factuelle du bâtiment, sans prétendre fournir une version néerlandaise.",
            "Pour l’électricité ou la menuiserie, joignez les rapports, mesures et photos disponibles. Pour une rénovation plus large, séparez les lots afin que chaque compétence puisse être évaluée indépendamment."
        ], nearby: ['mortsel', 'schoten']
    },
    Gand: {
        priority: 1, indexable: true,
        intro: "À Gand, Indebel organise la recherche d’un professionnel autour du besoin concret: type de travaux, délai et localisation. Cette première version francophone doit être complétée par une stratégie linguistique validée.",
        focus: ['isolation', 'chauffage', 'rénovation intérieure'],
        guidance: [
            "Le lot actuel traite Gand en français. Pour l’isolation, précisez la paroi, les matériaux connus et l’objectif recherché; pour le chauffage, indiquez l’installation existante et le type d’intervention.",
            "Une rénovation intérieure gagne à être découpée par pièce et par métier. Le code postal, l’accès et la chronologie souhaitée rendent la demande plus précise sans fabriquer de disponibilité locale."
        ], nearby: ['destelbergen', 'merelbeke']
    },
    Bruges: {
        priority: 2, indexable: true,
        intro: "À Bruges, la page donne accès aux métiers de rénovation configurés dans Indebel et aux demandes publiques attribuées de façon fiable à la commune. Aucun volume de professionnels n’est affiché sans agrégat vérifié.",
        focus: ['toiture', 'peinture', 'menuiserie'],
        guidance: [
            "Pour une demande francophone à Bruges, indiquez le code postal et l’adresse du chantier uniquement dans le formulaire privé. Sur la page publique, seuls le métier et la commune servent au cadrage.",
            "Toiture, peinture et menuiserie nécessitent des informations différentes : accès et infiltration pour la première, état des supports pour la deuxième, dimensions et matériaux pour la troisième."
        ], nearby: ['damme', 'zedelgem']
    },
    Louvain: {
        priority: 2, indexable: true,
        intro: "À Louvain, les particuliers peuvent décrire leur projet puis choisir la compétence de construction correspondante. La page locale ne revendique aucune disponibilité qui ne soit pas confirmée par les données Indebel.",
        focus: ['électricité', 'architecture', 'rénovation énergétique'],
        guidance: [
            "Pour l’électricité, un rapport de contrôle ou une liste des circuits concernés clarifie le périmètre. Pour une mission d’architecture, précisez plutôt le programme, les plans existants et le stade du projet.",
            "Une rénovation énergétique doit être découpée entre étude, enveloppe et équipements. Cette page francophone utilise Louvain comme localisation, sans créer d’alias néerlandais ni annoncer un stock non vérifié."
        ], nearby: ['herent', 'kortenberg']
    },
    Malines: {
        priority: 2, indexable: true,
        intro: "À Malines, Indebel relie les demandes de travaux aux métiers configurés sur la plateforme. Les signaux locaux restent volontairement factuels et peuvent être enrichis à mesure que les agrégats deviennent fiables.",
        focus: ['plomberie', 'chauffage', 'peinture'],
        guidance: [
            "Pour la plomberie, décrivez la fuite, l’équipement ou le réseau concerné et l’urgence réelle. Pour le chauffage, ajoutez la marque, l’énergie et l’historique d’entretien lorsque ces informations sont disponibles.",
            "Un chantier de peinture doit distinguer la préparation des supports de la finition. Le formulaire peut ensuite recueillir le code postal, les photos et les contraintes d’accès propres au projet à Malines."
        ], nearby: ['bonheiden', 'sint-katelijne-waver']
    }
};

function slugify(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function parseCommunes(source) {
    const marker = 'export const BELGIAN_COMMUNES_BY_REGION = ';
    const start = source.indexOf(marker);
    const end = source.indexOf('\n\nconst PROVINCES_BY_NIS_PREFIX', start);
    if (start === -1 || end === -1) throw new Error('Format de la source des communes non reconnu');
    return JSON.parse(source.slice(start + marker.length, end));
}

const source = fs.readFileSync(SOURCE_PATH, 'utf8');
const regions = parseCommunes(source);
const localitiesWithBaseSlugs = Object.entries(regions).flatMap(([region, communes]) => communes.map((commune) => {
    const override = PRIORITY_OVERRIDES[commune.name] || {};
    return {
        name: commune.name,
        slug: slugify(commune.name),
        region,
        province: PROVINCES_BY_NIS_PREFIX[String(commune.code).slice(0, 2)] || null,
        nisCode: commune.code,
        seoPriority: override.priority || 3,
        indexableByDefault: override.indexable || false,
        intro: override.intro || null,
        focus: override.focus || [],
        ...(override.guidance ? { guidance: override.guidance } : {}),
        nearby: override.nearby || []
    };
}));

const slugCounts = localitiesWithBaseSlugs.reduce((counts, locality) => {
    counts[locality.slug] = (counts[locality.slug] || 0) + 1;
    return counts;
}, {});
const localities = localitiesWithBaseSlugs.map((locality) => {
    if (slugCounts[locality.slug] === 1) return locality;
    const provinceSuffix = slugify(locality.province || locality.region)
        .replace(/^province-(de-la-|de-l-|du-|d-)?/, '');
    return { ...locality, slug: `${locality.slug}-${provinceSuffix}` };
});

const duplicateSlugs = localities.filter((item, index, all) => all.findIndex((other) => other.slug === item.slug) !== index);
if (localities.length !== 581) throw new Error(`581 communes attendues, ${localities.length} trouvées`);
if (duplicateSlugs.length) throw new Error(`Slugs en doublon: ${duplicateSlugs.map((item) => item.slug).join(', ')}`);

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(localities, null, 2)}\n`);
console.log(`${localities.length} localités générées depuis ${SOURCE_PATH}`);
