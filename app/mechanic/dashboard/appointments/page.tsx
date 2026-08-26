"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Clock3,
  MapPin,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function MechanicAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/mechanic/login");
      return;
    }

    const { data: profile, error: profileError } = await supabase
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
      .eq("mechanic_id", user.id)
      .in("status", [
        "confirmed",
        "scheduled",
        "diagnosing",
        "diagnosis_complete",
        "service_pending",
        "service_approved",
        "service_in_progress",
      ])
      .order("created_at", { ascending: false });

      console.log("Logged-in mechanic UID:", user.id);
console.log("Appointments data:", data);
console.log("Appointments error:", error);

    if (error) {
      console.error("Appointments fetch error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setAppointments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const getStatusLabel = (status: string) => {
    return status.replaceAll("_", " ");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not scheduled";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      undefined,
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (time: string | null) => {
    if (!time) return "Not scheduled";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link
          href="/mechanic/dashboard"
          className="back-link"
        >
          <ArrowLeft size={20} />
          Mechanic Dashboard
        </Link>

        <Link href="/" className="dashboard-logo">
          <Wrench size={28} />
          Bike OK Mechanic
        </Link>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">MY APPOINTMENTS</p>

          <h1>Customer Appointments</h1>

          <p>
            View bookings assigned to you and manage their
            appointment and diagnosis progress.
          </p>
        </div>

        <div className="appointments-toolbar">
          <div>
            <span>Assigned bookings</span>
            <strong>{appointments.length}</strong>
          </div>

          <button
            type="button"
            className="refresh-requests-btn"
            onClick={loadAppointments}
            disabled={loading}
          >
            <RefreshCw size={18} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="bookings-message">
            Loading your appointments...
          </div>
        )}

        {!loading &&
          !errorMessage &&
          appointments.length === 0 && (
            <div className="empty-bookings">
              <CalendarDays size={44} />

              <h2>No assigned bookings</h2>

              <p>
                Bookings you confirm will appear here.
              </p>

              <Link
                href="/mechanic/dashboard/requests"
                className="primary-btn"
              >
                View Available Requests
              </Link>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          appointments.length > 0 && (
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div
                  className="appointment-card"
                  key={appointment.id}
                >
                  <div className="appointment-card-header">
                    <div>
                      <span className="booking-code">
                        {appointment.booking_code}
                      </span>

                      <h2>
                        {appointment.bike_brand}{" "}
                        {appointment.bike_model}
                      </h2>
                    </div>

                    <span
                      className={`appointment-status status-${appointment.status}`}
                    >
                      {getStatusLabel(
                        appointment.status
                      )}
                    </span>
                  </div>

                  <div className="appointment-details-grid">
                    <div>
                      <span>Service</span>

                      <strong>
                        {appointment.service_type ===
                        "doorstep"
                          ? "Doorstep Service"
                          : "Visit a Mechanic"}
                      </strong>
                    </div>

                    <div>
                      <span>Engine</span>

                      <strong>
                        {appointment.engine_cc}
                      </strong>
                    </div>

                    <div>
                      <span>Urgency</span>

                      <strong className="capitalize-text">
                        {appointment.urgency}
                      </strong>
                    </div>

                    <div>
                      <span>Appointment</span>

                      <strong>
                        {formatDate(
                          appointment.appointment_date
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="appointment-time-row">
                    <div>
                      <CalendarDays size={18} />
                      <span>
                        {formatDate(
                          appointment.appointment_date
                        )}
                      </span>
                    </div>

                    <div>
                      <Clock3 size={18} />
                      <span>
                        {formatTime(
                          appointment.appointment_time
                        )}
                      </span>
                    </div>

                    <div>
                      <MapPin size={18} />
                      <span>
                        {appointment.service_type ===
                        "doorstep"
                          ? "Customer Location"
                          : "Workshop Visit"}
                      </span>
                    </div>
                  </div>

                  <div className="appointment-problem">
                    <span>Customer Problem</span>

                    <p>
                      {appointment.problem_description}
                    </p>
                  </div>

                  <div className="appointment-actions">
  {appointment.status === "confirmed" ? (
    <Link
      href={`/mechanic/dashboard/confirmed/${appointment.id}`}
      className="appointment-view-btn"
    >
      <CalendarDays size={18} />
      Schedule Appointment
    </Link>
  ) : (
    <Link
      href={`/mechanic/dashboard/appointments/${appointment.id}`}
      className="appointment-view-btn"
    >
      <CalendarDays size={18} />
      Open Appointment
    </Link>
  )}
</div>
                </div>
              ))}
            </div>
          )}
      </section>
    </main>
  );
}