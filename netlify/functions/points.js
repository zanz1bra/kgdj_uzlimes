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

export const handler = async (event) => {
  const method = event.httpMethod;

  try {
    // GET: fetch all points
    if (method === 'GET') {
      const points = readPoints();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(points),
      };
    }

    // POST: create a new point
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
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
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPoint),
      };
    }

    // PUT: update an existing point
    if (method === 'PUT') {
      const body = JSON.parse(event.body || '{}');
      let points = readPoints();
      const index = points.findIndex((p) => p.id === body.id);
      if (index === -1) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Point not found' }),
        };
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
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(points[index]),
      };
    }

    // DELETE: remove a point
    if (method === 'DELETE') {
      const body = JSON.parse(event.body || '{}');
      let points = readPoints();
      const initialLength = points.length;
      points = points.filter((p) => p.id !== body.id);
      if (points.length === initialLength) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Point not found' }),
        };
      }
      writePoints(points);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true }),
      };
    }

    // Unsupported method
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (e) {
    console.error('Function error:', e);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', details: e.message }),
    };
  }
};
