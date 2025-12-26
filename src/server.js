import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { tejasReply } from "./tejas.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("🔥 Tejas AI Backend Running");
});

app.post("/chat", async (req, res) => {
    try {
        const { message, lat, lon, userId } = req.body;

        if (!message) {
            return res.status(400).json({
                reply: "Message missing hai",
                ttsText: "Message missing hai"
            });
        }

        // 🧠 tejasReply now returns { reply, ttsText }
        const result = await tejasReply(
            message,
            lat,
            lon,
            userId || "default"
        );

        // ✅ Directly send result
        res.json(result);

    } catch (error) {
        console.error("❌ Backend Error:", error);
        res.status(500).json({
            reply: "Server error aaya",
            ttsText: "Server error aaya"
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Tejas AI running on http://localhost:${PORT}`);
});
