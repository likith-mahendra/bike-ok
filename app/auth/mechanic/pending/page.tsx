"use client";

import Link from "next/link";
import { CheckCircle2, Home, Clock, Wrench } from "lucide-react";

export default function MechanicPendingPage() {
  return (
    <main className="booking-page">
      <section className="booking-container success-container">
        <div className="success-icon">
          <CheckCircle2 size={70} />
        </div>

        <p className="step-label">REGISTRATION SUBMITTED</p>

        <h1>Mechanic profile created</h1>

        <p className="success-description">
          Your mechanic registration has been submitted successfully.
          Your profile must be reviewed and approved before you can receive
          customer booking requests.
        </p>

        <div className="next-steps-card">
          <h2>What happens next?</h2>

          <div className="next-step">
            <Clock size={22} />
            <div>
              <strong>1. Profile review</strong>
              <span>
                Your workshop and mechanic details will be reviewed by Bike OK.
              </span>
            </div>
          </div>

          <div className="next-step">
            <Wrench size={22} />
            <div>
              <strong>2. Approval</strong>
              <span>
                Once approved, you can log in and become available for bookings.
              </span>
            </div>
          </div>

          <div className="next-step">
            <CheckCircle2 size={22} />
            <div>
              <strong>3. Start receiving requests</strong>
              <span>
                Turn your availability on and compete for nearby bookings.
              </span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/" className="primary-btn">
            <Home size={20} />
            Back to Home
          </Link>

          <Link href="/auth/mechanic/login" className="secondary-btn">
            Mechanic Login
          </Link>
        </div>
      </section>
    </main>
  );
}