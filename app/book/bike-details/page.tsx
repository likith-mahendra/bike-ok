"use client";

import Link from "next/link";
import { ArrowLeft, Bike } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function BikeDetailsPage() {
  const searchParams = useSearchParams();
  const serviceType = searchParams.get("service");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [engineCC, setEngineCC] = useState("");

  const isFormComplete = brand && model && engineCC;

  const handleContinue = () => {
    if (!isFormComplete) return;

    const params = new URLSearchParams({
      service: serviceType || "",
      brand,
      model,
      engineCC,
    });

    window.location.href = `/book/problem-details?${params.toString()}`;
  };

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/book" className="back-link">
          <ArrowLeft size={20} />
          Back
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container">
        <div className="booking-intro">
          <p className="step-label">STEP 2 OF 4</p>

          <h1>Tell us about your bike</h1>

          <p>
            Enter your bike details so we can help match you with the right
            mechanic.
          </p>
        </div>

        <div className="bike-details-card">
          <div className="bike-details-icon">
            <Bike size={36} />
          </div>

          <div className="form-group">
            <label htmlFor="brand">Bike Brand</label>

            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Select your bike brand</option>
              <option value="Honda">Honda</option>
              <option value="Hero">Hero</option>
              <option value="TVS">TVS</option>
              <option value="Bajaj">Bajaj</option>
              <option value="Royal Enfield">Royal Enfield</option>
              <option value="Yamaha">Yamaha</option>
              <option value="Suzuki">Suzuki</option>
              <option value="KTM">KTM</option>
              <option value="Kawasaki">Kawasaki</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="model">Bike Model</label>

            <input
              id="model"
              type="text"
              placeholder="Example: Apache RTR 160"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="engineCC">Engine CC</label>

            <select
              id="engineCC"
              value={engineCC}
              onChange={(e) => setEngineCC(e.target.value)}
            >
              <option value="">Select engine capacity</option>
              <option value="Below 100 CC">Below 100 CC</option>
              <option value="100-125 CC">100-125 CC</option>
              <option value="126-160 CC">126-160 CC</option>
              <option value="161-200 CC">161-200 CC</option>
              <option value="201-350 CC">201-350 CC</option>
              <option value="351-500 CC">351-500 CC</option>
              <option value="Above 500 CC">Above 500 CC</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="continue-btn"
          disabled={!isFormComplete}
          onClick={handleContinue}
        >
          Continue
        </button>
      </section>
    </main>
  );
}