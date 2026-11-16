import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import { listRsvps, usingRedis, type Rsvp } from "@/lib/rsvpStore";
import { DeleteButton, LoginForm, LogoutButton } from "./AdminClient";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "RSVP Admin", robots: { index: false, follow: false } };

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="admin-shell">
        <div className="admin-card narrow">
          <h1>RSVP Admin</h1>
          <p>Set an <code>ADMIN_PASSWORD</code> environment variable (in <code>.env.local</code> locally, or Vercel → Settings → Environment Variables), then restart or redeploy.</p>
        </div>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="admin-shell">
        <div className="admin-card narrow">
          <p className="admin-kicker">Aarav & Ananya</p>
          <h1>RSVP Admin</h1>
          <LoginForm />
        </div>
      </main>
    );
  }

  let rows: Rsvp[] = [];
  let error = "";
  try { rows = await listRsvps(); } catch (e) { error = e instanceof Error ? e.message : "Could not load responses."; }

  const yes = rows.filter(r => r.attending === "yes");
  const no = rows.filter(r => r.attending === "no");
  const headcount = yes.reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <main className="admin-shell">
      <div className="admin-card">
        <header className="admin-head">
          <div>
            <p className="admin-kicker">Aarav & Ananya</p>
            <h1>RSVP Responses</h1>
          </div>
          <div className="admin-actions">
            <a className="admin-btn" href="/api/admin/rsvps?format=csv">Download CSV</a>
            <LogoutButton />
          </div>
        </header>

        {!usingRedis && !error && <p className="admin-note">Local mode: responses are saved to <code>.data/rsvps.json</code>. Connect Upstash Redis on Vercel for the live site.</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-stats">
          <div><strong>{rows.length}</strong><span>Responses</span></div>
          <div><strong>{yes.length}</strong><span>Attending</span></div>
          <div><strong>{headcount}</strong><span>Total guests</span></div>
          <div><strong>{no.length}</strong><span>Declined</span></div>
        </div>

        {rows.length === 0 ? <p className="admin-empty">No responses yet.</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Response</th><th>Guests</th><th>Submitted</th><th /></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    <td data-label="Name">{r.name}</td>
                    <td data-label="Response"><span className={`pill ${r.attending}`}>{r.attending === "yes" ? "Attending" : "Declined"}</span></td>
                    <td data-label="Guests">{r.attending === "yes" ? r.guests || 1 : "—"}</td>
                    <td data-label="Submitted">{fmt(r.createdAt)}</td>
                    <td><DeleteButton id={r.id} name={r.name} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
