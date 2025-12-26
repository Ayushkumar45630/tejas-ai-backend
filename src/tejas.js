import axios from "axios";
import { getWeatherByLatLon } from "./weather.js";
import { getTopNews } from "./news.js";

// 🧠 Brain imports
import {
    buildBrainPrompt,
    updateBrain,
    needsLiveSearch
} from "./brain/brain.js";

// 🔎 Live Google Search
import { liveGoogleSearch } from "./brain/liveSearch.js";

// 🗣️ TTS Clean utility
import { cleanTextForTTS } from "./utils/ttsClean.js";

/**
 * Tejas AI – FINAL production-safe reply function
 * 🔥 ALWAYS RETURNS STRING
 */
export async function tejasReply(message, userId = "default", extra = {}) {

    const { lat, lon } = extra;

    /* 🔥 DAILY BRIEF ON APP START */
    if (message === "start") {
        const reply = await dailyBrief(lat, lon);
        updateBrain(message, reply);
        return cleanTextForTTS(reply);
    }

    /* 🔎 LIVE GOOGLE SEARCH (high priority) */
    if (needsLiveSearch(message)) {
        const results = await liveGoogleSearch(message);

        if (results.length > 0) {
            let reply = "🔎 Live Google search ke hisaab se:\n\n";

            results.forEach((r, i) => {
                reply += `${i + 1}. ${r.title}\n`;
                reply += `${r.snippet}\n\n`;
            });

            updateBrain(message, reply);
            return cleanTextForTTS(reply);
        }
    }

    /* 🧠 LLM FALLBACK */
    const brainPrompt = buildBrainPrompt(message, userId);
    const reply = await callDeepSeek(brainPrompt);

    updateBrain(message, reply);
    return cleanTextForTTS(reply);
}

/* =====================================================
   📰 DAILY BRIEF (GREETING + WEATHER + NEWS)
   ===================================================== */
async function dailyBrief(lat, lon) {

    const hour = new Date().getHours();
    let timeGreeting =
        hour < 12 ? "Good morning ☀️" :
            hour < 17 ? "Good afternoon 🌤️" :
                "Good evening 🌆";

    let message = `${timeGreeting}\n\n`;

    message += "Main Tejas AI hoon, jise Ayush Mishra ne design kiya hai.\n\n";

    /* 🌦️ Weather */
    if (lat && lon) {
        try {
            const weather = await getWeatherByLatLon(lat, lon);
            if (weather) {
                message += `🌦️ Aaj ${weather.city} me temperature ${weather.temp}°C hai aur ${weather.condition} weather hai.\n\n`;
            }
        } catch {
            message += "🌦️ Weather info abhi available nahi hai.\n\n";
        }
    }

    /* 📰 News */
    try {
        const news = await getTopNews();
        if (news.length > 0) {
            message += "📰 Aaj ki badi khabrein:\n";
            news.forEach((title, i) => {
                message += `${i + 1}. ${title}\n`;
            });
            message += "\n";
        }
    } catch {
        message += "📰 News abhi load nahi ho paayi.\n\n";
    }

    message += "Batao, main kya madad kar sakta hoon? 😊";

    return message;
}

/* =====================================================
   🤖 DEEPSEEK CHAT (LLM)
   ===================================================== */
async function callDeepSeek(prompt) {
    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
            model: "deepseek/deepseek-chat",
            messages: [
                {
                    role: "system",
                    content:
                        "You are Tejas AI. Reply in Hinglish. Be concise, factual, and context-aware."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.3
        },
        {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tejas-ai-backend-production.up.railway.app",
                "X-Title": "Tejas AI"
            }
        }
    );

    return response.data.choices?.[0]?.message?.content || "Samajh nahi aaya.";
}
