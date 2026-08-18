const express = require('express');
const path = require('path');
const db = require('./db');
const multer = require('multer');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const port = 3000;

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.static('public'));

// Visitor Tracking Middleware
app.use(async (req, res, next) => {
    // Only track GET requests to non-API and non-static asset paths
    if (req.method === 'GET' &&
        !req.path.startsWith('/api/') &&
        !req.path.includes('.') &&
        !req.path.startsWith('/admin')) {

        try {
            await queryDB(
                'INSERT INTO page_visits (url, visitor_ip, user_agent) VALUES (?, ?, ?)',
                [req.path, req.ip, req.get('User-Agent')]
            );
        } catch (e) {
            console.error('Tracking error:', e.message);
        }
    }
    next();
});

// Mock Data for Fallback
let mockSectors = [
    { id: 1, name: 'Rénovation et Construction', icon_class: 'fas fa-hammer' },
    { id: 2, name: 'Transport et Logistique', icon_class: 'fas fa-truck' },
    { id: 3, name: 'Nettoyage et Multiservices', icon_class: 'fas fa-broom' }
];

let mockBlogPosts = [
    {
        id: 1,
        title: "Comment bien préparer sa demande de devis ?",
        content: "Pour obtenir des devis précis, il est essentiel de bien décrire votre projet. Découvrez nos conseils pour ne rien oublier dans votre descriptif.",
        image_url: "images/blog-p1.jpg",
        category: "particulier",
        published_date: "2025-08-01"
    },
    {
        id: 2,
        title: "5 conseils pour choisir le bon artisan",
        content: "Le prix n'est pas le seul critère. Vérifiez les assurances, les références et le feeling lors de la première rencontre.",
        image_url: "images/blog-p2.jpg",
        category: "particulier",
        published_date: "2025-08-02"
    },
    {
        id: 3,
        title: "Indebel – La Plateforme Qui Révolutionne le Travail",
        content: "Dans un monde professionnel en perpétuelle évolution, la flexibilité et l'autonomie sont devenues des priorités pour de nombreux travailleurs.",
        image_url: "images/blog-2.jpg",
        category: "prestataire",
        published_date: "2025-07-10"
    },
    {
        id: 4,
        title: "Pourquoi les Entreprises Font Appel aux Indépendants ?",
        content: "La flexibilité est devenue un atout majeur pour les entreprises modernes. Faire appel à des indépendants permet de répondre à des besoins ponctuels.",
        image_url: "images/blog-3.jpg",
        category: "recruteur",
        published_date: "2025-07-05"
    }
];

// Database Wrapper Helper
async function queryDB(sql, params = []) {
    try {
        const [rows] = await db.query(sql, params);
        return rows;
    } catch (err) {
        console.warn('Database error (falling back to mock data):', err.message);
        return null; // Signal failure to fallback
    }
}

// API Routes

// 1. Sectors API
app.get('/api/sectors', async (req, res) => {
    const rows = await queryDB('SELECT * FROM sectors');
    if (rows) {
        res.json(rows);
    } else {
        res.json(mockSectors);
    }
});

app.post('/api/sectors', async (req, res) => {
    const { name, icon_class } = req.body;
    const result = await queryDB('INSERT INTO sectors (name, icon_class) VALUES (?, ?)', [name, icon_class]);

    if (result) {
        res.status(201).json({ id: result.insertId, name, icon_class });
    } else {
        const newSector = { id: mockSectors.length + 1, name, icon_class };
        mockSectors.push(newSector);
        res.status(201).json(newSector);
    }
});

// 2. Blog API
app.get('/api/blog', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const category = req.query.category;
    const offset = (page - 1) * limit;

    let rows, total;

    if (category) {
        rows = await queryDB('SELECT * FROM blog_posts WHERE category = ? ORDER BY published_date DESC LIMIT ? OFFSET ?', [category, limit, offset]);
        const totalResult = await queryDB('SELECT COUNT(*) as count FROM blog_posts WHERE category = ?', [category]);
        total = totalResult ? totalResult[0].count : mockBlogPosts.filter(p => p.category === category).length;
    } else {
        rows = await queryDB('SELECT * FROM blog_posts ORDER BY published_date DESC LIMIT ? OFFSET ?', [limit, offset]);
        const totalResult = await queryDB('SELECT COUNT(*) as count FROM blog_posts');
        total = totalResult ? totalResult[0].count : mockBlogPosts.length;
    }

    if (rows) {
        res.json({
            data: rows,
            total: total,
            page: page,
            limit: limit,
            totalPages: Math.ceil(total / limit)
        });
    } else {
        // Fallback to mock data with filtering
        const filteredMock = category ? mockBlogPosts.filter(p => p.category === category) : mockBlogPosts;
        res.json({
            data: filteredMock.slice(offset, offset + limit),
            total: filteredMock.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(filteredMock.length / limit)
        });
    }
});

