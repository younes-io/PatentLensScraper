var mongoose = require('mongoose');

var countrySchema = new mongoose.Schema({ 
    _id: { type: String, match: /[A-Z]{2}/ },
    name: String
});

var applicantSchema = new mongoose.Schema({
    _id: String,
    country: { type: String, ref: 'Country' }
});

var inventorSchema = new mongoose.Schema({
    _id: String,
    country: { type: String, ref: 'Country' }
});

var patentSchema = mongoose.Schema({
    _id: Number,
    title: String,
    abstractPatent: String,
    publicationDate: Date
});

var patentApplicantSchema = mongoose.Schema({
    patentId: { type: Number, ref: 'Patent' },
    applicant: { type: String, ref: 'Applicant' },
    country: { type: String, ref: 'Country' },
    dateP: Date
});

var patentInventorSchema = mongoose.Schema({
    patentId: { type: Number, ref: 'Patent' },
    inventor: { type: String, ref: 'Inventor' },
    country: { type: String, ref: 'Country' },
    dateP: Date
});

mongoose.connect('mongodb://localhost/test_sid');

exports.mongoose = mongoose;
exports.Country = mongoose.model('Country', countrySchema);
exports.Applicant = mongoose.model('Applicant', applicantSchema);
exports.Inventor = mongoose.model('Inventor', inventorSchema);
exports.Patent = mongoose.model('Patent', patentSchema);
exports.PatentApplicant = mongoose.model('PatentApplicant', patentApplicantSchema);
exports.PatentInventor = mongoose.model('PatentInventor', patentInventorSchema);