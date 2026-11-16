"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (res.ok) router.refresh();
    else setError((await res.json().catch(() => null))?.error ?? "Login failed.");
  };

  return (
    <form className="admin-login" onSubmit={submit}>
      <label htmlFor="admin-pw">Password</label>
      <input id="admin-pw" type="password" value={password} onChange={e => setPassword(e.target.value)} autoFocus required />
      {error && <p className="admin-error">{error}</p>}
      <button className="admin-btn primary" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
    </form>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button className="admin-btn" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); router.refresh(); }}>
      Sign out
    </button>
  );
}

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    if (!confirm(`Delete the response from ${name}?`)) return;
    setBusy(true);
    await fetch(`/api/admin/rsvps?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  };
  return <button className="admin-delete" onClick={remove} disabled={busy} aria-label={`Delete response from ${name}`}>{busy ? "…" : "Delete"}</button>;
}
