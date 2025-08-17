const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse'); // Import pdf-parse

// Configure multer for file storage
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

// @route   POST /api/pdf/summarize
// @desc    Upload and summarize a PDF file
// @access  Public (All users)
router.post('/summarize', upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        console.log('Received PDF file:', req.file.originalname);
        console.log('File size:', req.file.size);

        // --- Step 1: Read text from the PDF file buffer ---
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const extractedText = pdfData.text;

        // --- Step 2: Implement basic summarization logic ---
        // This is a placeholder. You will replace this with your actual summarization model (e.g., Gemini API).
        let summary = "No readable text found or summarization failed."; // Default message

        if (extractedText && extractedText.trim().length > 0) {
            // Basic summarization: take the first 500 characters or less if the text is shorter
            // For a slightly better "summary" we can try to get the first few sentences.
            const sentences = extractedText.split(/(?<=[.!?])\s+/); // Split by sentence-ending punctuation followed by space
            const numSentencesForSummary = Math.min(5, sentences.length); // Take up to 5 sentences
            summary = sentences.slice(0, numSentencesForSummary).join(' ') + (numSentencesForSummary < sentences.length ? '...' : '');

            if (summary.trim().length === 0) {
                // Fallback if sentence splitting results in empty string (e.g., very short text without punctuation)
                summary = extractedText.substring(0, Math.min(extractedText.length, 500)) + (extractedText.length > 500 ? '...' : '');
            }
        } else {
            summary = "The PDF file contains no readable text or text extraction failed.";
        }

        // --- Step 3: Send summary back to the client ---
        res.json({
            msg: `Summary for "${req.file.originalname}" generated.`,
            summary: summary, // Send the actual summary
        });

    } catch (err) {
        console.error('Error processing PDF:', err.message);
        // Provide a more user-friendly error message
        res.status(500).json({ msg: 'An error occurred during PDF processing or summarization.' });
    }
});

module.exports = router;