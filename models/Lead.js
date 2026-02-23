const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    package: { type: String, default: 'General Inquiry' },  // Basic | Professional | Premium | General Inquiry
    message: { type: String, required: true, trim: true },
    source: { type: String, default: 'contact' },          // 'contact' | 'pricing'
    status: { type: String, default: 'new' },              // 'new' | 'contacted' | 'closed' — for admin panel
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema);
