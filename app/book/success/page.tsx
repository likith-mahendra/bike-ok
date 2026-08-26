"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Home,
  Wrench,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "BOK-PENDING";

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/dashboard" className="back-link">
          <Home size={20} />
          Dashboard
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container success-container">
        <div className="success-icon">
          <CheckCircle2 size={70} />
        </div>

        <p className="step-label">BOOKING SUBMITTED</p>

        <h1>Your diagnosis request is submitted!</h1>

        <p className="success-description">
          Your request has been created successfully and will be shared with
          suitable mechanics.
        </p>

        <div className="booking-id-card">
          <span>YOUR BOOKING ID</span>
          <strong>{bookingId}</strong>
        </div>

        <div className="next-steps-card">
          <h2>What happens next?</h2>

          <div className="next-step">
            <ClipboardList size={22} />

            <div>
              <strong>1. Request shared</strong>

              <span>
                Suitable mechanics receive your diagnosis request.
              </span>
            </div>
          </div>

          <div className="next-step">
            <Wrench size={22} />

            <div>
              <strong>2. Mechanic confirms</strong>

              <span>
                The first eligible mechanic to confirm the request gets the
                booking.
              </span>
            </div>
          </div>

          <div className="next-step">
            <CheckCircle2 size={22} />

            <div>
              <strong>3. Appointment scheduled</strong>

              <span>
                You will receive the mechanic and appointment details.
              </span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/dashboard" className="primary-btn">
            <Home size={20} />
            Go to Dashboard
          </Link>

          <Link href="/dashboard/bookings" className="secondary-btn">
            <ClipboardList size={20} />
            View My Bookings
          </Link>
        </div>
      </section>
    </main>
  );
}