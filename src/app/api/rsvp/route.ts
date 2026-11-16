import { NextResponse } from "next/server";
import { saveRsvp } from "@/lib/rsvpStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { name?: unknown; attending?: unknown; guests?: unknown; website?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  // Honeypot: real guests never see or fill this field.
  if (typeof body.website === "string" && body.website.trim()) return NextResponse.json({ ok: true });

  const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
  const attending = body.attending === "yes" || body.attending === "no" ? body.attending : null;
  const guests = attending === "yes" ? Math.min(10, Math.max(1, Math.floor(Number(body.guests) || 1))) : 0;

  if (!name || name.length > 80) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!attending) return NextResponse.json({ error: "Please choose whether you will attend." }, { status: 400 });

  try {
    await saveRsvp({ id: name.toLowerCase(), name, attending, guests, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "We couldn't save your response. Please try again later." }, { status: 500 });
  }
}
