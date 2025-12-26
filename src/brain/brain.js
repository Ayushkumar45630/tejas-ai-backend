import { getContext, saveContext } from "./contextMemory.js";
import { getUser, saveUser } from "./userMemory.js";

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
// 🧠 Brain decide karega: Google search chahiye ya nahi
export function needsLiveSearch(message) {
    const keywords = [
        "kab",
        "date",
        "latest",
        "abhi",
        "today",
        "current",
        "news",
        "score",
        "result",
        "price",
        "auction"
    ];

    return keywords.some(word =>
        message.toLowerCase().includes(word)
    );
}

/* ---------- MAIN BRAIN ---------- */
export function buildBrainPrompt(userMessage, userId = "default") {
    const context = getContext();
    const user = getUser(userId);

    // 🧠 Auto-save memory
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
