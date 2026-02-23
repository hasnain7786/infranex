const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Lead = require('../models/Lead');
const requireAdmin = require('../middleware/requireAdmin');

// ── GET: Admin Login Page
router.get('/login', (req, res) => {
    // If already logged in, redirect to dashboard
    if (req.session && req.session.adminId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin-login', { title: 'Admin Login | Infranex Publishers', error: req.query.error });
});

// ── POST: Process Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });

        if (!admin) {
            return res.redirect('/admin/login?error=Invalid credentials');
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.redirect('/admin/login?error=Invalid credentials');
        }

        // Set session
        req.session.adminId = admin._id;
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Admin login error:', err.message);
        res.redirect(`/admin/login?error=Server error: ${encodeURIComponent(err.message)}`);
    }
});

// ── GET: Admin Dashboard (Protected)
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        // Fetch leads, sorted by newest first
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.render('admin-dashboard', {
            title: 'Admin Dashboard | Infranex Publishers',
            leads,
            success: req.query.success,
            error: req.query.error
        });
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).send('Error loading dashboard');
    }
});

// ── POST: Update Lead Status
router.post('/leads/:id/status', requireAdmin, async (req, res) => {
    try {
        await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error updating status:', err);
        res.redirect('/admin/dashboard');
    }
});

// ── POST: Delete Lead
router.post('/leads/:id/delete', requireAdmin, async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Error deleting lead:', err);
        res.redirect('/admin/dashboard');
    }
});

// ── POST: Change Password
router.post('/change-password', requireAdmin, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await Admin.findById(req.session.adminId);
        if (!admin) return res.redirect('/admin/dashboard?error=Admin not found');

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.redirect('/admin/dashboard?error=Incorrect current password');
        }

        admin.password = newPassword; // Pre-save hook will hash this new password
        await admin.save();

        res.redirect('/admin/dashboard?success=Password updated successfully!');
    } catch (err) {
        console.error('Change password error:', err);
        res.redirect('/admin/dashboard?error=An error occurred while changing password');
    }
});

// ── GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
});

module.exports = router;
