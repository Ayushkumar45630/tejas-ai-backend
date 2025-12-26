import axios from "axios";

/**
 * GNews – Top 3 headlines (India)
 */
export async function getTopNews() {
    try {
        const response = await axios.get(
            "https://gnews.io/api/v4/top-headlines",
            {
                params: {
                    country: "in",
                    lang: "en",
                    max: 3,
                    apikey: process.env.GNEWS_API_KEY
                }
            }
        );

        if (!response.data.articles) return [];

        return response.data.articles.map(a => a.title);

    } catch (error) {
        console.error("GNews error:", error.response?.data || error.message);
        return [];
    }
}
