const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(`[console] ${msg.text()}`); });
  await page.goto("https://saga-drop-gules.vercel.app", { waitUntil: "networkidle", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 3000));
  console.log("PAGE TITLE:", await page.title());
  console.log("HTML LENGTH:", await page.evaluate(() => document.getElementById("root")?.innerHTML?.length || 0));
  console.log("ERRORS:", JSON.stringify(errors, null, 2));
  await browser.close();
})();
