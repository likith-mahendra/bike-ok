"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bike, Wrench } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MechanicSignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [workshopName, setWorkshopName] = useState("");
  const [workshopAddress, setWorkshopAddress] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [serviceRadius, setServiceRadius] = useState("10");

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

    const years = Number(experienceYears);

    if (!Number.isInteger(years) || years < 0) {
      setErrorMessage("Enter a valid number of experience years.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "mechanic",
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("Account could not be created.");
      setIsLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: "mechanic",
        workshop_name: workshopName,
        workshop_address: workshopAddress,
        experience_years: years,
        specialization,
        service_radius_km: Number(serviceRadius),
        verification_status: "pending",
        available: false,
        latitude: null,
        longitude: null,
        last_seen: null,
      });

    if (profileError) {
      console.error("Mechanic profile error:", profileError);

      setErrorMessage(
        "Account was created, but the mechanic profile could not be saved."
      );

      setIsLoading(false);
      return;
    }

    router.push("/auth/mechanic/pending");
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
          Mechanic Registration
        </div>

        <h1>Join Bike OK as a mechanic</h1>

        <p className="auth-description">
          Create your mechanic account. Your profile will be reviewed before
          you become available for customer bookings.
        </p>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>

            <input
              id="fullName"
              type="text"
              required
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number</label>

            <input
              id="phone"
              type="tel"
              required
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          <div className="form-group">
            <label htmlFor="workshopName">Workshop name</label>

            <input
              id="workshopName"
              type="text"
              required
              placeholder="Example: ABC Bike Works"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workshopAddress">Workshop address</label>

            <textarea
              id="workshopAddress"
              rows={3}
              required
              placeholder="Full workshop address"
              value={workshopAddress}
              onChange={(e) => setWorkshopAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="experienceYears">Experience (years)</label>

            <input
              id="experienceYears"
              type="number"
              min="0"
              required
              placeholder="Example: 5"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>

            <select
              id="specialization"
              required
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">Select specialization</option>
              <option value="General Bike Service">
                General Bike Service
              </option>
              <option value="Engine & Transmission">
                Engine & Transmission
              </option>
              <option value="Electrical & Diagnostics">
                Electrical & Diagnostics
              </option>
              <option value="Brakes & Suspension">
                Brakes & Suspension
              </option>
              <option value="Tyres & Wheels">Tyres & Wheels</option>
              <option value="Performance & Tuning">
                Performance & Tuning
              </option>
              <option value="Multi-Brand Specialist">
                Multi-Brand Specialist
              </option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="serviceRadius">
              Service radius (km)
            </label>

            <select
              id="serviceRadius"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(e.target.value)}
            >
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="15">15 km</option>
              <option value="20">20 km</option>
              <option value="25">25 km</option>
            </select>
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
            {isLoading ? "Creating mechanic account..." : "Register as Mechanic"}
          </button>
        </form>

        <p className="auth-switch">
          Already have a mechanic account?{" "}
          <Link href="/auth/mechanic/login">Mechanic Login</Link>
        </p>
      </div>
    </main>
  );
}