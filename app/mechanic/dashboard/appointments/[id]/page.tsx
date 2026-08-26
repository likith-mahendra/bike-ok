"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Clock3,
  MapPin,
  PlayCircle,
  Wrench,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Appointment = {
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
  confirmed_at: string | null;
  assigned_at: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
};

export default function MechanicAppointmentDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const bookingId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadAppointment = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/mechanic/login");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role, verification_status")
          .eq("id", user.id)
          .single();

      if (
        profileError ||
        profile?.role !== "mechanic" ||
        profile?.verification_status !== "approved"
      ) {
        router.push("/auth/mechanic/login");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_code, service_type, bike_brand, bike_model, engine_cc, problem_description, urgency, status, created_at, confirmed_at, assigned_at, appointment_date, appointment_time"
        )
        .eq("id", bookingId)
        .eq("mechanic_id", user.id)
        .single();

      if (error || !data) {
        console.error(
          "Appointment details error:",
          error
        );

        setErrorMessage(
          "This appointment could not be found."
        );

        setLoading(false);
        return;
      }

      setAppointment(data);
      setLoading(false);
    };

    loadAppointment();
  }, [bookingId, router]);

  if (loading) {
    return (
      <main className="dashboard-loading">
        <p>Loading appointment...</p>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-container">
          <div className="booking-error">
            {errorMessage || "Appointment not found."}
          </div>

          <Link
            href="/mechanic/dashboard/appointments"
            className="primary-btn"
          >
            <ArrowLeft size={18} />
            Back to Appointments
          </Link>
        </section>
      </main>
    );
  }

  const statusLabel = appointment.status.replaceAll(
    "_",
    " "
  );

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link
          href="/mechanic/dashboard/appointments"
          className="back-link"
        >
          <ArrowLeft size={20} />
          My Appointments
        </Link>

        <Link href="/" className="dashboard-logo">
          <Wrench size={28} />
          Bike OK Mechanic
        </Link>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">
            APPOINTMENT DETAILS
          </p>

          <h1>{appointment.booking_code}</h1>

          <p>
            Review the customer booking and prepare for the
            diagnosis.
          </p>
        </div>

        <div className="appointment-status-banner">
          <div className="appointment-status-icon">
            <CalendarDays size={24} />
          </div>

          <div>
            <span>Current Status</span>
            <strong>{statusLabel}</strong>
          </div>
        </div>

        <div className="appointment-detail-grid">
          <div className="appointment-large-card">
            <div className="appointment-card-heading">
              <Bike size={22} />
              <h2>Bike Details</h2>
            </div>

            <div className="appointment-detail-row">
              <span>Brand</span>
              <strong>
                {appointment.bike_brand}
              </strong>
            </div>

            <div className="appointment-detail-row">
              <span>Model</span>
              <strong>
                {appointment.bike_model}
              </strong>
            </div>

            <div className="appointment-detail-row">
              <span>Engine</span>
              <strong>
                {appointment.engine_cc}
              </strong>
            </div>
          </div>

          <div className="appointment-large-card">
            <div className="appointment-card-heading">
              {appointment.service_type === "doorstep" ? (
                <HomeIcon />
              ) : (
                <MapPin size={22} />
              )}

              <h2>Service</h2>
            </div>

            <div className="appointment-detail-row">
              <span>Type</span>

              <strong>
                {appointment.service_type === "doorstep"
                  ? "Doorstep Service"
                  : "Visit a Mechanic"}
              </strong>
            </div>

            <div className="appointment-detail-row">
              <span>Urgency</span>

              <strong className="capitalize-text">
                {appointment.urgency}
              </strong>
            </div>
          </div>
        </div>

        <div className="appointment-large-card full-width-card">
          <div className="appointment-card-heading">
            <Wrench size={22} />
            <h2>Customer Problem</h2>
          </div>

          <p className="appointment-description">
            {appointment.problem_description}
          </p>
        </div>

        <div className="appointment-large-card full-width-card">
          <div className="appointment-card-heading">
            <CalendarDays size={22} />
            <h2>Scheduled Appointment</h2>
          </div>

          <div className="appointment-schedule-grid">
            <div>
              <span>Date</span>

              <strong>
                {appointment.appointment_date
                  ? new Date(
                      `${appointment.appointment_date}T00:00:00`
                    ).toLocaleDateString(undefined, {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Not scheduled"}
              </strong>
            </div>

            <div>
              <span>Time</span>

              <strong>
                {appointment.appointment_time
                  ? new Date(
                      `1970-01-01T${appointment.appointment_time}`
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not scheduled"}
              </strong>
            </div>

            <div>
              <span>Service Location</span>

              <strong>
                {appointment.service_type === "doorstep"
                  ? "Customer Location"
                  : "Workshop"}
              </strong>
            </div>
          </div>
        </div>

        <div className="appointment-action-card">
          <div>
            <h2>Ready to diagnose?</h2>

            <p>
              Once the appointment begins, you can record the
              customer's problems, causes, severity, notes and
              recommendations.
            </p>
          </div>

          <Link
            href={`/mechanic/dashboard/diagnosis/${appointment.id}`}
            className="appointment-start-btn"
          >
            <PlayCircle size={20} />
            Start Diagnosis
          </Link>
        </div>
      </section>
    </main>
  );
}

function HomeIcon() {
  return <MapPin size={22} />;
}