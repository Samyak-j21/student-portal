// backend/models/File.js (Example - ENSURE YOURS IS UPDATED LIKE THIS)
const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Assuming your User model is named 'user'
    required: true
  },
  title: { // <--- THIS NEW FIELD IS CRUCIAL
    type: String,
    required: true
  },
  category: { // <--- THIS NEW FIELD IS CRUCIAL
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('file', FileSchema);