app.post('/api/blog', upload.single('image'), async (req, res) => {
    const { title, content, published_date, category } = req.body;
    let image_url = req.body.image_url; // Fallback to URL if provided

    if (req.file) {
        image_url = 'uploads/' + req.file.filename;
    }

    const result = await queryDB('INSERT INTO blog_posts (title, content, image_url, published_date, category) VALUES (?, ?, ?, ?, ?)', [title, content, image_url, published_date, category || 'general']);

    if (result) {
        res.status(201).json({ id: result.insertId, title, content, image_url, published_date, category });
    } else {
        const newPost = { id: mockBlogPosts.length + 1, title, content, image_url, published_date, category: category || 'general' };
        mockBlogPosts.unshift(newPost);
        res.status(201).json(newPost);
    }
});

app.put('/api/blog/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, content, published_date, category } = req.body;
    let image_url = req.body.image_url;

    if (req.file) {
        image_url = 'uploads/' + req.file.filename;
    }

    let sql = 'UPDATE blog_posts SET title=?, content=?, published_date=?, category=?';
    let params = [title, content, published_date, category];

    if (image_url) {
        sql += ', image_url=?';
        params.push(image_url);
    }

    sql += ' WHERE id=?';
    params.push(id);

    const result = await queryDB(sql, params);

    if (result) {
        res.json({ success: true });
    } else {
        const idx = mockBlogPosts.findIndex(p => p.id == id);
        if (idx !== -1) {
            mockBlogPosts[idx] = { ...mockBlogPosts[idx], title, content, published_date, category };
            if (image_url) mockBlogPosts[idx].image_url = image_url;
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    const { id } = req.params;
    const result = await queryDB('DELETE FROM blog_posts WHERE id=?', [id]);

    if (result) {
        res.json({ success: true });
    } else {
        mockBlogPosts = mockBlogPosts.filter(p => p.id != id);
        res.json({ success: true });
    }
});

// 3. User & Auth API
app.post('/api/register', async (req, res) => {
    const { name, email } = req.body;
    const password = req.body.password || req.body.mot_de_passe;
    // Check if user exists
    const existing = await queryDB('SELECT * FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const result = await queryDB('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, 'user']);
    if (result) {
        res.status(201).json({ success: true, message: 'Inscription réussie' });
    } else {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password || req.body.mot_de_passe;
    const users = await queryDB('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

    if (users && users.length > 0) {
        const user = users[0];
        // Minimal session handling (in real app use JWT/Sessions)
        res.json({ success: true, data: { token: 'fake-jwt-token-123', user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
    } else {
        res.status(401).json({ error: 'Identifiants invalides' });
    }
});

// Admin User Management
app.get('/api/users', async (req, res) => {
    const rows = await queryDB('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows || []);
});

app.post('/api/users', async (req, res) => {
    const { name, email, password, role } = req.body;
    const result = await queryDB('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role || 'user']);

    if (result) {
        res.status(201).json({ success: true });
    } else {
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
});

// Legacy static administration page. The current dashboard is served through
// the React proxy below at /admin/dashboard.
app.get('/admin-classic', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Contact Page Route
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// About Us Route
app.get('/a-propos-de-nous', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// API: Submit Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, user_type, bce_number, subject, message } = req.body;
    try {
        await queryDB(
            'INSERT INTO contacts (name, email, phone, user_type, bce_number, subject, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, user_type, bce_number, subject, message]
        );
        res.status(201).json({ message: 'Contact saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save contact' });
    }
});

// API: Get Contacts (Admin)
app.get('/api/admin/contacts', async (req, res) => {
    // In production, check session/cookie for admin role
    const messages = await queryDB('SELECT * FROM contacts ORDER BY created_at DESC');
    res.json(messages || []);
});

// API: Get Unread Count (Admin Sidebar)
app.get('/api/admin/contacts/count', async (req, res) => {
    const result = await queryDB("SELECT count(*) as count FROM contacts WHERE status = 'unread'");
    res.json({ count: result ? result[0].count : 0 });
});

// API: Detailed Stats (Dashboard)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [users, sectors, messages] = await Promise.all([
            queryDB('SELECT COUNT(*) as count FROM users'),
            queryDB('SELECT COUNT(*) as count FROM sectors'),
            queryDB('SELECT COUNT(*) as count FROM contacts')
        ]);

        const blogStats = await queryDB('SELECT category, COUNT(*) as count FROM blog_posts GROUP BY category');
        const totalVisits = await queryDB('SELECT COUNT(*) as count FROM page_visits');
        const popularPages = await queryDB('SELECT url, COUNT(*) as count FROM page_visits GROUP BY url ORDER BY count DESC LIMIT 5');

        res.json({
            users: users[0].count,
            sectors: sectors[0].count,
            messages: messages[0].count,
            blog: blogStats,
            visits: {
                total: totalVisits[0].count,
                popular: popularPages
            }
        });
    } catch (e) {
        res.status(500).json({ error: 'Stats error' });
    }
});

// API: Mark Contact as Read
app.put('/api/admin/contacts/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await queryDB("UPDATE contacts SET status = 'read' WHERE id = ?", [id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// API: Site Settings
app.get('/api/admin/settings', async (req, res) => {
    try {
        const rows = await queryDB('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        if (rows) {
            rows.forEach(r => {
                try {
                    settings[r.setting_key] = JSON.parse(r.setting_value);
                } catch (e) {
                    settings[r.setting_key] = r.setting_value;
                }
            });
        }
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/admin/settings', async (req, res) => {
    const settings = req.body; // Expecting { key: value, ... }
    try {
        for (const [key, value] of Object.entries(settings)) {
            const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
            await queryDB(
                'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, valStr, valStr]
            );
        }
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// Blog Page Route
app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog.html'));
});

// How It Works Route
app.get('/how-it-works', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'how-it-works.html'));
});

// Partenaires Routes
app.get('/nos-partenaires', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'nos-partenaires.html'));
});
app.get('/partenaire-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'partenaire-details.html'));
});

