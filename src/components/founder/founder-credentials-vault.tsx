"use client";

import React from "react";
import { Key, ShieldCheck, Lock, Edit3, Check, Search, Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface CredentialStatus {
  key: string;
  provider: string;
  label: string;
  kind: "public" | "secret";
  configured: boolean;
  masked: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
}

export function FounderCredentialsVault() {
  const { toast } = useToast();
  const [credentials, setCredentials] = React.useState<CredentialStatus[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingKey, setEditingKey] = React.useState<CredentialStatus | null>(null);
  const [newValue, setNewValue] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedProvider, setSelectedProvider] = React.useState("ALL");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/founder-ops");
      const json = await res.json();
      if (json.ok && json.data?.integrationCredentials) {
        setCredentials(json.data.integrationCredentials);
      }
    } catch {
      toast({ title: "Failed to load credentials vault", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleSaveCredential() {
    if (!editingKey || !newValue.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/founder-ops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_integration_credential",
          data: {
            key: editingKey.key,
            value: newValue.trim(),
          },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: `${editingKey.label} saved to encrypted vault!`, tone: "success" });
        setEditingKey(null);
        setNewValue("");
        load();
      } else {
        toast({ title: json.error?.message || "Failed to save credential", tone: "error" });
      }
    } catch {
      toast({ title: "Network error saving credential", tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  const providers = ["ALL", ...Array.from(new Set(credentials.map((c) => c.provider)))];

  const filtered = credentials.filter((c) => {
    const matchesSearch =
      c.label.toLowerCase().includes(search.toLowerCase()) ||
      c.key.toLowerCase().includes(search.toLowerCase()) ||
      c.provider.toLowerCase().includes(search.toLowerCase());
    const matchesProvider = selectedProvider === "ALL" || c.provider === selectedProvider;
    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Platform Operations Encrypted Credentials & Integration Secrets Vault
          </h2>
          <p className="text-sm text-slate-400">
            Configure live third-party credentials (M-Pesa Daraja, SMS, AWS S3, OAuth, Google Vision, KRA Tax eTIMS, NTSA) directly in your founder space.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-mono font-medium flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> AES-256 GCM Encrypted
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search credentials by key name or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                selectedProvider === p
                  ? "bg-emerald-600 text-white"
                  : "bg-navy-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-400" /> Loading vault secrets...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cred) => (
            <div
              key={cred.key}
              className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                    {cred.provider}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      cred.configured ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {cred.configured ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {cred.configured ? "CONFIGURED" : "NOT SET"}
                  </span>
                </div>
                <h3 className="font-semibold text-white text-sm mt-2">{cred.label}</h3>
                <p className="font-mono text-xs text-slate-400 mt-1">{cred.key}</p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-300">
                  {cred.configured ? cred.masked : <span className="text-slate-500 italic">No secret stored</span>}
                </span>
                <button
                  onClick={() => {
                    setEditingKey(cred);
                    setNewValue("");
                  }}
                  className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Credential Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass p-6 rounded-3xl border border-white/20 max-w-lg w-full space-y-5 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" /> Configure {editingKey.label}
              </h3>
              <button
                onClick={() => setEditingKey(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <p className="text-xs text-slate-400">Target Key Parameter</p>
                <p className="font-mono text-xs text-emerald-300">{editingKey.key}</p>
                <p className="text-xs text-slate-400">Provider: {editingKey.provider}</p>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1.5 font-medium">
                  Enter / Paste New Value
                </label>
                <textarea
                  rows={4}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Paste ${editingKey.label} value here...`}
                  className="w-full bg-navy-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Saved credentials are encrypted with your master key (AES-256 GCM) and automatically made available to all NEYO system modules.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingKey(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCredential}
                disabled={saving || !newValue.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Encrypting & Saving..." : "Save Credential to Vault"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
