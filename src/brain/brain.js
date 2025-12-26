import { getContext, saveContext } from "./contextMemory.js";
import { getUser, saveUser } from "./userMemory.js";
import { getWeatherByLatLon } from "../weather.js";
import { getTopNews } from "../news.js";

/* ---------- Helpers ---------- */
function detectName(message) {
    const match = message.match(/mera naam (\w+)/i);
    return match ? match[1] : null;
}

function detectLanguage(message) {
    if (/[अ-ह]/.test(message)) return "Hindi";
    if (message.includes("hai") || message.includes("kya")) return "Hinglish";
    return "English";
}

/* ---------- LIVE SEARCH DECISION ---------- */
export function needsLiveSearch(message) {
    const keywords = [
        "kab", "date", "latest", "abhi", "today",
        "current", "news", "score", "result", "price", "auction"
    ];
    return keywords.some(word =>
        message.toLowerCase().includes(word)
    );
}

/* ---------- MAIN BRAIN ---------- */
export async function brainReply(userMessage, userId = "default", extra = {}) {

    /* 🔥 APP OPEN GREETING */
    if (userMessage === "start") {
        let reply = "नमस्ते! मैं Tejas AI हूँ। 👋\n";

        /* 🌦️ Weather */
        if (extra.lat && extra.lon) {
            try {
                const weather = await getWeatherByLatLon(extra.lat, extra.lon);
                if (weather) {
                    reply += `\n🌦️ आज ${weather.city} में तापमान ${weather.temp}°C है और मौसम ${weather.condition} है।\n`;
                }
            } catch {
                reply += "\n🌦️ मौसम की जानकारी उपलब्ध नहीं है।\n";
            }
        }

        /* 📰 News */
        try {
            const news = await getTopNews();
            if (news && news.length > 0) {
                reply += "\n📰 आज की मुख्य खबरें:\n";
                news.forEach((title, i) => {
                    reply += `${i + 1}. ${title}\n`;
                });
            }
        } catch {
            reply += "\n📰 खबरें लोड नहीं हो पाईं।\n";
        }

        reply += "\nआज मैं आपकी किस तरह मदद कर सकता हूँ? 😊";
        return reply;
    }

    /* ---------- NORMAL AI FLOW ---------- */

    const context = getContext();
    const user = getUser(userId);

    const name = detectName(userMessage);
    if (name) saveUser(userId, { name });

    saveUser(userId, { language: detectLanguage(userMessage) });

    const today = new Date();
    const todayDate = today.toDateString();
    const currentYear = today.getFullYear();

    let prompt = `
You are Tejas AI.
Today is ${todayDate}.
Current year is ${currentYear}.

IMPORTANT RULES:
- Think step by step internally but NEVER show reasoning.
- If the question is about a FUTURE event and date is not officially announced,
  say clearly: "Iski official date abhi announce nahi hui hai."
- NEVER give past year data for future questions.
- Use previous context ONLY if relevant.
- Do NOT repeat old answers unless user clearly asks.
- Reply in Hinglish.
- Be short, factual, and confident.
`;

    if (user.name) {
        prompt += `User name: ${user.name}\n`;
    }

    if (context.lastUserMessage && context.lastBotReply) {
        prompt += `
Previous context (use only if helpful):
Q: ${context.lastUserMessage}
A: ${context.lastBotReply}
`;
    }

    prompt += `
Current user question:
${userMessage}

Final Answer:
`;

    return prompt;
}

/* ---------- CONTEXT UPDATE ---------- */
export function updateBrain(userMessage, botReply) {
    saveContext(userMessage, botReply);
}
