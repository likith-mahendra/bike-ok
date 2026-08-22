"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bike, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="auth-logo">
          <Bike size={34} />
          <span>Bike OK</span>
        </div>

        <h1>Welcome back</h1>

        <p className="auth-description">
          Login to manage your bikes, bookings and diagnosis requests.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>

            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <div className="auth-error">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            className="confirm-booking-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link href="/auth/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}