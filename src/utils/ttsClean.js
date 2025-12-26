export function cleanTextForTTS(text) {
    if (!text) return "";

    return text
        // remove emojis & pictographs
        .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, "")
        // remove special symbols except basic punctuation
        .replace(/[^a-zA-Z0-9अ-ह .,?\n]/g, "")
        // fix multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}
