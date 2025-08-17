const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /api/chat
// @desc    Handle chat messages and get a response from AI
// @access  Public
router.post('/', async (req, res) => {
    const userMessage = req.body.message;
    console.log('Received chat message:', userMessage);

    if (!userMessage) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const botResponse = response.text();

        console.log('Bot response:', botResponse);

        res.json({ response: botResponse });

    } catch (error) {
        console.error('Error with Gemini API:', error);
        res.status(500).json({ response: 'An error occurred while connecting to the AI.' });
    }
});

module.exports = router;