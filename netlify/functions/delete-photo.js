import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function extractStoragePathFromPublicUrl(photoUrl) {
  // expected public URL format:
  // https://<project>.supabase.co/storage/v1/object/public/point-photos/<path>
  const marker = "/storage/v1/object/public/point-photos/";
  const idx = photoUrl.indexOf(marker);
  if (idx === -1) return null;
  return photoUrl.substring(idx + marker.length);
}

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    const contentType = event.headers["content-type"] || event.headers["Content-Type"] || "";
    if (!contentType.includes("application/json")) {
      return { statusCode: 400, body: JSON.stringify({ error: "Content-Type must be application/json" }) };
    }

    const { photoId } = JSON.parse(event.body || "{}");
    if (!photoId) {
      return { statusCode: 400, body: JSON.stringify({ error: "photoId is required" }) };
    }

    // 1) find DB row
    const { data: row, error: findError } = await supabase
      .from("point_photos")
      .select("id, photo_url")
      .eq("id", photoId)
      .single();

    if (findError || !row) {
      return { statusCode: 404, body: JSON.stringify({ error: "Photo not found" }) };
    }

    // 2) delete file from storage
    const storagePath = extractStoragePathFromPublicUrl(row.photo_url);
    if (!storagePath) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid photo_url format" }) };
    }

    const { error: removeStorageError } = await supabase
      .storage
      .from("point-photos")
      .remove([storagePath]);

    if (removeStorageError) {
      return { statusCode: 500, body: JSON.stringify({ error: removeStorageError.message }) };
    }

    // 3) delete DB row
    const { error: deleteRowError } = await supabase
      .from("point_photos")
      .delete()
      .eq("id", photoId);

    if (deleteRowError) {
      return { statusCode: 500, body: JSON.stringify({ error: deleteRowError.message }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Delete failed" }) };
  }
}