// FAQ Routes
app.get('/label-indebel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'label-indebel.html'));
});

app.get('/secteurs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'secteurs.html'));
});

// Legal Routes
app.get('/conformite-et-securite', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'conformite-et-securite.html'));
});

app.get('/politique-de-confidentialite', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'politique-de-confidentialite.html'));
});

app.get('/cgu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cgu.html'));
});

app.get('/cgu-particuliers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cgu-particuliers.html'));
});

app.get('/faqs-entreprise', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faqs-entreprise.html'));
});

app.get('/faqs-independants', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faqs-independants.html'));
});

app.get('/faqs-particuliers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faqs-particuliers.html'));
});

// User Type Landing Pages
app.get('/particulier', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'particulier.html'));
});

app.get('/prestataire', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'prestataire.html'));
});

app.get('/recruteur', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'recruteur.html'));
});

app.get('/blog-particulier', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog-particulier.html'));
});

app.get('/blog-prestataire', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog-prestataire.html'));
});

app.get('/blog-recruteur', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog-recruteur.html'));
});

// Blog Article Route
app.get('/blog-articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'blog-articles.html'));
});

// Blog API - Single Article
app.get('/api/blog-article', async (req, res) => {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'ID is required' });

    // Try DB first
    const rows = await queryDB('SELECT * FROM blog_posts WHERE id = ?', [id]);
    let post;
    if (rows && rows.length > 0) {
        post = rows[0];
    } else {
        post = mockBlogPosts.find(p => p.id === parseInt(id));
    }

    if (post) {
        // Get prev and next articles
        let prev, next;

        // Try DB for prev/next
        const allPosts = await queryDB('SELECT id, title FROM blog_posts ORDER BY published_date DESC');
        if (allPosts) {
            const index = allPosts.findIndex(p => p.id === post.id);
            if (index > 0) next = allPosts[index - 1]; // Store object {id, title}
            if (index < allPosts.length - 1) prev = allPosts[index + 1];
        } else {
            // Fallback to mock
            const index = mockBlogPosts.findIndex(p => p.id === post.id);
            if (index > 0) next = mockBlogPosts[index - 1];
            if (index < mockBlogPosts.length - 1) prev = mockBlogPosts[index + 1];
        }

        res.json({
            ...post,
            prev: prev ? { id: prev.id, title: prev.title } : null,
            next: next ? { id: next.id, title: next.title } : null
        });
    } else {
        res.status(404).json({ error: 'Article not found' });
    }
});

// Auth Routes
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// The public site keeps the dashboard on the same local origin while Vite serves
// the React application in development. This avoids sending users to another URL.
const dashboardProxy = createProxyMiddleware({
    target: 'http://localhost:5175',
    changeOrigin: true,
    ws: true,
    onError: (err, req, res) => {
        console.error('Dashboard proxy error:', err.message);
        res.status(502).send('Le tableau de bord local est indisponible.');
    }
});

app.use((req, res, next) => {
    const dashboardRoutes = ['/admin', '/employer', '/freelancer', '/devis', '/missions'];
    const viteAssetRoutes = ['/src/', '/@vite/', '/@react-refresh', '/@id/', '/@fs/', '/node_modules/'];
    const isDashboardRoute = dashboardRoutes.some(route => req.path === route || req.path.startsWith(`${route}/`));
    const isViteAsset = viteAssetRoutes.some(route => req.path === route || req.path.startsWith(route));

    if (isDashboardRoute || isViteAsset) {
        return dashboardProxy(req, res, next);
    }

    next();
});

// Proxy unhandled /api/* requests to the Pro API on port 5000
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/' // rewrite path to include /api since Express stripped it
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err.message);
        res.status(502).json({ error: 'Pro API is unreachable' });
    }
}));

// Catch-all
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Admin panel available at http://localhost:${port}/admin`);
});
