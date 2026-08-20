"use client";

import { Bike, MapPin, Search, Star, Wrench } from "lucide-react";

export default function Home() {
  return (
    <main>
      <nav className="navbar">
        <div className="logo">
          <Bike size={30} />
          <span>Bike OK</span>
        </div>

        <div className="nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#services">Services</a>
          <a href="#mechanics">For Mechanics</a>
        </div>

        <button className="login-btn">Login</button>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="badge">SMART BIKE DIAGNOSIS</p>

          <h1>
            Your Bike Problem.
            <br />
            <span>The Right Diagnosis.</span>
          </h1>

          <p className="hero-description">
            Connect with trusted mechanics, understand your bike problem, and
            get transparent service estimates.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              <Search size={20} />
              Diagnose My Bike
            </button>

            <button className="secondary-btn">
              <MapPin size={20} />
              Find a Mechanic
            </button>
          </div>

          <div className="trust-info">
            <div>
              <Star size={20} fill="currentColor" />
              <span>Trusted Mechanics</span>
            </div>

            <div>
              <Wrench size={20} />
              <span>Transparent Diagnosis</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-icon">
            <Bike size={48} />
          </div>

          <h2>Need Bike Help?</h2>

          <p>
            Tell us what&apos;s wrong with your bike and connect with the right
            mechanic.
          </p>

          <button className="card-btn">Book a Diagnosis →</button>
        </div>
      </section>
    </main>
  );
}