import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobRoutes from "./routes/jobRoutes.js";
import scrapeJobs from "./scraper.js";  // ✅ Import the scraper

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobRoutes);

const PORT = process.env.PORT || 5001;

// ✅ Run the scraper when the server starts
(async () => {
    console.log("🔄 Running job scraper before starting the server...");
    await scrapeJobs();
    console.log("✅ Scraping complete, starting the server...");
})();

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
