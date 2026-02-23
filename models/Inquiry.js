const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    package: { type: String, required: true },
    contactInfo: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inquiry', InquirySchema);
