"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Home, MapPin } from "lucide-react";
import { useState } from "react";

export default function BookPage() {
  const [serviceType, setServiceType] = useState("");

  const handleContinue = () => {
    if (!serviceType) return;

    window.location.href = `/book/bike-details?service=${serviceType}`;
  };

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container">
        <div className="booking-intro">
          <p className="step-label">STEP 1 OF 4</p>

          <h1>How would you like to get your bike diagnosed?</h1>

          <p>
            Choose the service option that is most convenient for you.
          </p>
        </div>

        <div className="service-options">
          <button
            type="button"
            className={`service-option ${
              serviceType === "doorstep" ? "selected" : ""
            }`}
            onClick={() => setServiceType("doorstep")}
          >
            <div className="service-icon">
              <Home size={32} />
            </div>

            <div className="service-text">
              <h2>Doorstep Service</h2>
              <p>
                A mechanic will visit your location to diagnose your bike.
              </p>
            </div>

            {serviceType === "doorstep" && (
              <CheckCircle2 className="selected-icon" size={28} />
            )}
          </button>

          <button
            type="button"
            className={`service-option ${
              serviceType === "store" ? "selected" : ""
            }`}
            onClick={() => setServiceType("store")}
          >
            <div className="service-icon">
              <MapPin size={32} />
            </div>

            <div className="service-text">
              <h2>Visit a Mechanic</h2>
              <p>
                Take your bike to a nearby mechanic for diagnosis.
              </p>
            </div>

            {serviceType === "store" && (
              <CheckCircle2 className="selected-icon" size={28} />
            )}
          </button>
        </div>

        <button
          type="button"
          className="continue-btn"
          disabled={!serviceType}
          onClick={handleContinue}
        >
          Continue
        </button>
      </section>
    </main>
  );
}