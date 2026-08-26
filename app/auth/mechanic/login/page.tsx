"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bike, LogIn, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MechanicLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("Unable to sign in.");
      setIsLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, verification_status")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();

      setErrorMessage(
        "Your mechanic profile could not be loaded. Please contact Bike OK support."
      );

      setIsLoading(false);
      return;
    }

    if (profile.role !== "mechanic") {
      await supabase.auth.signOut();

      setErrorMessage(
        "This account is not registered as a mechanic account."
      );

      setIsLoading(false);
      return;
    }

    if (profile.verification_status === "pending") {
      router.push("/auth/mechanic/pending");
      return;
    }

    if (profile.verification_status === "rejected") {
      router.push("/auth/mechanic/rejected");
      return;
    }

    if (profile.verification_status === "approved") {
      router.push("/mechanic/dashboard");
      return;
    }

    await supabase.auth.signOut();

    setErrorMessage(
      "Your mechanic account has an invalid verification status."
    );

    setIsLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-card mechanic-auth-card">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="auth-logo">
          <Bike size={34} />
          <span>Bike OK</span>
        </div>

        <div className="mechanic-badge">
          <Wrench size={16} />
          Mechanic Login
        </div>

        <h1>Welcome back</h1>

        <p className="auth-description">
          Sign in to manage your mechanic profile and receive nearby booking
          requests.
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
                Mechanic Login
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have a mechanic account?{" "}
          <Link href="/auth/mechanic/signup">
            Register as a Mechanic
          </Link>
        </p>
      </div>
    </main>
  );
}