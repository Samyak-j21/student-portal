const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const adminAuth = require('../middleware/adminAuth');
const File = require('../models/File'); // Assuming you have a File model

// NOTE: This configuration must be present for Cloudinary to work.
// Make sure your .env file has the correct values.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 120000 // Set timeout to 120 seconds (120000 milliseconds)
});

// Configure Multer to store in memory (so we can send buffer to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/upload
// @desc    Upload a PDF file to Cloudinary and save info to DB (Admin Only)
// @access  Private (Admin Only)
router.post('/', adminAuth, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        // Extract title and category from request body
        const { title, category } = req.body;

        // Validate that title and category are provided
        if (!title) {
            return res.status(400).json({ msg: 'File title is required.' });
        }
        if (!category) {
            return res.status(400).json({ msg: 'File category is required.' });
        }

        // Use the file buffer to upload directly to Cloudinary
        const result = await cloudinary.uploader.upload(
            `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
            {
                resource_type: 'auto', // Changed to 'auto' for better compatibility and processing
                folder: 'student_portal_pdfs', // Your Cloudinary folder
                public_id: req.file.originalname.split('.')[0] // Use original file name as public_id
            }
        );

        // Create a new File document with the extracted title and category
        const newFile = new File({
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            uploadedBy: req.user.id,
            title: title,    // Save the new title field
            category: category // Save the category field
        });

        await newFile.save(); // Save the new file record to the database

        res.status(201).json({
            msg: `File "${req.file.originalname}" uploaded to cloud and saved to DB!`,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            title: title,      // Include title in response
            category: category // Include category in response
        });

    } catch (err) {
        console.error('File upload route error:', err);
        res.status(500).json({ msg: 'Server Error in uploading files' });
    }
});

module.exports = router;

