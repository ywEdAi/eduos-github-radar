import { Pool } from "pg";

export const runtime = "nodejs";

let pool;

function database() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : undefined });
  return pool;
}

function normalizeRepository(value) {
  const input = String(value || "").trim();
  const match = input.match(/^(?:https?:\/\/(?:www\.)?github\.com\/)?([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i);
  return match ? `${match[1]}/${match[2]}` : null;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return Response.json({ code: "INVALID_REQUEST" }, { status: 400 }); }
  const repository = normalizeRepository(body.repository);
  const learningGoal = String(body.learningGoal || "").trim();
  if (!repository || !learningGoal || learningGoal.length > 2000) return Response.json({ code: "INVALID_REPOSITORY" }, { status: 400 });
  const client = database();
  if (!client) return Response.json({ code: "DATABASE_NOT_CONFIGURED" }, { status: 503 });
  try {
    await client.query("INSERT INTO radar_project_suggestions (repository_full_name, learning_goal_private, status) VALUES ($1, $2, 'pending')", [repository, learningGoal]);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Radar suggestion storage failed", error);
    return Response.json({ code: "DATABASE_ERROR" }, { status: 503 });
  }
}
