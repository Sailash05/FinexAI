import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getTransactionsService } from "../service/transactionService.js";
import { GoogleGenAI } from "@google/genai";
import Chat from "../models/Chat.js";

const router = express.Router();
const ai = new GoogleGenAI({}); // API key from GEMINI_API_KEY env variable

router.use(verifyToken);

// POST /api/ai/insights
router.post("/insights", async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all user transactions
    const result = await getTransactionsService(userId, { page: 1, limit: 1000 });
    const transactions = result.data.transactions;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ insights: "No transactions found." });
    }

    // Prepare prompt for Gemini
    const prompt = `
      You are a finance assistant.
      Analyze the following transactions and:
      1. Suggest categories if missing.
      2. Detect unusual spending (e.g., large increases).
      3. Provide insights like "You spent X% more on Food this month".
      Transactions: ${JSON.stringify(transactions)}
    `;

    // Generate AI insights using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      temperature: 0.7,
      maxOutputTokens: 500,
    });

    // response.text contains the AI output
    res.json({ insights: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/predict", async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all transactions (or last 6 months)
    const result = await getTransactionsService(userId, { page: 1, limit: 2000 });
    const transactions = result.data.transactions;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ predictions: "No transactions found." });
    }

    // Prompt for predictive analytics
    const prompt = `
      You are a financial forecasting assistant.
      Based on the past transactions provided, do the following:
      1. Forecast next month's total expenses per category using historical trends.
      2. Suggest a budget limit for each category (about 10% higher than prediction).
      3. Return the result in strict JSON format with this structure:

      {
        "predictions": {
          "Food": { "predicted": number, "budget": number },
          "Rent": { "predicted": number, "budget": number },
          "Transport": { "predicted": number, "budget": number },
          ...
        },
        "summary": "short overall financial recommendation"
      }

      Transactions: ${JSON.stringify(transactions)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      temperature: 0.4,
      maxOutputTokens: 800,
    });

    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(response.text);
    } catch (err) {
      console.error("Invalid JSON from Gemini:", response.text);
      parsed = { summary: response.text, predictions: {} };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});



router.post("/recommendations", async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all transactions
    const result = await getTransactionsService(userId, { page: 1, limit: 2000 });
    const transactions = result.data.transactions;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ recommendations: "No transactions found." });
    }

    const prompt = `
      You are a smart financial assistant.
      Analyze the following transactions and:
      1. Suggest actionable ways to save money.
      2. Recommend cheaper alternatives or subscriptions to cancel.
      3. Highlight categories where spending is unusually high.
      4. Return the result in JSON with this structure:

      {
        "recommendations": [
          {"category": "Food", "advice": "Cook at home 3 times a week to save $120/month"},
          {"category": "Entertainment", "advice": "Cancel one streaming subscription to save $50/month"}
        ],
        "summary": "Overall money-saving advice"
      }

      Transactions: ${JSON.stringify(transactions)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      temperature: 0.7,
      maxOutputTokens: 600,
    });

    // parse AI response safely
    let parsed;
    try {
      parsed = JSON.parse(response.text.replace(/```json|```/g, ""));
    } catch (err) {
      console.error("Invalid JSON from AI:", response.text);
      parsed = { summary: response.text, recommendations: [] };
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



router.post("/query", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Fetch transactions
    const result = await getTransactionsService(userId, { page: 1, limit: 2000 });
    const transactions = result.data.transactions;

    if (!transactions || transactions.length === 0) {
      return res.status(200).json({ answer: "No transactions found." });
    }

    // Prepare prompt
    const prompt = `
      You are a financial assistant.
      Answer the user's question based on the following transactions.
      If the question is not answerable from the transactions, say "I cannot answer that."

      User Question: "${question}"
      Transactions: ${JSON.stringify(transactions)}
    `;

    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      temperature: 0.5,
      maxOutputTokens: 400,
    });

    const answer = response.text;

    // Save to Chat collection (one chat per user)
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({ userId, messages: [] });
    }

    chat.messages.push({ question, answer });

    // Keep only last 30 messages
    if (chat.messages.length > 30) {
      chat.messages = chat.messages.slice(-30);
    }

    await chat.save();

    res.json({ question, answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ai/query
// Fetch all last 30 chat messages
router.get("/query", async (req, res) => {
  try {
    const userId = req.user.userId;
    const chat = await Chat.findOne({ userId });

    if (!chat) return res.json({ messages: [] });

    res.json({ messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



export default router;
