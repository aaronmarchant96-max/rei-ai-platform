/**
 * Feedback collection endpoint.
 *
 * POST /api/feedback
 * Body: { prompt, route, pathway, direction, timestamp }
 *
 * Logs feedback to stdout (captured by Vercel Logs) and returns
 * the collected data for immediate display.
 *
 * Future: replace console.log with a proper data store (Vercel KV, Supabase)
 * and add TF-IDF clustering + fingerprint auto-update (see FEEDBACK_ARCHITECTURE.md).
 */
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { prompt, route, pathway, direction, timestamp } = req.body || {};

    if (!prompt || !direction) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const entry = {
      timestamp: timestamp || new Date().toISOString(),
      direction,
      prompt: prompt.slice(0, 500),
      route: route || "unknown",
      pathway: pathway || "unknown",
    };

    console.log(JSON.stringify({ type: "user_feedback", ...entry }));

    return res.status(200).json({ success: true, entry });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
