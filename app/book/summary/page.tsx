"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  ClipboardList,
  Home,
  MapPin,
  Wrench,
} from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function BookingSummaryPage() {
  const searchParams = useSearchParams();

  const service = searchParams.get("service") || "";
  const brand = searchParams.get("brand") || "";
  const model = searchParams.get("model") || "";
  const engineCC = searchParams.get("engineCC") || "";
  const description = searchParams.get("description") || "";
  const urgency = searchParams.get("urgency") || "";

  const serviceName =
    service === "doorstep" ? "Doorstep Service" : "Visit a Mechanic";

  const urgencyName =
    urgency === "low"
      ? "Not Urgent"
      : urgency === "medium"
        ? "Moderate"
        : "Urgent";

  const handleConfirmBooking = () => {
    alert(
      "Booking confirmed successfully! Your request will be shared with available mechanics."
    );
  };

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/book/problem-details" className="back-link">
          <ArrowLeft size={20} />
          Back
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container">
        <div className="booking-intro">
          <p className="step-label">STEP 4 OF 4</p>

          <h1>Review your booking</h1>

          <p>
            Please check your information before submitting your diagnosis
            request.
          </p>
        </div>

        <div className="summary-card">
          {/* SERVICE DETAILS */}
          <div className="summary-section">
            <div className="summary-heading">
              {service === "doorstep" ? (
                <Home size={22} />
              ) : (
                <MapPin size={22} />
              )}

              <h2>Service Type</h2>
            </div>

            <div className="summary-row">
              <span>Selected service</span>
              <strong>{serviceName}</strong>
            </div>
          </div>

          {/* BIKE DETAILS */}
          <div className="summary-section">
            <div className="summary-heading">
              <Bike size={22} />
              <h2>Bike Details</h2>
            </div>

            <div className="summary-row">
              <span>Brand</span>
              <strong>{brand}</strong>
            </div>

            <div className="summary-row">
              <span>Model</span>
              <strong>{model}</strong>
            </div>

            <div className="summary-row">
              <span>Engine Capacity</span>
              <strong>{engineCC}</strong>
            </div>
          </div>

          {/* PROBLEM DETAILS */}
          <div className="summary-section">
            <div className="summary-heading">
              <ClipboardList size={22} />
              <h2>Problem Details</h2>
            </div>

            <div className="summary-row">
              <span>Urgency</span>
              <strong>{urgencyName}</strong>
            </div>

            <div className="problem-summary">
              <span>Problem Description</span>
              <p>{description}</p>
            </div>
          </div>

          {/* BOOKING STATUS */}
          <div className="summary-info">
            <Wrench size={22} />

            <div>
              <h3>What happens next?</h3>

              <p>
                Your booking will be shared with suitable mechanics. Once a
                mechanic accepts your request, you will receive the appointment
                details.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="confirm-booking-btn"
          onClick={handleConfirmBooking}
        >
          <CheckCircle2 size={20} />
          Confirm Booking
        </button>
      </section>
    </main>
  );
}