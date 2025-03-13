import puppeteer from "puppeteer";
import pool from "./db.js"; // PostgreSQL connection

const scrapeJobs = async () => {
  console.log("🚀 Starting job scraping...");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  const page = await browser.newPage();

  // Set User-Agent to prevent detection
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0"
  );

  // Go to Naukri Product Manager Jobs Page
  // await page.goto("https://www.naukri.com/product-manager-jobs", {
  //   waitUntil: "networkidle2", // Ensures all requests are completed
  //   timeout: 60000,
  // });

  await page.goto("https://www.naukri.com/sales-manager-jobs", {
    waitUntil: "networkidle2", // Ensures all requests are completed
    timeout: 60000,
  });

  // Wait for job listings to load
  await page.waitForSelector(".srp-jobtuple-wrapper", { timeout: 60000 });

  // Extract job details
  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".srp-jobtuple-wrapper")).map((job) => ({
      title: job.querySelector("a.title")?.innerText.trim() || "Title not found",
      company: job.querySelector(".comp-dtls-wrap a")?.innerText.trim() || "Company not found",
      location: job.querySelector(".loc")?.innerText.trim() || "Location not found",
      experience: job.querySelector(".exp")?.innerText.trim() || "Experience not found",
      apply_link: job.querySelector("a.title")?.href || "#",
    }));
  });

  await browser.close();

  // 🚀 Log scraped jobs before inserting
  console.log("🔍 Scraped Job Data:", jobs);

  console.log(`✅ Scraped ${jobs.length} jobs!`);

  // Insert scraped jobs into PostgreSQL
  for (let job of jobs) {
    try {
        console.log(`📌 Inserting Job: ${job.title} at ${job.company}`);
        await pool.query(
            `INSERT INTO jobs (title, company, location, experience, apply_link) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (apply_link) DO NOTHING;`,  // ✅ Prevents duplicate insertion
            [job.title, job.company, job.location, job.experience, job.apply_link]
        );
    } catch (error) {
        console.error("❌ Error inserting job:", error.message);
    }
}


  console.log("✅ Jobs saved to the database!");
};
export default scrapeJobs;


scrapeJobs();
