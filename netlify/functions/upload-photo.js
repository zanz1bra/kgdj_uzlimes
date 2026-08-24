import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
    if (!contentType.includes("application/json")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Content-Type must be application/json" }) };
    }

    const { pointId, fileName, fileBase64 } = JSON.parse(event.body || "{}");
    if (!pointId || !fileName || !fileBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "pointId, fileName, fileBase64 are required" }) };
    }

    const lower = fileName.toLowerCase();
    if (!(lower.endsWith(".jpg") || lower.endsWith(".jpeg"))) {
      return { statusCode: 400, body: JSON.stringify({ error: "Only .jpg/.jpeg files are allowed" }) };
    }

    const buffer = Buffer.from(fileBase64, "base64");
    const maxBytes = 10 * 1024 * 1024;
    if (buffer.length > maxBytes) {
      return { statusCode: 400, body: JSON.stringify({ error: "File too large. Max 10MB." }) };
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `point/${pointId}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("point-photos")
      .upload(filePath, buffer, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      return { statusCode: 500, body: JSON.stringify({ error: uploadError.message }) };
    }

    const { data: publicData } = supabase.storage.from("point-photos").getPublicUrl(filePath);
    const photoUrl = publicData.publicUrl;

    const { error: insertError } = await supabase
      .from("point_photos")
      .insert([{ point_id: pointId, photo_url: photoUrl }]);

    if (insertError) {
      return { statusCode: 500, body: JSON.stringify({ error: insertError.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true, photoUrl }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Upload failed" }) };
  }
}