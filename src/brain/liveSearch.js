import axios from "axios";

export async function liveGoogleSearch(query) {
    try {
        const apiKey = process.env.SERP_API_KEY;

        if (!apiKey) {
            console.error("❌ SERP_API_KEY missing");
            return [];
        }

        const response = await axios.get(
            "https://serpapi.com/search",
            {
                params: {
                    q: query,
                    engine: "google",
                    api_key: apiKey,
                    gl: "in",
                    hl: "en"
                },
                timeout: 10000
            }
        );

        const results = response.data.organic_results;

        if (!results || results.length === 0) {
            return [];
        }

        return results.slice(0, 3).map(item => ({
            title: item.title,
            snippet: item.snippet || "",
            link: item.link
        }));

    } catch (error) {
        console.error(
            "❌ SerpApi error:",
            error.response?.status,
            error.response?.data || error.message
        );
        return [];
    }
}
