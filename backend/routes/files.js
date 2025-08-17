const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming this is your general authentication middleware
const File = require('../models/File'); // Assuming you have a File model

// @route   GET /api/files
// @desc    Get all available files
// @access  Private (requires authentication)
router.get('/', auth, async (req, res) => {
  try {
    // Fetch all files from the database.
    // Assuming your File model now includes 'title' and 'category' fields,
    // they will automatically be included in the 'files' array returned by find({}).
    const files = await File.find({});
    res.json(files);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
