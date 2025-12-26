import axios from "axios";
import { getWeatherByLatLon } from "./weather.js";
import { getTopNews } from "./news.js";

// 🧠 Brain imports
import {
    buildBrainPrompt,
    updateBrain,
    needsLiveSearch
} from "./brain/brain.js";

// 🔎 Live Google Search (SerpApi)
import { liveGoogleSearch } from "./brain/liveSearch.js";

// 🗣️ TTS Clean utility
import { cleanTextForTTS } from "./utils/ttsClean.js";

/**
 * Tejas AI – Daily Briefing + Brain + Live Search + Clean TTS
 */
export async function tejasReply(message, lat, lon, userId = "default") {

    // 🔥 DAILY BRIEF ON START
    if (message === "start") {
        const reply = await dailyBrief(lat, lon);
        updateBrain(message, reply);

        return {
            reply,                     // UI text
            ttsText: cleanTextForTTS(reply) // 🗣️ clean TTS text
        };
    }

    // 🔎 LIVE GOOGLE SEARCH (High priority)
    if (needsLiveSearch(message)) {
        const results = await liveGoogleSearch(message);

        if (results.length > 0) {
            let reply = "🔎 Live Google search ke hisaab se:\n\n";

            results.forEach((r, i) => {
                reply += `${i + 1}. ${r.title}\n`;
                reply += `${r.snippet}\n`;
                reply += `Source: ${r.link}\n\n`;
            });

            updateBrain(message, reply);

            return {
                reply,
                ttsText: cleanTextForTTS(reply)
            };
        }
    }

    // 🧠 Brain + LLM fallback
    const brainPrompt = buildBrainPrompt(message, userId);
    const reply = await callDeepSeek(brainPrompt);

    updateBrain(message, reply);

    return {
        reply,
        ttsText: cleanTextForTTS(reply)
    };
}

/* =====================================================
   📰 DAILY BRIEF (WEATHER + NEWS)
   ===================================================== */
async function dailyBrief(lat, lon) {

    // ⏰ Time greeting
    const hour = new Date().getHours();
    let timeGreeting =
        hour < 12 ? "Good morning ☀️" :
            hour < 17 ? "Good afternoon 🌤️" :
                "Good evening 🌆";

    let message = `${timeGreeting}\n`;

    // 👤 Intro
    message += "Main Tejas AI hoon, jise Ayush Mishra ne design kiya hai.\n";

    // 🌦️ Weather
    if (lat && lon) {
        const weather = await getWeatherByLatLon(lat, lon);
        if (weather) {
            message += `Aaj ${weather.city} me temperature ${weather.temp}°C hai aur ${weather.condition} weather hai.\n`;
        }
    }

    // 📰 News
    const news = await getTopNews();
    if (news.length > 0) {
        message += "\nAaj ki badi khabrein:\n";
        news.forEach((title, i) => {
            message += `${i + 1}. ${title}\n`;
        });
    }

    // ❓ Help
    message += "\nBatao, main kya madad kar sakta hoon?";

    return message;
}

/* =====================================================
   🤖 DEEPSEEK CHAT (LLM FALLBACK)
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
                "HTTP-Referer": "http://localhost",
                "X-Title": "Tejas AI"
            }
        }
    );

    return response.data.choices?.[0]?.message?.content || "Samajh nahi aaya.";
}
