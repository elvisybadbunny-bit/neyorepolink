"use client";

/**
 * Y.2 — NEYO Team & Access. Founder-only real page to create/suspend/edit
 * NEYO_OPS/NEYO_SUPPORT company accounts, with individually-grantable extra
 * permissions per account. Founder's own words: "since am alone for now me
 * the founder can access everything in the system" — the Founder account
 * itself is never managed here (always unrestricted).
 */
import * as React from "react";
import { Users, Plus, Shield, ShieldCheck, ShieldOff, KeyRound, Trash2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

interface TeamMember {
  id: string; fullName: string; email: string | null; phone: string | null;
  role: string; roleLabel: string; neyoLoginId: string; isFounderTier: boolean;
  isActive: boolean; lastLoginAt: string | null; createdAt: string; note: string | null;
  invitedByName: string | null; basePermissions: string[]; extraPermissions: string[]; effectivePermissions: string[];
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  NEYO_OPS: "Broader internal tooling: platform flags, developer center, customer requests, metrics. Excludes pricing/billing changes, impersonation, and team management.",
  NEYO_SUPPORT: "Customer-facing only: inquiries, quote/demo requests, custom feature requests, onboarding guidance. No platform flags, pricing, or developer tools by default.",
};

export function NeyoTeamOpsTab() {
  const { toast } = useToast();
  const [members, setMembers] = React.useState<TeamMember[] | null>(null);
  const [grantable, setGrantable] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [newCreds, setNewCreds] = React.useState<{ email: string; neyoLoginId: string; tempPassword: string } | null>(null);

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/ops/neyo-team");
      const json = await res.json();
      if (json.ok) { setMembers(json.data.members); setGrantable(json.data.grantablePermissions); }
      else setError(json.error?.message || "Failed to load");
    } catch { setError("Failed to load"); }
  }, []);
  React.useEffect(() => { void load(); }, [load]);

  async function toggleActive(m: TeamMember) {
    setBusyId(m.id);
    try {
      const res = await fetch("/api/ops/neyo-team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", userId: m.id, active: !m.isActive }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: m.isActive ? "Account suspended" : "Account re-activated", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  async function resetPassword(m: TeamMember) {
    setBusyId(m.id);
    try {
      const res = await fetch("/api/ops/neyo-team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", userId: m.id }),
      });
      const json = await res.json();
      if (json.ok) { setNewCreds({ email: m.email || "", neyoLoginId: m.neyoLoginId, tempPassword: json.data.tempPassword }); toast({ title: "Password reset", tone: "success" }); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  async function removeMember(m: TeamMember) {
    if (!confirm(`Remove ${m.fullName}'s NEYO account? This cannot be undone.`)) return;
    setBusyId(m.id);
    try {
      const res = await fetch("/api/ops/neyo-team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", userId: m.id }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Account removed", tone: "success" }); await load(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setBusyId(null); }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-900/20">
        {error} <Button size="sm" variant="secondary" className="ml-2" onClick={() => void load()}>Retry</Button>
      </div>
    );
  }

  if (!members) {
    return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>;
  }

  const founders = members.filter((m) => m.isFounderTier);
  const staff = members.filter((m) => !m.isFounderTier);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2"><Users className="h-5 w-5 text-indigo-600" /> NEYO Team &amp; Access</span>
            <Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="h-3.5 w-3.5" /> New team account</Button>
          </CardTitle>
          <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
            Create real NEYO Support or NEYO Operations accounts and control exactly what each one can access. The Founder account (you) is always unrestricted — everything in the system.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy-400">Founder</p>
            {founders.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50/60 p-4 dark:border-green-900/30 dark:bg-green-950/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-navy-900 dark:text-white">{m.fullName}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{m.email} · {m.neyoLoginId}</p>
                  </div>
                </div>
                <Badge tone="green">Unrestricted — everything in the system</Badge>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-navy-400">NEYO Operations &amp; Support</p>
            {staff.length === 0 ? (
              <EmptyState icon={Users} title="No team accounts yet" description="Create a NEYO Support or NEYO Operations account to delegate access as your team grows." />
            ) : (
              <div className="space-y-3">
                {staff.map((m) => (
                  <TeamMemberCard
                    key={m.id}
                    member={m}
                    grantable={grantable}
                    busy={busyId === m.id}
                    onToggleActive={() => void toggleActive(m)}
                    onResetPassword={() => void resetPassword(m)}
                    onRemove={() => void removeMember(m)}
                    onSaved={() => void load()}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {createOpen ? (
        <CreateTeamMemberDialog
          grantable={grantable}
          onClose={() => setCreateOpen(false)}
          onCreated={(creds) => { setCreateOpen(false); setNewCreds(creds); void load(); }}
        />
      ) : null}

      {newCreds ? <CredentialsDialog creds={newCreds} onClose={() => setNewCreds(null)} /> : null}
    </div>
  );
}

function TeamMemberCard({
  member, grantable, busy, onToggleActive, onResetPassword, onRemove, onSaved,
}: {
  member: TeamMember; grantable: string[]; busy: boolean;
  onToggleActive: () => void; onResetPassword: () => void; onRemove: () => void; onSaved: () => void;
}) {
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [extra, setExtra] = React.useState<string[]>(member.extraPermissions);
  const [saving, setSaving] = React.useState(false);

  async function savePermissions() {
    setSaving(true);
    try {
      const res = await fetch("/api/ops/neyo-team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", userId: member.id, extraPermissions: extra }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Permissions updated", tone: "success" }); setEditing(false); onSaved(); }
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="rounded-2xl border border-navy-100 p-4 dark:border-navy-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {member.isActive ? <Shield className="h-5 w-5 text-blue-600" /> : <ShieldOff className="h-5 w-5 text-navy-400" />}
          <div>
            <p className="font-semibold text-navy-900 dark:text-white">{member.fullName}</p>
            <p className="text-xs text-navy-500 dark:text-navy-400">{member.email} · {member.neyoLoginId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={member.role === "NEYO_OPS" ? "blue" : "amber"}>{member.roleLabel}</Badge>
          <Badge tone={member.isActive ? "green" : "neutral"}>{member.isActive ? "Active" : "Suspended"}</Badge>
        </div>
      </div>
      <p className="mt-2 text-xs text-navy-500 dark:text-navy-400">{ROLE_DESCRIPTIONS[member.role] || ""}</p>
      {member.note ? <p className="mt-1 text-xs italic text-navy-400 dark:text-navy-500">Note: {member.note}</p> : null}
      <p className="mt-1 text-[11px] text-navy-400 dark:text-navy-500">
        {member.lastLoginAt ? `Last login: ${new Date(member.lastLoginAt).toLocaleString()}` : "Never logged in"} · Added by {member.invitedByName || "—"}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>{editing ? "Close" : "Edit access"}</Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={onToggleActive}>{member.isActive ? "Suspend" : "Re-activate"}</Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={onResetPassword}><KeyRound className="h-3.5 w-3.5" /> Reset password</Button>
        <Button size="sm" variant="danger" disabled={busy} onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /> Remove</Button>
      </div>

      {editing ? (
        <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/50 p-3 dark:border-navy-800 dark:bg-navy-900/40">
          <p className="mb-2 text-xs font-semibold text-navy-700 dark:text-navy-200">Extra permissions granted individually (on top of {member.roleLabel}'s base access)</p>
          <div className="grid max-h-56 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
            {grantable.filter((p) => !member.basePermissions.includes(p)).map((p) => (
              <label key={p} className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                <input
                  type="checkbox"
                  checked={extra.includes(p)}
                  onChange={(e) => setExtra((prev) => (e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)))}
                />
                {p}
              </label>
            ))}
          </div>
          <Button size="sm" className="mt-3" disabled={saving} onClick={() => void savePermissions()}>Save permissions</Button>
        </div>
      ) : null}
    </div>
  );
}

function CreateTeamMemberDialog({
  grantable, onClose, onCreated,
}: {
  grantable: string[];
  onClose: () => void;
  onCreated: (creds: { email: string; neyoLoginId: string; tempPassword: string }) => void;
}) {
  const { toast } = useToast();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<"NEYO_OPS" | "NEYO_SUPPORT">("NEYO_SUPPORT");
  const [note, setNote] = React.useState("");
  const [extra, setExtra] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  async function create() {
    if (!fullName || !email || !phone) { toast({ title: "Name, email and phone are required", tone: "error" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/ops/neyo-team", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", fullName, email, phone, role, note, extraPermissions: extra }),
      });
      const json = await res.json();
      if (json.ok) onCreated({ email, neyoLoginId: json.data.neyoLoginId, tempPassword: json.data.tempPassword });
      else toast({ title: json.error?.message || "Failed", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>New NEYO team account</DialogTitle></DialogHeader>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto py-2">
          <div className="space-y-1"><Label>Full name</Label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Wanjiku Njoroge" /></div>
          <div className="space-y-1"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@neyo.co.ke" /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" /></div>
          <div className="space-y-1">
            <Label>Role</Label>
            <select value={role} onChange={(e) => setRole(e.target.value as "NEYO_OPS" | "NEYO_SUPPORT")} className="h-10 w-full rounded-xl border border-navy-200 bg-white px-3 text-sm dark:border-navy-800 dark:bg-navy-900">
              <option value="NEYO_SUPPORT">NEYO Support — customer inquiries, quotes, demos, onboarding</option>
              <option value="NEYO_OPS">NEYO Operations — broader internal tooling</option>
            </select>
            <p className="text-xs text-navy-500 dark:text-navy-400">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
          <div className="space-y-1"><Label>Note (private, for you only)</Label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Handles WhatsApp inquiries" /></div>
          <div className="space-y-1">
            <Label>Extra permissions (optional, individually granted)</Label>
            <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-xl border border-navy-100 p-2 dark:border-navy-800 sm:grid-cols-2">
              {grantable.map((p) => (
                <label key={p} className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                  <input type="checkbox" checked={extra.includes(p)} onChange={(e) => setExtra((prev) => (e.target.checked ? [...prev, p] : prev.filter((x) => x !== p)))} />
                  {p}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => void create()} disabled={saving}>{saving ? "Creating…" : "Create account"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CredentialsDialog({ creds, onClose }: { creds: { email: string; neyoLoginId: string; tempPassword: string }; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);
  async function copyAll() {
    await navigator.clipboard.writeText(`Email: ${creds.email}\nNEYO Login ID: ${creds.neyoLoginId}\nTemporary password: ${creds.tempPassword}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Account credentials — shown once</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-sm text-navy-600 dark:text-navy-300">Relay these to the new team member yourself (WhatsApp, call, or in person). NEYO never stores or re-shows this password.</p>
          <div className="space-y-2 rounded-xl border border-navy-100 bg-navy-50/60 p-3 font-mono text-xs dark:border-navy-800 dark:bg-navy-900/40">
            <p>Email: {creds.email}</p>
            <p>NEYO Login ID: {creds.neyoLoginId}</p>
            <p>Temporary password: {creds.tempPassword}</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => void copyAll()}>{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy all"}</Button>
        </div>
        <DialogFooter><Button onClick={onClose}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
