const Document = require('../models/Document');

// @desc    Upload a document
// @route   POST /api/documents
// @access  Private
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { relatedEntity, relatedId } = req.body;

        const document = await Document.create({
            originalName: req.file.originalname,
            fileName: req.file.filename,
            mimeType: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            uploadedBy: req.user._id,
            relatedEntity,
            relatedId: relatedId || null,
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
    try {
        // Filter logic based on query, roles etc can be added
        const documents = await Document.find({}).populate('uploadedBy', 'name');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
};
