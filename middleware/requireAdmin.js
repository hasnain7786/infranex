// Middleware: protect any admin route — redirect to login if not authenticated
module.exports = function requireAdmin(req, res, next) {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.redirect('/admin/login');
};
