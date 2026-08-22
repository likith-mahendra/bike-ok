"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Bike, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "customer",
        },
      },
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

        <h1>Create your account</h1>

        <p className="auth-description">
          Create your Bike OK customer account to manage your bike bookings.
        </p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full name</label>

            <input
              id="name"
              type="text"
              required
              placeholder="M Likith Mahendra"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>

            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              "Creating account..."
            ) : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/auth/login">Login</Link>
        </p>
      </div>
    </main>
  );
}