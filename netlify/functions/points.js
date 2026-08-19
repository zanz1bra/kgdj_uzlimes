import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const method = req.method;
  const store = getStore("points");

  try {
    // GET: fetch all points
    if (method === "GET") {
      const data = await store.get("data");
      const points = data ? JSON.parse(data) : [];
      return new Response(JSON.stringify(points), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST: create a new point
    if (method === "POST") {
      const body = await req.json();
      const data = await store.get("data");
      const points = data ? JSON.parse(data) : [];
      const newPoint = {
        id: body.id,
        lat: body.lat,
        lng: body.lng,
        name: body.name || "",
        comments: Array.isArray(body.comments) ? body.comments : [],
        seen: body.seen || false,
      };
      points.push(newPoint);
      await store.set("data", JSON.stringify(points));
      return new Response(JSON.stringify(newPoint), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // PUT: update an existing point
    if (method === "PUT") {
      const body = await req.json();
      const data = await store.get("data");
      let points = data ? JSON.parse(data) : [];
      const index = points.findIndex((p) => p.id === body.id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: "Point not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      points[index] = {
        id: body.id,
        lat: body.lat,
        lng: body.lng,
        name: body.name || "",
        comments: Array.isArray(body.comments) ? body.comments : [],
        seen: body.seen || false,
      };
      await store.set("data", JSON.stringify(points));
      return new Response(JSON.stringify(points[index]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE: remove a point
    if (method === "DELETE") {
      const body = await req.json();
      const data = await store.get("data");
      let points = data ? JSON.parse(data) : [];
      const initialLength = points.length;
      points = points.filter((p) => p.id !== body.id);
      if (points.length === initialLength) {
        return new Response(JSON.stringify({ error: "Point not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      await store.set("data", JSON.stringify(points));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Unsupported method
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: e.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
