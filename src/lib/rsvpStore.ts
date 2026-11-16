import { promises as fs } from "fs";
import path from "path";

export type Rsvp = {
  id: string;
  name: string;
  attending: "yes" | "no";
  guests: number;
  createdAt: string;
};

// Vercel's Upstash Redis integration sets KV_* (older) or UPSTASH_* (newer) variables.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "wedding:rsvps";
const FILE = path.join(process.cwd(), ".data", "rsvps.json");

export const usingRedis = Boolean(REDIS_URL && REDIS_TOKEN);

async function redis(command: (string | number)[]) {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis request failed (${res.status})`);
  return (await res.json()).result;
}

function assertWritableStorage() {
  if (!usingRedis && process.env.VERCEL) {
    throw new Error("No database connected. Add Upstash Redis in Vercel → Storage, then redeploy.");
  }
}

async function readFile(): Promise<Record<string, Rsvp>> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); } catch { return {}; }
}

async function writeFile(data: Record<string, Rsvp>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2));
}

/** Saves a response. A guest who submits again with the same name updates their answer. */
export async function saveRsvp(rsvp: Rsvp) {
  assertWritableStorage();
  if (usingRedis) {
    await redis(["HSET", KEY, rsvp.id, JSON.stringify(rsvp)]);
    return;
  }
  const data = await readFile();
  data[rsvp.id] = rsvp;
  await writeFile(data);
}

export async function listRsvps(): Promise<Rsvp[]> {
  assertWritableStorage();
  let items: Rsvp[];
  if (usingRedis) {
    const flat: string[] = (await redis(["HGETALL", KEY])) ?? [];
    items = flat.filter((_, i) => i % 2 === 1).map(v => JSON.parse(v));
  } else {
    items = Object.values(await readFile());
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteRsvp(id: string) {
  assertWritableStorage();
  if (usingRedis) {
    await redis(["HDEL", KEY, id]);
    return;
  }
  const data = await readFile();
  delete data[id];
  await writeFile(data);
}
