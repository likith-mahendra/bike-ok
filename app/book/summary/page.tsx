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
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookingSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    const bookingCode = `BOK-${Date.now().toString().slice(-8)}`;

    const { error } = await supabase.from("bookings").insert({
      booking_code: bookingCode,
      service_type: service,
      bike_brand: brand,
      bike_model: model,
      engine_cc: engineCC,
      problem_description: description,
      urgency: urgency,
      status: "pending",
    });

    if (error) {
      console.error("Booking creation error:", error);

      setErrorMessage(
        `Booking failed: ${error.message || JSON.stringify(error)}`
      );

      setIsSubmitting(false);
      return;
    }

    router.push(
      `/book/success?bookingId=${encodeURIComponent(bookingCode)}`
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

          <div className="summary-info">
            <Wrench size={22} />

            <div>
              <h3>What happens next?</h3>

              <p>
                Your booking will be shared with suitable mechanics. Once a
                mechanic accepts your request, you will receive appointment
                details.
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          className="confirm-booking-btn"
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Submitting Booking..."
          ) : (
            <>
              <CheckCircle2 size={20} />
              Confirm Booking
            </>
          )}
        </button>
      </section>
    </main>
  );
}