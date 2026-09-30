import { useState } from "react";
import { Input } from "../ui/input";
import { Hexagon, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../../firebase";
import { HARDCODED_ADMINS, ALLOWED_USERS } from "../../App";

const UNIFIED_PASSWORD = "!@#klop05072026";

interface LoginViewProps {
  extraAdmins?: string[];
  onRequirePasswordChange?: () => void;
  onPasswordChanged?: () => void;
}

type AuthStep = "login" | "change-password" | "done";

export function LoginView({ extraAdmins = [], onRequirePasswordChange, onPasswordChanged }: LoginViewProps) {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // ── Step 1: Sign in with unified password ─────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailLower = email.trim().toLowerCase();
    const isAuthorized =
      ALLOWED_USERS.includes(emailLower) || extraAdmins.includes(emailLower);

    if (!isAuthorized) {
      setError("Access denied. Your email is not authorized for this system.");
      setIsLoading(false);
      return;
    }

    try {
      if (password === UNIFIED_PASSWORD) {
        onRequirePasswordChange?.();
      }
      // Try to sign in with whatever password they typed
      await signInWithEmailAndPassword(auth, emailLower, password);

      // If they logged in with the UNIFIED password → force change
      if (password === UNIFIED_PASSWORD) {
        setStep("change-password");
      }
      // else they already have a personal password → onAuthStateChanged in App handles the rest
    } catch (err: any) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found"
      ) {
        // First time ever — only allow with unified password
        if (password !== UNIFIED_PASSWORD) {
          setError(
            "First sign-in must use the team password. Ask your admin for it."
          );
          setIsLoading(false);
          return;
        }
        // Auto-register with unified password, then force change
        try {
          if (password === UNIFIED_PASSWORD) {
            onRequirePasswordChange?.();
          }
          await createUserWithEmailAndPassword(auth, emailLower, password);
          setStep("change-password");
        } catch (createErr: any) {
          setError("Could not create your account. Contact IT support.");
        }
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Set personal password ────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword === UNIFIED_PASSWORD) {
      setError("You must choose a different password from the team one.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser!;
      // Re-authenticate first (user is logged in with unified pwd)
      const credential = EmailAuthProvider.credential(user.email!, UNIFIED_PASSWORD);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setStep("done");
      onPasswordChanged?.();
      // App's onAuthStateChanged will now detect the signed-in user
    } catch (err: any) {
      setError("Could not update password: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Shared card wrapper ───────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "var(--background)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 8px 32px rgba(15,31,61,0.12)",
          border: "1px solid var(--border)",
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 52,
            height: 52,
            background: "var(--primary)",
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
            boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
          }}
        >
          <Hexagon style={{ width: 28, height: 28, color: "#fff" }} />
        </div>

        {step === "login" && (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-heading)", marginBottom: 6 }}>
              Welcome to KLOP
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28, maxWidth: 300 }}>
              Restricted access. Sign in with your authorized company email.
            </p>

            {error && <ErrorBanner message={error} />}

            <form onSubmit={handleLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@technowave-eg.com"
                style={{ height: 44, borderRadius: 10, border: "1px solid var(--border)", fontSize: 14 }}
                required
              />
              <div style={{ position: "relative" }}>
                <Input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ height: 44, borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, paddingRight: 40 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-blue"
                style={{ height: 44, borderRadius: 10, fontSize: 15, fontWeight: 600, width: "100%", marginTop: 4, justifyContent: "center" }}
              >
                {isLoading ? "Signing in…" : (
                  <><ArrowRight size={17} style={{ marginRight: 6 }} />Secure Sign In</>
                )}
              </button>
            </form>

            <p style={{ marginTop: 24, fontSize: 11, color: "var(--text-disabled)", maxWidth: 280 }}>
              Need access? Contact a system administrator.
            </p>
          </>
        )}

        {step === "change-password" && (
          <>
            <div
              style={{
                width: 48, height: 48, borderRadius: 12,
                background: "var(--primary-light)", color: "var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Lock size={22} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-heading)", marginBottom: 6 }}>
              Set your personal password
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24, maxWidth: 300 }}>
              You're using the team password. Choose a private one — at least 8 characters.
            </p>

            {error && <ErrorBanner message={error} />}

            <form onSubmit={handleChangePassword} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  style={{ height: 44, borderRadius: 10, border: "1px solid var(--border)", fontSize: 14, paddingRight: 40 }}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{ height: 44, borderRadius: 10, border: "1px solid var(--border)", fontSize: 14 }}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className="btn-blue"
                style={{ height: 44, borderRadius: 10, fontSize: 15, fontWeight: 600, width: "100%", marginTop: 4, justifyContent: "center" }}
              >
                {isLoading ? "Saving…" : "Set my password"}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <CheckCircle2 size={52} style={{ color: "var(--success)", marginBottom: 16 }} strokeWidth={1.5} />
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-heading)", marginBottom: 8 }}>
              Password set!
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              You're all set. The app will open momentarily…
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      style={{
        width: "100%",
        padding: "10px 14px",
        marginBottom: 16,
        background: "var(--danger-light)",
        border: "1px solid rgba(220,38,38,0.2)",
        color: "var(--danger)",
        fontSize: 13,
        borderRadius: 10,
        textAlign: "left",
      }}
    >
      {message}
    </div>
  );
}
