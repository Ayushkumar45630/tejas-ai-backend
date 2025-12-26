import axios from "axios";

/**
 * Google Custom Search
 * Short + voice-friendly result
 */
export async function googleSearch(query) {
    try {
        const response = await axios.get(
            "https://www.googleapis.com/customsearch/v1",
            {
                params: {
                    key: process.env.GOOGLE_API_KEY,
                    cx: process.env.GOOGLE_CX,
                    q: query,
                    num: 3,
                },
            }
        );

        const items = response.data.items;

        if (!items || items.length === 0) {
            return "Google par is sawal ka clear jawab nahi mila.";
        }

        let result = "Google ke hisaab se:\n";

        items.forEach((item, index) => {
            result += `${index + 1}. ${item.title}. ${item.snippet}\n`;
        });

        return result;

    } catch (error) {
        console.error("Google Search Error:", error.message);
        return "Google search karte waqt error aaya.";
    }
}
