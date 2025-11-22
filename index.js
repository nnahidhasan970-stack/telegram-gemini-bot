const express = require("express");
const fetch = require("node-fetch").default; 
const { GoogleGenAI } = require("@google/genai"); 

const app = express();
app.use(express.json());

const BOT_TOKEN = "8244558084:AAFa0Aos59DFftP9LlFbycunYoSKpR6eWhE"; 
const GEMINI_API_KEY = "AIzaSyAcTjh3RUoAYYqUdYa1uEdzALmZCJk2CYQ"; 

const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`; 
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); 

async function sendMessage(chatId, text) {
    try {
        await fetch(`${API_URL}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: text })
        });
    } catch (e) {
        console.log("Send Error:", e);
    }
}

async function getAIReply(userText) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userText,
        });

        const reply = response.text.trim();
        if (!reply) return "⚠️ AI কোনো উত্তর দিতে পারলো না।";
        return reply.substring(0, 3990); 
    } catch (e) {
        console.error("Gemini API Error:", e.message);
        return "⚠️ যে সমস্যার কারণে আপনাকে হেল্প করতে পারতাছি না আমি দঃখিত ।";
    }
}

async function getRandomFact() {
    try {
        const url = `https://uselessfacts.jsph.pl/random.json?language=en`;
        const factResponse = await fetch(url);
        const data = await factResponse.json();
        return data.text || "দুঃখিত, কোনো মজার তথ্য পাওয়া যায়নি।";
    } catch (e) {
        return "⚠️ দয়া কর অপেক্ষা করবেন আপনার জন্য ভালো কিছু খোঁজা হচ্ছে ";
    }
}


app.post('/', async (req, res) => {
    const update = req.body;
    res.sendStatus(200); 

    if (!update.message) return;

    const chatId = update.message.chat.id;

    if (!update.message.text) {
        await sendMessage(chatId, "⚠️ দঃখিত নাহিদ ভাইয়ের পারমিশন নাই তার পারমিশন  ছাড়া এ সমস্ত তথ্য দেওয়া সম্ভব না ।");
        return;
    }

    const userMsg = update.message.text;
    const lower = userMsg.toLowerCase();
    
    if (userMsg === "/start") {
        await sendMessage(chatId, "বলুন আপনাকে কিভাবে সহযোগিতা করতে পারি ।");
        return;
    }

    if (userMsg === "/help") {
        await sendMessage(chatId, "আমার কমান্ডগুলি:\n/start - স্বাগত বার্তা\n/help - এই তালিকাটি দেখাবে\n/fact - একটি মজার তথ্য দেবে\n\nএছাড়া যেকোনো মেসেজ পাঠালে AI (Gemini) উত্তর দেবে।");
        return;
    }
    
    if (userMsg === "/fact") {
        const fact = await getRandomFact();
        await sendMessage(chatId, fact);
        return;
    }

    if (
        lower.includes("কে বানাই") ||
        lower.includes("বানাইছে") ||
        lower.includes("কে বানিয়েছে") ||
        lower.includes("creator") ||
        lower.includes("who created you") ||
        lower.includes("who made you")
    ) {
        await sendMessage(chatId, "আমাকে বানিয়েছেন নাহিদ ভাই ❤️");
        return;
    }

    const aiReply = await getAIReply(userMsg);
    await sendMessage(chatId, aiReply);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("🔥 AI Telegram Bot is Running! Ready for Webhook.");
});
