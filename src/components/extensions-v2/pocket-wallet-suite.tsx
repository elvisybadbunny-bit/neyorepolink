"use client";

/**
 * Idea 4 (kenyan-extensions.service.ts) — Digital Student Tuck-Shop Pocket
 * Money Wallet. Real backend existed (StudentPocketWallet,
 * PocketWalletTransaction, /api/cafeteria/pocket-wallet[/transact]) with
 * ZERO frontend UI until this fix — a genuinely orphaned feature found
 * during a full-stack audit of a prior AI session's "12 operational
 * suites" commit. Lets a bursar/cafeteria staff look up any student's
 * wallet, deposit pocket money, or record a tuck-shop spend, with a real
 * running transaction ledger.
 */
import * as React from "react";
import { Wallet, Plus, Minus, Loader2, ShieldAlert, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { StudentSearchSelect, type StudentSearchOption } from "@/components/students/student-search-select";

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

interface WalletData {
  id: string;
  balanceKes: number;
  totalDepositedKes: number;
  totalSpentKes: number;
  isFrozen: boolean;
}
interface TxRow {
  id: string;
  type: "DEPOSIT" | "SPEND";
  amountKes: number;
  description: string;
  performedBy: string;
  createdAt: string;
}

export function PocketWalletSuite({ students }: { students: StudentSearchOption[] }) {
  const { toast } = useToast();
  const [studentId, setStudentId] = React.useState("");
  const [wallet, setWallet] = React.useState<WalletData | null>(null);
  const [transactions, setTransactions] = React.useState<TxRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState<"DEPOSIT" | "SPEND" | null>(null);

  const load = React.useCallback((id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/cafeteria/pocket-wallet?studentId=${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setWallet(j.data.wallet);
          setTransactions(j.data.transactions ?? []);
        } else {
          setError(j.error?.message || "Could not load pocket wallet.");
        }
      })
      .catch(() => setError("Network request failed"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (studentId) load(studentId);
    else {
      setWallet(null);
      setTransactions([]);
    }
  }, [studentId, load]);

  async function handleTransact(action: "DEPOSIT" | "SPEND") {
    const amt = Number(amount);
    if (!studentId) {
      toast({ title: "Select a student first", tone: "error" });
      return;
    }
    if (!amt || amt <= 0) {
      toast({ title: "Enter a valid amount in KES", tone: "error" });
      return;
    }
    setBusy(action);
    try {
      const res = await fetch("/api/cafeteria/pocket-wallet/transact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, action, amountKes: amt, description }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({
          title: action === "DEPOSIT" ? `Deposited ${kes(amt)}` : `Spent ${kes(amt)} recorded`,
          tone: "success",
        });
        setAmount("");
        setDescription("");
        load(studentId);
      } else {
        toast({ title: json.error?.message || "Transaction failed", tone: "error" });
      }
    } finally {
      setBusy(null);
    }
  }

  if (error && error.toLowerCase().includes("paused")) {
    return (
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-2">
        <h3 className="font-bold flex items-center gap-2 text-base text-amber-300">
          <Lock className="w-5 h-5 text-amber-400" /> Feature switched off in NEYO Ops (Digital Pocket Wallet)
        </h3>
        <p className="text-xs text-slate-300">
          This feature can be individually enabled or paused platform-wide in NEYO Ops.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-navy-950 dark:text-white flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          Student Tuck-Shop Pocket Wallet (`Idea 4`)
        </h2>
        <p className="text-sm text-navy-500 dark:text-navy-400">
          A real digital pocket-money account per learner. Deposit cash the parent brings in, then draw it down as the
          student spends at the tuck-shop or canteen — with a running, auditable ledger.
        </p>
      </div>

      <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
        <CardHeader>
          <CardTitle className="text-base">Look up a student's wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StudentSearchSelect
            students={students}
            value={studentId}
            onChange={setStudentId}
            label="Learner"
            required={false}
          />

          {loading ? (
            <Skeleton className="h-24 rounded-2xl" />
          ) : error && !error.toLowerCase().includes("paused") ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          ) : wallet ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-4">
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold">Current balance</p>
                <p className="text-2xl font-black text-green-900 dark:text-green-200">{kes(wallet.balanceKes)}</p>
                {wallet.isFrozen && <Badge tone="red" className="mt-1">Wallet frozen</Badge>}
              </div>
              <div className="rounded-2xl bg-navy-50 dark:bg-navy-900/40 p-4">
                <p className="text-xs text-navy-500 font-semibold">Total deposited</p>
                <p className="text-lg font-bold text-navy-900 dark:text-white">{kes(wallet.totalDepositedKes)}</p>
              </div>
              <div className="rounded-2xl bg-navy-50 dark:bg-navy-900/40 p-4">
                <p className="text-xs text-navy-500 font-semibold">Total spent</p>
                <p className="text-lg font-bold text-navy-900 dark:text-white">{kes(wallet.totalSpentKes)}</p>
              </div>
            </div>
          ) : studentId ? (
            <p className="text-sm text-navy-400">No wallet activity yet — deposit below to create one.</p>
          ) : (
            <p className="text-sm text-navy-400">Select a learner above to view or manage their pocket wallet.</p>
          )}

          {studentId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <Label htmlFor="pw-amount">Amount (KES)</Label>
                <Input
                  id="pw-amount"
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pw-desc">Description</Label>
                <Input
                  id="pw-desc"
                  placeholder="e.g. Lunch top-up from parent"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={() => handleTransact("DEPOSIT")}
                disabled={busy !== null}
                className="rounded-full bg-green-700 hover:bg-green-800 text-white"
              >
                {busy === "DEPOSIT" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Deposit
              </Button>
              <Button
                onClick={() => handleTransact("SPEND")}
                disabled={busy !== null || Boolean(wallet?.isFrozen)}
                variant="secondary"
                className="rounded-full"
              >
                {busy === "SPEND" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Minus className="mr-2 h-4 w-4" />}
                Record spend
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {studentId && transactions.length > 0 && (
        <Card className="rounded-3xl border border-navy-100 dark:border-navy-800">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-navy-400" /> Transaction ledger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-navy-100 dark:border-navy-800 px-3 py-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium text-navy-900 dark:text-white">{t.description}</p>
                    <p className="text-xs text-navy-400">
                      {t.performedBy} · {new Date(t.createdAt).toLocaleString("en-KE")}
                    </p>
                  </div>
                  <Badge tone={t.type === "DEPOSIT" ? "green" : "red"}>
                    {t.type === "DEPOSIT" ? "+" : "-"}
                    {kes(t.amountKes)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
