import fetch from "node-fetch";

const REPO = "zanz1bra/kgdj_uzlimes";
const FILE = "points.json";
const TOKEN = process.env.GITHUB_TOKEN;

export async function handler(event) {
  const method = event.httpMethod;

  async function readFile() {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString();
    return { points: JSON.parse(content), sha: data.sha };
  }

  async function writeFile(points, sha) {
    const body = {
      message: "update points",
      content: Buffer.from(JSON.stringify(points, null, 2)).toString("base64"),
      sha
    };

    await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  if (method === "GET") {
    const { points } = await readFile();
    return { statusCode: 200, body: JSON.stringify(points) };
  }

  if (method === "POST") {
    const newPoint = JSON.parse(event.body);
    const { points, sha } = await readFile();
    points.push(newPoint);
    await writeFile(points, sha);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (method === "DELETE") {
    const { id } = JSON.parse(event.body);
    const { points, sha } = await readFile();
    const filtered = points.filter(p => p.id !== id);
    await writeFile(filtered, sha);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 400, body: "Unsupported method" };
}
