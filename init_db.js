const db = require('./db');

async function initDb() {
    try {
        // Check if database exists, if not create it (needs root connection without db first usually, 
        // but often we just assume the db usually exists or we create it via command line.
        // For simplicity in this env, we'll assume we can connect or we might fail if db doesn't exist.
        // A better approach is to run a CREATE DATABASE if it doesn't exist script separately.

        const connection = await db.getConnection();

        console.log('Connected to database.');

        // Create Sectors Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sectors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                icon_class VARCHAR(50) DEFAULT 'fas fa-briefcase',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Sectors table checked/created.');

        // Create Blog Posts Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT,
                image_url VARCHAR(255),
                published_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Blog posts table checked/created.');

        // Create Users Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table checked/created.');

        // Create Contacts Table
        await connection.query('DROP TABLE IF EXISTS contacts');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                user_type ENUM('particulier', 'prestataire', 'recruteur') DEFAULT 'particulier',
                bce_number VARCHAR(50),
                subject VARCHAR(255),
                message TEXT NOT NULL,
                status ENUM('unread', 'read') DEFAULT 'unread',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Contacts table recreated with new schema.');

        // Create Page Visits Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS page_visits (
                id INT AUTO_INCREMENT PRIMARY KEY,
                url VARCHAR(255) NOT NULL,
                visitor_ip VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Page visits table created.');

        // Create Site Settings Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS site_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('Site settings table created.');

        // Seed Admin User
        const [admins] = await connection.query('SELECT * FROM users WHERE email = ?', ['noreply@indebel.be']);
        if (admins.length === 0) {
            // Password is 'admin123' - In production use bcrypt!
            await connection.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Admin Indebel', 'noreply@indebel.be', 'admin123', 'admin']);
            console.log('Admin user created.');
        }

        // Seed some initial data if empty
        const [sectors] = await connection.query('SELECT count(*) as count FROM sectors');
        if (sectors[0].count === 0) {
            await connection.query(`
                INSERT INTO sectors (name, icon_class) VALUES 
                ('Rénovation et Construction', 'fas fa-hammer'),
                ('Transport et Logistique', 'fas fa-truck'),
                ('Nettoyage et Multiservices', 'fas fa-broom')
            `);
            console.log('Initial sectors inserted.');
        }

        // Add category column if it doesn't exist (in case table existed)
        const [columns] = await connection.query('SHOW COLUMNS FROM blog_posts LIKE "category"');
        if (columns.length === 0) {
            await connection.query('ALTER TABLE blog_posts ADD COLUMN category ENUM("particulier", "prestataire", "recruteur", "indebel", "general") DEFAULT "general"');
            console.log('Category column added to blog_posts.');
        } else {
            await connection.query('ALTER TABLE blog_posts MODIFY COLUMN category ENUM("particulier", "prestataire", "recruteur", "indebel", "general") DEFAULT "general"');
            console.log('Category ENUM updated.');
        }

        // Seed Blog Posts
        console.log('Clearing and re-seeding blog posts...');
        await connection.query('DELETE FROM blog_posts');
        await connection.query(`
                INSERT INTO blog_posts (title, content, image_url, category, published_date) VALUES 
                (
                    "Réforme majeure en Wallonie : l'accès à l'entrepreneuriat simplifié", 
                    "L'accès à la profession est une compétence régionale depuis le 1er janvier 2015. Cela a bouleversé les conditions d’accès à la gestion de base ainsi qu’aux groupes de professions réglementées.", 
                    "images/blog-1.webp", 
                    "prestataire",
                    "2025-07-25"
                ),
                (
                    "Indebel – La Plateforme Qui Révolutionne le Travail", 
                    "Dans un monde professionnel en perpétuelle évolution, la flexibilité et l'autonomie sont devenues des priorités pour de nombreux travailleurs. C'est dans ce contexte qu'Indebel se positionne comme un acteur clé de la mise en relation entre talents et entreprises.", 
                    "images/blog-2.jpg", 
                    "indebel",
                    "2025-07-10"
                ),
                (
                    "Pourquoi les Entreprises Font Appel aux Indépendants ?", 
                    "La flexibilité est devenue un atout majeur pour les entreprises modernes. Faire appel à des indépendants permet de répondre à des besoins ponctuels sans les contraintes de l'embauche classique.", 
                    "images/blog-3.jpg", 
                    "recruteur",
                    "2025-07-05"
                ),
                (
                    "Comment bien préparer sa demande de devis ?", 
                    "Pour obtenir des devis précis, il est essentiel de bien décrire votre projet. Découvrez nos conseils pour ne rien oublier dans votre descriptif.", 
                    "images/blog-p1.jpg", 
                    "particulier",
                    "2025-08-01"
                ),
                (
                    "5 conseils pour choisir le bon artisan", 
                    "Le prix n'est pas le seul critère. Vérifiez les assurances, les références et le feeling lors de la première rencontre.", 
                    "images/blog-p2.jpg", 
                    "particulier",
                    "2025-08-02"
                ),
                (
                    "Les primes à la rénovation en Belgique en 2025", 
                    "Saviez-vous que vous pouviez récupérer une partie de vos frais de travaux ? Le point sur les aides en Wallonie et à Bruxelles.", 
                    "images/blog-p3.jpg", 
                    "particulier",
                    "2025-08-03"
                ),
                (
                    "Déménagement : la checklist pour ne rien oublier", 
                    "Changement d'adresse, transfert de contrats, cartons... nous vous aidons à organiser votre départ en toute sérénité.", 
                    "images/blog-p4.jpg", 
                    "particulier",
                    "2025-08-04"
                ),
                (
                    "Optimiser son profil Indebel pour décrocher plus de missions", 
                    "Votre profil est votre vitrine. Voici comment le rendre irrésistible pour les entreprises et les particuliers.", 
                    "images/blog-pr1.jpg", 
                    "prestataire",
                    "2025-08-05"
                ),
                (
                    "Le Label Indebel : gage de qualité pour vos clients", 
                    "Découvrez comment obtenir notre label et ce qu'il apporte à votre crédibilité en tant qu'expert indépendant. Un gage de confiance pour tout l'écosystème Indebel.", 
                    "images/blog-pr2.jpg", 
                    "indebel",
                    "2025-08-06"
                ),
                (
                    "Recrutement Freelance : les obligations légales en Belgique", 
                    "Cadre juridique, contrats et responsabilités : tout ce que les recruteurs doivent savoir avant d'embaucher.", 
                    "images/blog-r1.jpg", 
                    "recruteur",
                    "2025-08-07"
                ),
                (
                    "Pourquoi le freelancing est l'avenir des PME ?", 
                    "Gain d'agilité, expertise pointue et maîtrise des coûts. Les PME belges se tournent de plus en plus vers les indépendants.", 
                    "images/blog-r2.jpg", 
                    "recruteur",
                    "2025-08-08"
                ),
                (
                    "Bien briefer un freelance pour un projet réussi", 
                    "Un bon cahier des charges est la clé du succès. Apprenez à communiquer clairement vos attentes pour garantir une collaboration fructueuse sur Indebel.", 
                    "images/blog-r3.jpg", 
                    "indebel",
                    "2025-08-09"
                ),
                (
                    "La gestion des ressources externes en 2025", 
                    "Les outils et méthodes pour intégrer efficacement des indépendants au sein de vos équipes internes.", 
                    "images/blog-r4.jpg", 
                    "recruteur",
                    "2025-08-10"
                ),
                (
                    "Indebel s'agrandit : Nouveaux bureaux à Bruxelles",
                    "Pour mieux vous accompagner, Indebel ouvre un nouvel espace au cœur de la capitale. Une étape clé dans notre croissance européenne.",
                    "images/blog-2.jpg",
                    "indebel",
                    "2025-08-11"
                ),
                (
                    "Comment gérer sa comptabilité en tant que freelance ?",
                    "Facturation, TVA, frais déductibles : les bases essentielles pour garder vos comptes au vert et éviter les mauvaises surprises.",
                    "images/blog-pr1.jpg",
                    "prestataire",
                    "2025-08-12"
                ),
                (
                    "Le réseautage : clé du succès pour les indépendants",
                    "Pourquoi et comment construire un réseau solide en Belgique pour obtenir des missions récurrentes et de qualité.",
                    "images/blog-pr2.jpg",
                    "prestataire",
                    "2025-08-13"
                )
            `);
        console.log('Comprehensive blog posts seeded.');

        connection.release();
        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Database initialization failed:', err);
        if (err.code === 'ER_BAD_DB_ERROR') {
            console.log('Please create the database "indebel_db" in your MySQL server.');
        }
    }
}

// Run if called directly
if (require.main === module) {
    initDb();
}

module.exports = initDb;
