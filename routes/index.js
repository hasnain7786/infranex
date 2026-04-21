const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// ── Page Routes ──────────────────────────────────────────────
router.get('/', (req, res) => {
    const articles = getArticles();
    const latestArticles = articles.reverse().slice(0, 3);
    res.render('index', { title: 'Home | Infranex Publishers', latestArticles });
});
router.get('/about', (req, res) => res.render('about', { title: 'About Us | Infranex Publishers' }));
router.get('/services', (req, res) => res.render('services', { title: 'Our Services | Infranex Publishers' }));
router.get('/audiobook-services', (req, res) => res.render('audiobook-services', { title: 'Audio Book Services | Infranex Publishers' }));
router.get('/pricing', (req, res) => res.render('pricing', { title: 'Pricing & Packages | Infranex Publishers', query: req.query }));
router.get('/testimonials', (req, res) => res.render('testimonials', { title: 'Testimonials & Portfolio | Infranex Publishers' }));
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact Us | Infranex Publishers', query: req.query }));

// ── AdSense & Content Routes ───────────────────────────
router.get('/privacy-policy', (req, res) => res.render('privacy-policy', { title: 'Privacy Policy | Infranex Publishers' }));
router.get('/terms-of-service', (req, res) => res.render('terms-of-service', { title: 'Terms of Service | Infranex Publishers' }));
router.get('/disclaimer', (req, res) => res.render('disclaimer', { title: 'Disclaimer | Infranex Publishers' }));
const fs = require('fs');
const path = require('path');

// Helper to get articles
const getArticles = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, '../data/articles.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading articles:', err);
        return [];
    }
};

router.get('/articles', (req, res) => {
    const articles = getArticles();
    res.render('articles', { title: 'Our Articles | Publishing Insights', articles });
});

router.get('/articles/:slug', (req, res) => {
    const articles = getArticles();
    const { slug } = req.params;
    const article = articles.find(a => a.slug === slug);
    
    if (!article) {
        return res.redirect('/articles');
    }
    
    res.render('article-post', { title: `${article.title} | Infranex Publishers`, article });
});

router.get('/sitemap.xml', (req, res) => {
    const articles = getArticles();
    const baseUrl = 'https://infranexpublishers.com';
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Core pages
    ['', '/about', '/services', '/audiobook-services', '/pricing', '/testimonials', '/contact', '/articles', '/privacy-policy', '/terms-of-service', '/disclaimer'].forEach(url => {
        sitemap += `  <url><loc>${baseUrl}${url}</loc><changefreq>weekly</changefreq></url>\n`;
    });
    
    // Article pages
    articles.forEach(article => {
        sitemap += `  <url><loc>${baseUrl}/articles/${article.slug}</loc><changefreq>monthly</changefreq></url>\n`;
    });
    
    sitemap += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
});

// ── Unified Lead POST ─────────────────────────────────────────
// Both the contact form and the pricing modal POST here.
// `source` hidden field tells us where the lead came from.
router.post('/leads', async (req, res) => {
    try {
        const { name, email, phone, package: pkg, message, source } = req.body;

        const newLead = new Lead({
            name,
            email,
            phone: phone || '',
            package: pkg || 'General Inquiry',
            message: message || '',
            source: source || 'contact',
        });

        await newLead.save();

        // Redirect back to whichever page the form came from
        const returnTo = source === 'pricing' ? '/pricing' : '/contact';
        res.redirect(`${returnTo}?success=true`);
    } catch (err) {
        console.error('Lead save error:', err);
        const returnTo = req.body.source === 'pricing' ? '/pricing' : '/contact';
        res.redirect(`${returnTo}?error=true`);
    }
});

// ── Legacy redirects (keep old URLs working) ──────────────────
router.post('/contact', (req, res) => {
    // Forward old contact submissions to /leads
    req.body.source = 'contact';
    res.redirect(307, '/leads');
});

router.post('/inquire', (req, res) => {
    // Forward old pricing submissions to /leads
    req.body.source = 'pricing';
    // Map old field name
    if (req.body.contactInfo && !req.body.phone) req.body.phone = req.body.contactInfo;
    if (req.body.description && !req.body.message) req.body.message = req.body.description;
    res.redirect(307, '/leads');
});

module.exports = router;
