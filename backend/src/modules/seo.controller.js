const db = require('../config/db');

const generateSitemap = async (req, res) => {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    try {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Add static pages
        const staticPages = ['/', '/blog', '/login', '/register'];
        staticPages.forEach(page => {
            xml += `<url><loc>${baseUrl}${page}</loc><priority>${page === '/' ? '1.0' : '0.8'}</priority></url>`;
        });

        // Add dynamic article pages
        const { rows: articles } = await db.query(
            "SELECT slug, updated_at FROM articles WHERE status = 'published' ORDER BY updated_at DESC"
        );
        articles.forEach(article => {
            xml += `
                <url>
                    <loc>${baseUrl}/blog/${article.slug}</loc>
                    <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
                    <priority>0.7</priority>
                </url>
            `;
        });

        // Add more dynamic pages like trips if they have public URLs

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
};

const getRobotsTxt = (req, res) => {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    let content = `User-agent: *\n`;
    content += `Disallow: /admin/\n`;
    content += `Disallow: /profile/\n`;
    content += `Disallow: /payment/\n`;
    content += `Allow: /\n\n`;
    content += `Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(content);
};

module.exports = {
    generateSitemap,
    getRobotsTxt,
};
