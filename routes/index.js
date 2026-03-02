const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// ── Page Routes ──────────────────────────────────────────────
router.get('/', (req, res) => res.render('index', { title: 'Home | Infranex Publishers' }));
router.get('/about', (req, res) => res.render('about', { title: 'About Us | Infranex Publishers' }));
router.get('/services', (req, res) => res.render('services', { title: 'Our Services | Infranex Publishers' }));
router.get('/audiobook-services', (req, res) => res.render('audiobook-services', { title: 'Audio Book Services | Infranex Publishers' }));
router.get('/pricing', (req, res) => res.render('pricing', { title: 'Pricing & Packages | Infranex Publishers', query: req.query }));
router.get('/testimonials', (req, res) => res.render('testimonials', { title: 'Testimonials & Portfolio | Infranex Publishers' }));
router.get('/contact', (req, res) => res.render('contact', { title: 'Contact Us | Infranex Publishers', query: req.query }));

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
