import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POINTS_FILE = path.join(__dirname, '../../points.json');

function readPoints() {
  try {
    if (fs.existsSync(POINTS_FILE)) {
      const data = fs.readFileSync(POINTS_FILE, 'utf-8');
      return JSON.parse(data || '[]');
    }
    return [];
  } catch (e) {
    console.error('Error reading points:', e);
    return [];
  }
}

function writePoints(points) {
  try {
    fs.writeFileSync(POINTS_FILE, JSON.stringify(points, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing points:', e);
  }
}

export default async (req, context) => {
  const method = req.method;

  try {
    // GET: fetch all points
    if (method === 'GET') {
      const points = readPoints();
      return new Response(JSON.stringify(points), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // POST: create a new point
    if (method === 'POST') {
      const body = await req.json();
      const points = readPoints();
      const newPoint = {
        id: body.id,
        lat: body.lat,
        lng: body.lng,
        name: body.name || '',
        note: body.note || '',
        seen: body.seen || false,
      };
      points.push(newPoint);
      writePoints(points);
      return new Response(JSON.stringify(newPoint), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // PUT: update an existing point
    if (method === 'PUT') {
      const body = await req.json();
      let points = readPoints();
      const index = points.findIndex((p) => p.id === body.id);
      if (index === -1) {
        return new Response(JSON.stringify({ error: 'Point not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      points[index] = {
        id: body.id,
        lat: body.lat,
        lng: body.lng,
        name: body.name || '',
        note: body.note || '',
        seen: body.seen || false,
      };
      writePoints(points);
      return new Response(JSON.stringify(points[index]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // DELETE: remove a point
    if (method === 'DELETE') {
      const body = await req.json();
      let points = readPoints();
      const initialLength = points.length;
      points = points.filter((p) => p.id !== body.id);
      if (points.length === initialLength) {
        return new Response(JSON.stringify({ error: 'Point not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      writePoints(points);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Unsupported method
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Function error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: e.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
