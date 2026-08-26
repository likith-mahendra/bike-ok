"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  CheckCircle2,
  Home,
  MapPin,
  User,
  Wrench,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  booking_code: string;
  service_type: string;
  bike_brand: string;
  bike_model: string;
  engine_cc: string;
  problem_description: string;
  urgency: string;
  status: string;
  created_at: string;
  mechanic_id: string | null;
  confirmed_at: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  assigned_at: string | null;
};

type MechanicProfile = {
  full_name: string | null;
  workshop_name: string | null;
  experience_years: number | null;
  specialization: string | null;
};

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const bookingId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [mechanic, setMechanic] =
    useState<MechanicProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [mechanicLoading, setMechanicLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mechanicError, setMechanicError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setErrorMessage("Invalid booking ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setMechanicError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_code, service_type, bike_brand, bike_model, engine_cc, problem_description, urgency, status, created_at, mechanic_id, confirmed_at, appointment_date, appointment_time, assigned_at"
        )
        .eq("id", bookingId)
        .eq("customer_id", user.id)
        .single();

      if (error || !data) {
        console.error("Booking details error:", error);

        setErrorMessage(
          "Booking could not be found or you do not have permission to view it."
        );

        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);

      /*
       * Load the assigned mechanic separately.
       *
       * We deliberately use the secure RPC rather than reading
       * another user's profile directly from the profiles table.
       */
      if (data.mechanic_id) {
        setMechanicLoading(true);

        const {
          data: mechanicData,
          error: mechanicRpcError,
        } = await supabase.rpc("get_booking_mechanic", {
          p_booking_id: data.id,
        });

        console.log(
          "Mechanic RPC result:",
          mechanicData,
          mechanicRpcError
        );

        if (mechanicRpcError) {
          setMechanicError(
            `Mechanic details could not be loaded: ${mechanicRpcError.message}`
          );
          setMechanic(null);
        } else if (
          Array.isArray(mechanicData) &&
          mechanicData.length > 0
        ) {
          setMechanic(mechanicData[0]);
          setMechanicError("");
        } else {
          setMechanicError(
            "No mechanic profile was returned for this booking."
          );
          setMechanic(null);
        }

        setMechanicLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, router]);

  if (loading) {
    return (
      <main className="dashboard-loading">
        <p>Loading booking details...</p>
      </main>
    );
  }

  if (!booking) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-container">
          <div className="booking-error">
            {errorMessage || "Booking not found."}
          </div>

          <Link
            href="/dashboard/bookings"
            className="primary-btn"
          >
            <ArrowLeft size={18} />
            Back to My Bookings
          </Link>
        </section>
      </main>
    );
  }

  const statusLabel = booking.status.replaceAll(
    "_",
    " "
  );

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link
          href="/dashboard/bookings"
          className="back-link"
        >
          <ArrowLeft size={20} />
          My Bookings
        </Link>

        <Link href="/" className="dashboard-logo">
          <Bike size={28} />
          Bike OK
        </Link>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">BOOKING DETAILS</p>

          <h1>{booking.booking_code}</h1>

          <p>
            Track your diagnosis request and appointment from here.
          </p>
        </div>

        <div className="booking-status-banner">
          <div className="status-banner-icon">
            <CheckCircle2 size={25} />
          </div>

          <div>
            <span>Current Status</span>
            <strong>{statusLabel}</strong>
          </div>
        </div>

        <div className="booking-details-grid">
          <div className="booking-details-card">
            <div className="booking-details-card-heading">
              <Bike size={22} />
              <h2>Bike Details</h2>
            </div>

            <div className="booking-detail-row">
              <span>Brand</span>
              <strong>{booking.bike_brand}</strong>
            </div>

            <div className="booking-detail-row">
              <span>Model</span>
              <strong>{booking.bike_model}</strong>
            </div>

            <div className="booking-detail-row">
              <span>Engine</span>
              <strong>{booking.engine_cc}</strong>
            </div>
          </div>

          <div className="booking-details-card">
            <div className="booking-details-card-heading">
              {booking.service_type === "doorstep" ? (
                <Home size={22} />
              ) : (
                <MapPin size={22} />
              )}

              <h2>Service</h2>
            </div>

            <div className="booking-detail-row">
              <span>Type</span>

              <strong>
                {booking.service_type === "doorstep"
                  ? "Doorstep Service"
                  : "Visit a Mechanic"}
              </strong>
            </div>

            <div className="booking-detail-row">
              <span>Urgency</span>
              <strong>{booking.urgency}</strong>
            </div>

            <div className="booking-detail-row">
              <span>Created</span>

              <strong>
                {new Date(
                  booking.created_at
                ).toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>

        <div className="booking-details-card full-width-card">
          <div className="booking-details-card-heading">
            <Wrench size={22} />
            <h2>Problem Description</h2>
          </div>

          <p className="booking-detail-description">
            {booking.problem_description}
          </p>
        </div>

        {/* ASSIGNED MECHANIC */}
        <div className="booking-details-card full-width-card">
          <div className="booking-details-card-heading">
            <User size={22} />
            <h2>Assigned Mechanic</h2>
          </div>

          {!booking.mechanic_id && (
            <div className="booking-mechanic-loading">
              A mechanic has not been assigned yet.
            </div>
          )}

          {booking.mechanic_id &&
            mechanicLoading && (
              <div className="booking-mechanic-loading">
                Loading assigned mechanic details...
              </div>
            )}

          {booking.mechanic_id &&
            !mechanicLoading &&
            mechanic && (
              <div className="mechanic-summary">
                <div>
                  <span>Name</span>

                  <strong>
                    {mechanic.full_name ||
                      "Mechanic"}
                  </strong>
                </div>

                <div>
                  <span>Workshop</span>

                  <strong>
                    {mechanic.workshop_name ||
                      "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Experience</span>

                  <strong>
                    {mechanic.experience_years ?? 0} years
                  </strong>
                </div>

                <div>
                  <span>Specialization</span>

                  <strong>
                    {mechanic.specialization ||
                      "General Service"}
                  </strong>
                </div>
              </div>
            )}

          {booking.mechanic_id &&
            !mechanicLoading &&
            !mechanic && (
              <div className="booking-error">
                {mechanicError ||
                  "Mechanic details are currently unavailable."}
              </div>
            )}
        </div>

        {/* APPOINTMENT */}
        {booking.appointment_date && (
          <div className="booking-details-card full-width-card">
            <div className="booking-details-card-heading">
              <CalendarDays size={22} />
              <h2>Appointment</h2>
            </div>

            <div className="appointment-summary">
              <div>
                <span>Date</span>

                <strong>
                  {new Date(
                    `${booking.appointment_date}T00:00:00`
                  ).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </strong>
              </div>

              <div>
                <span>Time</span>

                <strong>
                  {booking.appointment_time
                    ? new Date(
                        `1970-01-01T${booking.appointment_time}`
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "To be confirmed"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE */}
        <div className="booking-timeline">
          <div className="timeline-item active">
            <CheckCircle2 size={20} />

            <div>
              <strong>Booking Created</strong>

              <span>
                {new Date(
                  booking.created_at
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div
            className={`timeline-item ${
              booking.status !== "pending"
                ? "active"
                : ""
            }`}
          >
            <User size={20} />

            <div>
              <strong>Mechanic Confirmation</strong>

              <span>
                {booking.confirmed_at
                  ? new Date(
                      booking.confirmed_at
                    ).toLocaleString()
                  : "Waiting for a mechanic"}
              </span>
            </div>
          </div>

          <div
            className={`timeline-item ${
              booking.appointment_date
                ? "active"
                : ""
            }`}
          >
            <CalendarDays size={20} />

            <div>
              <strong>Appointment</strong>

              <span>
                {booking.appointment_date
                  ? "Appointment scheduled"
                  : "Waiting for appointment"}
              </span>
            </div>
          </div>

          <div className="timeline-item">
            <Wrench size={20} />

            <div>
              <strong>Diagnosis</strong>

              <span>
                {booking.status ===
                  "diagnosing" ||
                booking.status ===
                  "diagnosis_complete" ||
                booking.status ===
                  "service_pending" ||
                booking.status ===
                  "service_approved" ||
                booking.status ===
                  "service_in_progress" ||
                booking.status ===
                  "service_completed"
                  ? "In progress / completed"
                  : "Not started"}
              </span>
            </div>
          </div>

          <div
            className={`timeline-item ${
              booking.status ===
              "service_completed"
                ? "active"
                : ""
            }`}
          >
            <CheckCircle2 size={20} />

            <div>
              <strong>Service Completed</strong>

              <span>
                {booking.status ===
                "service_completed"
                  ? "Completed"
                  : "Not completed"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}