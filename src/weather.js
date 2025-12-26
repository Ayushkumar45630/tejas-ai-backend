import axios from "axios";

/**
 * WeatherAPI.com – using Latitude & Longitude
 */
export async function getWeatherByLatLon(lat, lon) {
    try {
        const response = await axios.get(
            "https://api.weatherapi.com/v1/current.json",
            {
                params: {
                    key: process.env.WEATHERAPI_KEY,
                    q: `${lat},${lon}`,
                    lang: "en"
                }
            }
        );

        const temp = Math.round(response.data.current.temp_c);
        const condition = response.data.current.condition.text;
        const city = response.data.location.name;

        return { city, temp, condition };

    } catch (error) {
        console.error("Weather error:", error.response?.data || error.message);
        return null;
    }
}
