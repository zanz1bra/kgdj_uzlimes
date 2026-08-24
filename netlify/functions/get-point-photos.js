import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  try {
    if (event.httpMethod !== "GET") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const pointId = event.queryStringParameters?.pointId;
    if (!pointId) {
      return { statusCode: 400, body: JSON.stringify({ error: "pointId is required" }) };
    }

    const { data, error } = await supabase
      .from("point_photos")
      .select("id, photo_url, uploaded_at")
      .eq("point_id", pointId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ photos: data || [] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Failed to fetch photos" }),
    };
  }
}