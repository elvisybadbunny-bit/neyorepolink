"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Mail, AtSign, MailCheck, Fingerprint, Sparkles } from "lucide-react";
import { NeyoLogo } from "@/components/brand/neyo-logo";
import { startAuthentication } from "@simplewebauthn/browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/toast";
import { getOperatingSystem, OPERATING_SYSTEMS, type OperatingSystemKey, isOperatingSystemKey } from "@/lib/core/operating-systems";

type Step =
  | "phone"
  | "code"
  | "email"
  | "magic"
  | "magic-sent"
  | "twofactor"
  | "passkey"
  | "success";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [demoModalOpen, setDemoModalOpen] = React.useState(false);
  const [demoPhone, setDemoPhone] = React.useState("");
  const [demoEmail, setDemoEmail] = React.useState("");
  const [demoName, setDemoName] = React.useState("");
  const [demoLoading, setDemoLoading] = React.useState(false);

  // Forgot Password with SMS OTP state
  const [forgotOpen, setForgotOpen] = React.useState(false);
  const [forgotInput, setForgotInput] = React.useState("");
  const [forgotOtp, setForgotOtp] = React.useState("");
  const [forgotNewPwd, setForgotNewPwd] = React.useState("");
  const [recoverySent, setRecoverySent] = React.useState(false);
  const [recoveryLoading, setRecoveryLoading] = React.useState(false);

  // First Login Activation / Set Initial Password state
  const [firstLoginOpen, setFirstLoginOpen] = React.useState(false);
  const [firstLoginPwd, setFirstLoginPwd] = React.useState("");
  const [firstLoginLoading, setFirstLoginLoading] = React.useState(false);
  const [firstLoginDest, setFirstLoginDest] = React.useState("/dashboard");

  async function handleSendRecoveryOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!forgotInput.trim()) {
      toast({ title: "Please enter your phone number or NEYO email", tone: "error" });
      return;
    }
    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: forgotInput.trim() }),
      });
      const json = await res.json();
      if (json.ok) {
        setRecoverySent(true);
        toast({ title: "Recovery Code Sent!", description: json.data?.message || "Check your phone SMS.", tone: "success" });
      } else {
        toast({ title: json.error?.message || "Could not send recovery code.", tone: "error" });
      }
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleVerifyRecoveryOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!forgotOtp || forgotNewPwd.length < 8) {
      toast({ title: "Enter the 6-digit OTP code and a password with at least 8 characters", tone: "error" });
      return;
    }
    setRecoveryLoading(true);
    try {
      const res = await fetch("/api/auth/password-reset/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneOrEmail: forgotInput.trim(), otpCode: forgotOtp, newPassword: forgotNewPwd }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Password Reset & Account Unlocked!", description: "Taking you to your dashboard...", tone: "success" });
        setForgotOpen(false);
        setStep("success");
        const dest = json.data?.user?.role === "FOUNDER" || json.data?.user?.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard";
        setTimeout(() => window.location.assign(dest), 800);
      } else {
        toast({ title: json.error?.message || "Verification failed.", tone: "error" });
      }
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleSetInitialPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (firstLoginPwd.length < 8) {
      toast({ title: "Password must be at least 8 characters long", tone: "error" });
      return;
    }
    setFirstLoginLoading(true);
    try {
      const res = await fetch("/api/auth/set-initial-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: firstLoginPwd }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Secure Password Set!", description: "Entering your School OS...", tone: "success" });
        setFirstLoginOpen(false);
        setTimeout(() => window.location.assign(firstLoginDest), 600);
      } else {
        toast({ title: json.error?.message || "Could not save password.", tone: "error" });
      }
    } finally {
      setFirstLoginLoading(false);
    }
  }

  async function submitAndLaunchDemo(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!/^(?:\+254|0)[17]\d{8}$/.test(demoPhone.replace(/\s+/g, ""))) {
      toast({ title: "Please enter a valid Kenyan phone number (e.g. +254 712 345 678)", tone: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demoEmail)) {
      toast({ title: "Please enter a valid school or work email address", tone: "error" });
      return;
    }
    setDemoLoading(true);
    try {
      const res = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: demoPhone, email: demoEmail, name: demoName }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: "Interactive Demo Approved!", description: "Launching your sandboxed School OS...", tone: "success" });
        setTimeout(() => { window.location.href = "/dashboard"; }, 700);
      } else {
        toast({ title: json.error?.message || "Could not start the demo. Try again.", tone: "error" });
        setDemoLoading(false);
      }
    } catch {
      toast({ title: "Network problem starting the demo.", tone: "error" });
      setDemoLoading(false);
    }
  }

  const [step, setStep] = React.useState<Step>("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [normalizedPhone, setNormalizedPhone] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);
  const [signedInName, setSignedInName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [devLink, setDevLink] = React.useState("");
  const [challengeToken, setChallengeToken] = React.useState("");
  const [twoFactorCode, setTwoFactorCode] = React.useState("");
  const [tenantName, setTenantName] = React.useState<string | null>(null);
  const [osKey, setOsKey] = React.useState<OperatingSystemKey>("school");
  const os = getOperatingSystem(osKey);

  React.useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("os");
    if (param && isOperatingSystemKey(param)) setOsKey(param);
  }, []);

  // Show which school this subdomain belongs to (A.2.3), if any.
  React.useEffect(() => {
    fetch("/api/tenant/current")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.tenant) setTenantName(j.data.tenant.name);
      })
      .catch(() => {});
  }, []);

  // Magic-link callback with 2FA on redirects here with ?challenge=...
  React.useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("challenge");
    if (c) {
      setChallengeToken(c);
      setStep("twofactor");
    }
  }, []);

  // EMPTY/IDLE GUARD: if already signed in, skip the form entirely.
  React.useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((j) => {
        if (active && j.ok && j.data?.user) {
          window.location.assign(j.data.user.role === "FOUNDER" || j.data.user.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard");
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Countdown for the "resend code" link.
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function requestCode(e?: React.FormEvent) {
    e?.preventDefault();
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json.error?.fields?.phone ||
          json.error?.message ||
          "Could not send the code. Try again.";
        setFieldError(msg);
        return;
      }

      setNormalizedPhone(json.data.phone);
      setStep("code");
      setCode("");
      setResendIn(30);

      // Development helper: surface the code so the founder can test without SMS.
      if (json.data.devCode) {
        toast({
          title: `Dev code: ${json.data.devCode}`,
          description: "Shown only in development — real SMS arrives via A.7.",
          tone: "info",
        });
      } else {
        toast({
          title: "Code sent",
          description: `We sent a 6-digit code to ${json.data.phone}.`,
          tone: "success",
        });
      }
    } catch {
      setFieldError("Network problem. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(submittedCode?: string) {
    const finalCode = submittedCode ?? code;
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, code: finalCode }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg = json.error?.message || "That code did not work.";
        setFieldError(msg);
        setCode("");
        return;
      }

      // 2FA gate: a challenge means we still need the authenticator code.
      if (json.data.twoFactorRequired) {
        setChallengeToken(json.data.challengeToken);
        setTwoFactorCode("");
        setStep("twofactor");
        return;
      }

      // SUCCESS STATE: show a brief confirmation, then redirect. Feels intentional.
      setSignedInName(json.data.user.fullName);
      setStep("success");
      toast({
        title: `Welcome, ${json.data.user.fullName}`,
        tone: "success",
      });
      // Full reload so server components pick up the new session cookie.
      const dest = json.data?.user?.role === "FOUNDER" || json.data?.user?.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard";
      if (json.data?.user?.hasSetInitialPassword === false) {
        setFirstLoginDest(dest);
        setFirstLoginOpen(true);
        setStep("success");
        return;
      }
      setTimeout(() => window.location.assign(dest), 900);
    } catch {
      setFieldError("Network problem. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithEmail(e?: React.FormEvent) {
    e?.preventDefault();
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/password/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json.error?.fields?.email ||
          json.error?.fields?.password ||
          json.error?.message ||
          "Wrong email or password.";
        setFieldError(msg);
        return;
      }

      if (json.data.twoFactorRequired) {
        setChallengeToken(json.data.challengeToken);
        setTwoFactorCode("");
        setStep("twofactor");
        return;
      }

      setSignedInName(json.data.user.fullName);
      setStep("success");
      toast({ title: `Welcome, ${json.data.user.fullName}`, tone: "success" });
      const dest = json.data?.user?.role === "FOUNDER" || json.data?.user?.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard";
      if (json.data?.user?.hasSetInitialPassword === false) {
        setFirstLoginDest(dest);
        setFirstLoginOpen(true);
        return;
      }
      setTimeout(() => window.location.assign(dest), 900);
    } catch {
      setFieldError("Network problem. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function requestMagicLink(e?: React.FormEvent) {
    e?.preventDefault();
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/magic/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json.error?.fields?.email ||
          json.error?.message ||
          "Could not send the link. Try again.";
        setFieldError(msg);
        return;
      }

      setStep("magic-sent");

      if (json.data.devLink) {
        toast({
          title: "Dev sign-in link ready",
          description: "Shown only in development — click it below.",
          tone: "info",
        });
        // Stash the dev link so we can render a clickable button.
        setDevLink(json.data.devLink);
      } else {
        toast({ title: "Check your inbox", tone: "success" });
      }
    } catch {
      setFieldError("Network problem. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyTwoFactor(submitted?: string) {
    const factor = submitted ?? twoFactorCode;
    setFieldError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, token: factor }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setFieldError(json.error?.message || "That code is not correct.");
        setTwoFactorCode("");
        return;
      }
      setSignedInName(json.data.user.fullName);
      setStep("success");
      toast({ title: `Welcome, ${json.data.user.fullName}`, tone: "success" });
      const dest = json.data?.user?.role === "FOUNDER" || json.data?.user?.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard";
      if (json.data?.user?.hasSetInitialPassword === false) {
        setFirstLoginDest(dest);
        setFirstLoginOpen(true);
        return;
      }
      setTimeout(() => window.location.assign(dest), 900);
    } catch {
      setFieldError("Network problem. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithPasskey(e?: React.FormEvent) {
    e?.preventDefault();
    setFieldError(null);
    setLoading(true);
    try {
      const optRes = await fetch("/api/auth/passkey/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const optJson = await optRes.json();
      if (!optJson.ok) {
        setFieldError(optJson.error?.fields?.email || optJson.error?.message || "Could not start.");
        return;
      }

      // Browser prompts for the passkey (Face ID / fingerprint / key).
      const assertion = await startAuthentication(optJson.data.options);

      const verRes = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, response: assertion }),
      });
      const verJson = await verRes.json();
      if (!verRes.ok || !verJson.ok) {
        setFieldError(verJson.error?.message || "Passkey sign-in failed.");
        return;
      }

      if (verJson.data.twoFactorRequired) {
        setChallengeToken(verJson.data.challengeToken);
        setTwoFactorCode("");
        setStep("twofactor");
        return;
      }

      setSignedInName(verJson.data.user.fullName);
      setStep("success");
      toast({ title: `Welcome, ${verJson.data.user.fullName}`, tone: "success" });
      const dest = verJson.data?.user?.role === "FOUNDER" || verJson.data?.user?.role === "SUPER_ADMIN" || (osKey as string) === "company" ? "/founder" : "/dashboard";
      if (verJson.data?.user?.hasSetInitialPassword === false) {
        setFirstLoginDest(dest);
        setFirstLoginOpen(true);
        return;
      }
      setTimeout(() => window.location.assign(dest), 900);
    } catch {
      setFieldError("Passkey sign-in was cancelled or not available.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* Brand */}
      <div className="mb-8 flex flex-col items-center text-center">
        <NeyoLogo variant="mark" className="h-12" title="NEYO" />
        <h1 className="mt-4 text-xl font-semibold tracking-tight text-navy-900 dark:text-navy-50">
          {step === "phone"
            ? tenantName
              ? `Sign in to ${tenantName}`
              : "Sign in to NEYO"
            : step === "code"
              ? "Enter your code"
              : step === "email"
                ? "Sign in with email"
                : step === "magic"
                  ? "Email me a link"
                  : step === "magic-sent"
                    ? "Check your inbox"
                    : step === "twofactor"
                      ? "Two-factor verification"
                      : "You're in"}
        </h1>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {OPERATING_SYSTEMS.map((item) => (
            <a key={item.key} href={`/os/${item.key}/login`} className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${item.key === osKey ? "border-green-300 bg-green-500/10 text-green-800 dark:text-green-200" : "border-navy-100 bg-white/60 text-navy-500 dark:border-navy-800 dark:bg-navy-900/60 dark:text-navy-400"}`}>{item.shortName}</a>
          ))}
        </div>
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">{os.name}</p>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          {step === "phone"
            ? os.tagline
            : step === "code"
              ? `We sent a 6-digit code to ${normalizedPhone}.`
              : step === "email"
                ? "Use your school email and password."
                : step === "magic"
                  ? "We'll send a one-click sign-in link."
                  : step === "magic-sent"
                    ? `We sent a sign-in link to ${email}.`
                    : step === "twofactor"
                      ? "Enter the 6-digit code from your authenticator app."
                      : "Taking you to your dashboard…"}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          {step === "success" ? (
            <div className="flex flex-col items-center py-6 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="mt-4 text-base font-semibold text-navy-900 dark:text-navy-50">
                Welcome, {signedInName.split(" ")[0]}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-navy-500 dark:text-navy-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing you in…
              </p>
            </div>
          ) : step === "phone" ? (
            <form onSubmit={requestCode} className="space-y-5">
              <div>
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  autoFocus
                  placeholder="0712 345 678"
                  value={phone}
                  leftAddon={<Phone className="h-4 w-4" />}
                  error={fieldError ?? undefined}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || phone.trim().length < 9}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send code
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative py-1 text-center">
                <span className="bg-white px-3 text-xs text-navy-400 dark:bg-navy-900 dark:text-navy-500">
                  or
                </span>
                <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-navy-100 dark:bg-navy-800" />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setFieldError(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-navy-50"
                >
                  <Mail className="h-4 w-4" />
                  Sign in with email & password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("magic");
                    setFieldError(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-navy-50"
                >
                  <MailCheck className="h-4 w-4" />
                  Email me a sign-in link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("passkey");
                    setFieldError(null);
                  }}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-navy-50"
                >
                  <Fingerprint className="h-4 w-4" />
                  Sign in with a passkey
                </button>
              </div>
            </form>
          ) : step === "magic" ? (
            <form onSubmit={requestMagicLink} className="space-y-5">
              <div>
                <Label htmlFor="magic-email">Email</Label>
                <Input
                  id="magic-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="principal@karibuhigh.ac.ke"
                  value={email}
                  leftAddon={<AtSign className="h-4 w-4" />}
                  error={fieldError ?? undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <MailCheck className="h-4 w-4" />
                    Send sign-in link
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setFieldError(null);
                }}
                className="flex w-full items-center justify-center gap-1 text-sm text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to other options
              </button>
            </form>
          ) : step === "magic-sent" ? (
            <div className="flex flex-col items-center py-4 text-center animate-fade-in">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                <MailCheck className="h-7 w-7" />
              </div>
              <p className="mt-4 text-sm text-navy-600 dark:text-navy-300">
                Open the email and tap the link to sign in. It expires in 15
                minutes.
              </p>
              {devLink && (
                <a
                  href={devLink}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-green-500 px-5 text-sm font-medium text-white shadow-card transition-all duration-200 ease-apple hover:bg-green-600"
                >
                  Open dev sign-in link
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setFieldError(null);
                  setDevLink("");
                }}
                className="mt-5 flex items-center justify-center gap-1 text-sm text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </button>
            </div>
          ) : step === "passkey" ? (
            <form onSubmit={signInWithPasskey} className="space-y-5">
              <div>
                <Label htmlFor="pk-email">Email</Label>
                <Input
                  id="pk-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="principal@karibuhigh.ac.ke"
                  value={email}
                  leftAddon={<AtSign className="h-4 w-4" />}
                  error={fieldError ?? undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" />
                    Use passkey
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setFieldError(null);
                }}
                className="flex w-full items-center justify-center gap-1 text-sm text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to other options
              </button>
            </form>
          ) : step === "twofactor" ? (
            <div className="space-y-5">
              <OtpInput
                length={6}
                value={twoFactorCode}
                onChange={(v) => {
                  setTwoFactorCode(v);
                  if (fieldError) setFieldError(null);
                }}
                onComplete={(v) => verifyTwoFactor(v)}
                disabled={loading}
                error={Boolean(fieldError)}
                autoFocus
              />
              {fieldError && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                  {fieldError}
                </p>
              )}
              <Button
                onClick={() => verifyTwoFactor()}
                className="w-full"
                disabled={loading || twoFactorCode.length < 6}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify & sign in
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-navy-400 dark:text-navy-600">
                Lost your phone? Enter one of your 8-character recovery codes
                above.
              </p>
            </div>
          ) : step === "email" ? (
            <form onSubmit={loginWithEmail} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="bursar@karibuhigh.ac.ke"
                  value={email}
                  leftAddon={<AtSign className="h-4 w-4" />}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Your password"
                  value={password}
                  error={fieldError ?? undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Sign in
                  </>
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setForgotOpen(true);
                  setRecoverySent(false);
                  setForgotOtp("");
                  setForgotNewPwd("");
                }}
                className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot your password? Recover with 6-digit SMS OTP
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setFieldError(null);
                }}
                className="flex w-full items-center justify-center gap-1 text-sm text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use phone number instead
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <OtpInput
                length={6}
                value={code}
                onChange={(v) => {
                  setCode(v);
                  if (fieldError) setFieldError(null);
                }}
                onComplete={(v) => verifyCode(v)}
                disabled={loading}
                error={Boolean(fieldError)}
                autoFocus
              />
              {fieldError && (
                <p className="text-center text-sm text-red-600 dark:text-red-400">
                  {fieldError}
                </p>
              )}

              <Button
                onClick={() => verifyCode()}
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Verify & sign in
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setFieldError(null);
                    setCode("");
                  }}
                  className="inline-flex items-center gap-1 text-navy-500 hover:text-navy-800 dark:text-navy-400 dark:hover:text-navy-100"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Change number
                </button>

                {resendIn > 0 ? (
                  <span className="text-navy-400 dark:text-navy-500">
                    Resend in {resendIn}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => requestCode()}
                    disabled={loading}
                    className="font-medium text-green-700 hover:text-green-800 dark:text-green-400"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
        New school?{" "}
        <a href="/get-started" className="font-medium text-green-700 dark:text-green-400">
          Set up NEYO
        </a>
      </p>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setDemoModalOpen(true)}
          disabled={demoLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-navy-200 bg-white px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-warm-50 disabled:opacity-60 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-200"
        >
          {demoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-green-600" />}
          {demoLoading ? "Setting up your demo school…" : "Try NEYO with a demo school"}
        </button>
        <p className="mt-1.5 text-xs text-navy-400">No sign-up. Real Kenyan data. Expires in 24 hours.</p>
      </div>
      <p className="mt-2 text-center text-xs text-navy-400 dark:text-navy-600">
        Trouble signing in? Ask your school administrator to confirm your number.
      </p>

      {/* Interactive Demo Lead Capture Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-navy-800 dark:bg-navy-900/90">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3 dark:border-navy-800">
              <div className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
                <Sparkles className="h-5 w-5 text-green-600" />
                <span>Live Interactive Demo Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-full p-1 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-xs text-navy-600 dark:text-navy-300">
              Experience NEYO with pre-seeded Kenyan high school data (<strong className="text-green-700 dark:text-green-400">Karibu High School</strong>). Enter your verified contact details to approve and launch instantly.
            </p>
            <form onSubmit={submitAndLaunchDemo} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="demoPhone">Kenyan Phone Number *</Label>
                <Input
                  id="demoPhone"
                  placeholder="+254 712 345 678"
                  value={demoPhone}
                  onChange={(e) => setDemoPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="demoEmail">Work or School Email *</Label>
                <Input
                  id="demoEmail"
                  type="email"
                  placeholder="principal@karibuhigh.ac.ke"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="demoName">Your Full Name (Optional)</Label>
                <Input
                  id="demoName"
                  placeholder="e.g. Kamau Wanjiru"
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                />
              </div>
              <div className="pt-2 flex gap-2 justify-end">
                <Button type="button" variant="secondary" onClick={() => setDemoModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={demoLoading} className="rounded-full bg-green-700 hover:bg-green-800 text-white">
                  {demoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Verify & Launch Demo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password with SMS OTP Modal */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white/95 p-6 shadow-2xl backdrop-blur-xl dark:border-navy-800 dark:bg-navy-900/95">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3 dark:border-navy-800">
              <div className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>Recover Password via SMS OTP</span>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="rounded-full p-1 text-navy-400 hover:bg-navy-100 dark:hover:bg-navy-800"
              >
                ✕
              </button>
            </div>
            {!recoverySent ? (
              <form onSubmit={handleSendRecoveryOtp} className="mt-4 space-y-4">
                <p className="text-xs text-navy-600 dark:text-navy-300">
                  Enter your registered phone number (`+254 7XX...`) or custom NEYO email (`kamau@karibuhigh.neyo.co.ke`). We will dispatch a secure 6-digit verification code to your phone right away.
                </p>
                <div>
                  <Label htmlFor="forgotInput">Account Phone or Email *</Label>
                  <Input
                    id="forgotInput"
                    placeholder="0712 345 678 or kamau@karibuhigh.neyo.co.ke"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="secondary" onClick={() => setForgotOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={recoveryLoading || !forgotInput.trim()} className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                    {recoveryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailCheck className="mr-2 h-4 w-4" />}
                    Send SMS Recovery Code
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyRecoveryOtp} className="mt-4 space-y-4">
                <p className="text-xs text-green-700 dark:text-green-400 bg-green-50/60 p-3 rounded-2xl border border-green-200 dark:bg-green-950/20 dark:border-green-900/40 font-semibold">
                  ✓ 6-digit recovery code dispatched via SMS. Enter it below along with your new password.
                </p>
                <div>
                  <Label htmlFor="forgotOtp">6-Digit SMS OTP Code *</Label>
                  <Input
                    id="forgotOtp"
                    placeholder="e.g. 849201"
                    maxLength={6}
                    className="font-mono text-center text-lg tracking-widest"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="forgotNewPwd">Create New Secure Password *</Label>
                  <PasswordInput
                    id="forgotNewPwd"
                    placeholder="At least 8 characters"
                    value={forgotNewPwd}
                    onChange={(e) => setForgotNewPwd(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="secondary" onClick={() => setRecoverySent(false)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={recoveryLoading || forgotOtp.length < 6 || forgotNewPwd.length < 8} className="rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold">
                    {recoveryLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                    Verify Code & Reset Password
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* First Login Activation / Set Initial Password Modal */}
      {firstLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-4 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white p-6 shadow-2xl dark:border-green-800 dark:bg-navy-900">
            <div className="flex items-center gap-2 border-b border-navy-100 pb-3 font-bold text-navy-950 dark:border-navy-800 dark:text-white">
              <ShieldCheck className="h-6 w-6 text-green-600 animate-pulse" />
              <span>First Login Activation (`Set Password`)</span>
            </div>
            <p className="mt-3 text-xs text-navy-600 dark:text-navy-300">
              Welcome to NEYO! Since this is your initial login with your curated NEYO account, please set a secure password (`at least 8 characters`) to protect your school records going forward.
            </p>
            <form onSubmit={handleSetInitialPassword} className="mt-4 space-y-4">
              <div>
                <Label htmlFor="firstLoginPwd">Create Your Secure Password *</Label>
                <PasswordInput
                  id="firstLoginPwd"
                  placeholder="At least 8 characters"
                  value={firstLoginPwd}
                  onChange={(e) => setFirstLoginPwd(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={firstLoginLoading || firstLoginPwd.length < 8} className="w-full rounded-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5">
                  {firstLoginLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Activate Account & Enter School OS
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
