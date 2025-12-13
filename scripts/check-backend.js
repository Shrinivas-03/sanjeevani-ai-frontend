/* Check backend reachability from developer machine
   Usage: node ./scripts/check-backend.js [URL]
   If no URL provided, reads EXPO_PUBLIC_API_BASE_URL from env or uses http://localhost:5000
*/
const base = process.argv[2] || process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000";
(async () => {
  try {
    const url = new URL("/api/auth/me", base).href;
    console.log("Checking backend URL:", url);
    const resp = await fetch(url, { method: "GET" });
    console.log("Status:", resp.status);
    let text;
    try { text = await resp.text(); } catch (e) { text = String(e); }
    console.log("Response body:", text);
  } catch (err) {
    console.error("Failed to reach backend:", err);
    process.exit(1);
  }
})();
