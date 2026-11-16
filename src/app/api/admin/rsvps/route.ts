import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { deleteRsvp, listRsvps } from "@/lib/rsvpStore";

export const dynamic = "force-dynamic";

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

/** GET ?format=csv downloads all responses as a spreadsheet. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await listRsvps();
  if (new URL(req.url).searchParams.get("format") !== "csv") return NextResponse.json(rows);

  const csv = [
    ["Name", "Attending", "Guests", "Submitted"].map(csvCell).join(","),
    ...rows.map(r => [r.name, r.attending === "yes" ? "Yes" : "No", r.guests, r.createdAt].map(csvCell).join(",")),
  ].join("\r\n");
  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="rsvp-responses.csv"',
    },
  });
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await deleteRsvp(id);
  return NextResponse.json({ ok: true });
}
