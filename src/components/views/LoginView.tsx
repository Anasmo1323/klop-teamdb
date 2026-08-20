import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Hexagon } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { HARDCODED_ADMINS } from "../../App";

interface LoginViewProps {
  extraAdmins?: string[];
}

export function LoginView({ extraAdmins = [] }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const UNIFIED_PASSWORD = "!@#klop05072026"; // Unified password requested by user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailLower = email.trim().toLowerCase();

    // 1. Check if the user is authorized to even attempt login
    const isAuthorized = HARDCODED_ADMINS.includes(emailLower) || extraAdmins.includes(emailLower);

    if (!isAuthorized) {
      setError("Access Denied. You do not have permission to access this database.");
      setIsLoading(false);
      return;
    }

    // 2. Enforce unified password for hardcoded admins
    if (HARDCODED_ADMINS.includes(emailLower) && password !== UNIFIED_PASSWORD) {
      setError("Invalid credentials.");
      setIsLoading(false);
      return;
    }

    try {
      // Try to sign in normally
      await signInWithEmailAndPassword(auth, emailLower, password);
    } catch (err: any) {
      console.error("Login attempt failed:", err.code);

      // 3. If user doesn't exist in Firebase Auth yet, auto-register them seamlessly
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") {
        try {
          console.log("Auto-registering authorized user...");
          await createUserWithEmailAndPassword(auth, emailLower, password);
        } catch (createErr: any) {
          console.error("Auto-registration failed:", createErr);
          setError("Failed to create your account. Please contact IT.");
        }
      } else {
        setError("Authentication failed. Make sure Firebase Auth is enabled.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <Hexagon className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to KLOP</h1>
        <p className="text-sm text-gray-500 mb-6">
          This is a restricted database. Please sign in with your authorized email.
        </p>

        {error && (
          <div className="w-full p-3 mb-6 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@technowave-eg.com"
              className="h-12 rounded-xl border-gray-200"
              required
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 rounded-xl border-gray-200"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-sm mt-4"
          >
            {isLoading ? "Authenticating..." : "Secure Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-[11px] text-gray-400 max-w-[280px]">
          If you need access, please contact one of the system administrators to invite you.
        </div>
      </div>
    </div>
  );
}
