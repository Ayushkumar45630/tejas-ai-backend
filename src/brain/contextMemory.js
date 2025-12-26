import fs from "fs";
import path from "path";

const contextPath = path.join(process.cwd(), "src", "data", "context.json");

export function getContext() {
    try {
        const data = fs.readFileSync(contextPath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return {
            lastUserMessage: "",
            lastBotReply: ""
        };
    }
}

export function saveContext(userMessage, botReply) {
    const context = {
        lastUserMessage: userMessage,
        lastBotReply: botReply
    };

    fs.writeFileSync(contextPath, JSON.stringify(context, null, 2));
}
