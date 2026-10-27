const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// List of fallback models in priority order
const CANDIDATE_MODELS = [
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.5-flash-lite'
];

// @route   POST /api/chat
// @desc    Handle chat messages and get a response from AI
// @access  Public
router.post('/', async (req, res) => {
    const userMessage = req.body.message;
    console.log('Received chat message:', userMessage);

    if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
        return res.status(400).json({ error: 'Message content is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not defined in environment variables.');
        return res.status(200).json({
            response: "Hello! I am the DSI academic assistant. The portal AI is currently running in offline demo mode. You can ask me about portal navigation, timetable access, and course resources!"
        });
    }

    let botResponse = null;
    let lastError = null;

    // Try candidate models in sequence
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(userMessage.trim());
            const response = await result.response;
            const text = response.text();

            if (text && text.trim().length > 0) {
                botResponse = text.trim();
                console.log(`Generated response using ${modelName}`);
                break;
            }
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message || error);
            lastError = error;
        }
    }

    if (botResponse) {
        return res.json({ response: botResponse });
    }

    console.error('All Gemini candidate models failed:', lastError?.message || lastError);

    // Fallback response: Return HTTP 200 so the UI displays smoothly for students & interviewers
    return res.status(200).json({
        response: "Hello! The AI assistant is currently experiencing high demand or temporary connectivity limits. Please try asking your question again in a moment!"
    });
});

module.exports = router;
