import Link from "next/link";
import { ArrowLeft, Home, Wrench, XCircle } from "lucide-react";

export default function MechanicRejectedPage() {
  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container success-container">
        <div
          className="success-icon"
          style={{
            background: "#fee2e2",
            color: "#dc2626",
          }}
        >
          <XCircle size={70} />
        </div>

        <p className="step-label">VERIFICATION STATUS</p>

        <h1>Mechanic verification not approved</h1>

        <p className="success-description">
          Your mechanic profile has not been approved at this time. Please
          contact Bike OK support for more information.
        </p>

        <div className="next-steps-card">
          <div className="next-step">
            <Wrench size={22} />
            <div>
              <strong>Need help?</strong>
              <span>
                Contact Bike OK support regarding your mechanic application.
              </span>
            </div>
          </div>
        </div>

        <div className="success-actions">
          <Link href="/" className="primary-btn">
            <Home size={20} />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}