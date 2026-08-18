(function () {
    function truncateWords(text, limit) {
        if (!text) return "";
        // Remove HTML tags for the excerpt if any
        const stripped = text.replace(/<[^>]*>?/gm, '');
        const words = stripped.trim().split(/\s+/);
        if (words.length <= limit) return stripped;
        return words.slice(0, limit).join(" ") + "...";
    }

    async function loadBlogs(category, containerId, limit = 4, page = 1) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const paginationId = `pagination-${category}`;
        let paginationContainer = document.getElementById(paginationId);

        try {
            const response = await fetch(`/api/blog?category=${category}&limit=${limit}&page=${page}`);
            const result = await response.json();
            const blogs = result.data || [];
            const totalPages = result.totalPages || 1;

            if (blogs.length === 0) {
                container.innerHTML = `
                <div style="grid-column: 1/-1; background: linear-gradient(135deg, rgba(4,76,243,0.05) 0%, rgba(251,100,28,0.05) 100%); border: 1px dashed rgba(4,76,243,0.3); border-radius: 16px; padding: 40px 20px; text-align: center;">
                    <div style="width: 60px; height: 60px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; box-shadow: 0 10px 25px rgba(4,76,243,0.1); color: #044CF3; font-size: 1.5rem;">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <h3 style="color: #044CF3; font-size: 1.25rem; font-weight: 700; margin-bottom: 10px;">Dernières Actualités</h3>
                    <p style="color: #64748b; font-size: 0.95rem;">Aucun article trouvé dans cette catégorie pour le moment. Revenez bientôt !</p>
                </div>`;
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }

            container.innerHTML = blogs.map(blog => {
                // Check if image is a full URL (http/https) or a local path
                let imageUrl = blog.image_url || 'images/logo.png';
                if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                    imageUrl = '/' + imageUrl;
                }

                return `
                <article class="blog-card" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(4,76,243,0.06); transition: all 0.3s ease; border: 1px solid rgba(4,76,243,0.08); display: flex; flex-direction: column; height: 100%;" onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 15px 35px rgba(4,76,243,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 10px 30px rgba(4,76,243,0.06)'">
                    <div class="blog-image-container" style="position: relative; overflow: hidden; padding-top: 60%;">
                        <img src="${imageUrl}" alt="${blog.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        <span style="position: absolute; top: 15px; left: 15px; background: #044CF3; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(4,76,243,0.3);">${category}</span>
                    </div>
                    <div class="blog-content" style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                        <span class="blog-date" style="font-size: 0.85rem; color: #64748b; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;"><i class="far fa-calendar-alt" style="color: #FB641C;"></i> ${new Date(blog.published_date).toLocaleDateString('fr-FR')}</span>
                        <h3 style="font-size: 1.25rem; line-height: 1.4; margin: 0 0 12px 0; color: #082151; font-weight: 800;">${blog.title}</h3>
                        <p style="font-size: 0.95rem; color: #64748b; margin-bottom: 20px; line-height: 1.6; flex-grow: 1;">
                            ${truncateWords(blog.content, 30)}
                        </p>
                        <a href="/blog-articles?id=${blog.id}" class="read-more" style="display: inline-flex; align-items: center; gap: 8px; color: #FB641C; font-weight: 700; text-decoration: none; font-size: 0.95rem; transition: gap 0.2s ease;" onmouseover="this.style.gap='12px'" onmouseout="this.style.gap='8px'">Lire l'article <i class="fas fa-arrow-right"></i></a>
                    </div>
                </article>
            `}).join('');

            // Render Pagination if controls container exists
            if (paginationContainer && totalPages > 1) {
                let html = '';
                if (page > 1) {
                    html += `<button type="button" onclick="event.preventDefault(); event.stopPropagation(); BlogLoader.loadBlogs('${category}', '${containerId}', ${limit}, ${page - 1}); window.scrollTo({top: document.getElementById('${containerId}').offsetTop - 100, behavior: 'smooth'});" style="padding:10px 20px; background:white; border:2px solid #044CF3; color:#044CF3; border-radius:30px; cursor:pointer; font-weight:700; transition:all 0.3s ease; box-shadow:0 4px 10px rgba(4,76,243,0.1);" onmouseover="this.style.background='#044CF3'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#044CF3'"><i class="fas fa-chevron-left"></i> Précédent</button>`;
                }
                html += `<span style="align-self:center; font-weight:800; font-size:1.1rem; color:#082151;">Page ${page} / ${totalPages}</span>`;
                if (page < totalPages) {
                    html += `<button type="button" onclick="event.preventDefault(); event.stopPropagation(); BlogLoader.loadBlogs('${category}', '${containerId}', ${limit}, ${page + 1}); window.scrollTo({top: document.getElementById('${containerId}').offsetTop - 100, behavior: 'smooth'});" style="padding:10px 20px; background:white; border:2px solid #044CF3; color:#044CF3; border-radius:30px; cursor:pointer; font-weight:700; transition:all 0.3s ease; box-shadow:0 4px 10px rgba(4,76,243,0.1);" onmouseover="this.style.background='#044CF3'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#044CF3'">Suivant <i class="fas fa-chevron-right"></i></button>`;
                }
                paginationContainer.innerHTML = html;
                paginationContainer.style.display = 'flex';
                paginationContainer.style.justifyContent = 'center';
                paginationContainer.style.gap = '15px';
                paginationContainer.style.marginTop = '40px';
            }
        } catch (err) {
            console.error('Error loading blogs:', err);
            container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Erreur lors du chargement des articles.</p>';
        }
    }

    // Auto-load if container exists
    document.addEventListener('DOMContentLoaded', () => {
        loadBlogs('particulier', 'blog-particulier-container');
        loadBlogs('prestataire', 'blog-prestataire-container');
        loadBlogs('recruteur', 'blog-recruteur-container');

        // General Indebel blogs for homepage or main blog
        loadBlogs('indebel', 'blog-indebel-container');

        // Comprehensive lists for specific blog pages
        loadBlogs('particulier', 'blog-list-particulier', 12);
        loadBlogs('prestataire', 'blog-list-prestataire', 12);
        loadBlogs('recruteur', 'blog-list-recruteur', 12);
    });

    window.BlogLoader = { loadBlogs };
})();
