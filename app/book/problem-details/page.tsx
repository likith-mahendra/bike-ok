"use client";

import Link from "next/link";
import { ArrowLeft, AlertCircle, ClipboardList } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ProblemDetailsPage() {
  const searchParams = useSearchParams();

  const [problemDescription, setProblemDescription] = useState("");
  const [urgency, setUrgency] = useState("");

  const isFormComplete =
    problemDescription.trim().length >= 10 && urgency !== "";

  const handleContinue = () => {
    if (!isFormComplete) return;

    const params = new URLSearchParams({
      service: searchParams.get("service") || "",
      brand: searchParams.get("brand") || "",
      model: searchParams.get("model") || "",
      engineCC: searchParams.get("engineCC") || "",
      description: problemDescription,
      urgency,
    });

    window.location.href = `/book/summary?${params.toString()}`;
  };

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/book" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container">
        <div className="booking-intro">
          <p className="step-label">STEP 3 OF 4</p>

          <h1>What problem are you experiencing?</h1>

          <p>
            Describe the issue in as much detail as possible. This helps the
            mechanic understand your bike before diagnosis.
          </p>
        </div>

        <div className="problem-details-card">
          <div className="problem-details-icon">
            <ClipboardList size={36} />
          </div>

          <div className="form-group">
            <label htmlFor="problemDescription">
              Describe your bike problem
            </label>

            <textarea
              id="problemDescription"
              rows={6}
              placeholder="Example: My bike is making a strange noise when accelerating..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
            />

            <small>
              {problemDescription.length} characters
            </small>
          </div>

          <div className="form-group">
            <label>How urgent is the issue?</label>

            <div className="urgency-options">
              <button
                type="button"
                className={`urgency-option ${
                  urgency === "low" ? "selected" : ""
                }`}
                onClick={() => setUrgency("low")}
              >
                <span className="urgency-title">Not Urgent</span>
                <span>Bike is usable and can wait.</span>
              </button>

              <button
                type="button"
                className={`urgency-option ${
                  urgency === "medium" ? "selected" : ""
                }`}
                onClick={() => setUrgency("medium")}
              >
                <span className="urgency-title">Moderate</span>
                <span>Needs attention soon.</span>
              </button>

              <button
                type="button"
                className={`urgency-option ${
                  urgency === "high" ? "selected" : ""
                }`}
                onClick={() => setUrgency("high")}
              >
                <AlertCircle size={20} />
                <span>
                  <span className="urgency-title">Urgent</span>
                  <span className="urgency-description">
                    Bike may not be safe to ride.
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="continue-btn"
          disabled={!isFormComplete}
          onClick={handleContinue}
        >
          Continue to Summary
        </button>
      </section>
    </main>
  );
}