"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  Clock3,
  MapPin,
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
  confirmed_at: string | null;
};

export default function AppointmentSchedulerPage() {
  const router = useRouter();
  const params = useParams();

  const bookingId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
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
          "id, booking_code, service_type, bike_brand, bike_model, engine_cc, problem_description, urgency, status, created_at, confirmed_at"
        )
        .eq("id", bookingId)
        .eq("mechanic_id", user.id)
        .eq("status", "confirmed")
        .single();

      if (error || !data) {
        console.error("Confirmed booking error:", error);
        setErrorMessage(
          "This booking could not be found or is no longer available for scheduling."
        );
        setLoading(false);
        return;
      }

      setBooking(data);
      setLoading(false);
    };

    loadBooking();
  }, [bookingId, router]);

  const handleSchedule = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!date || !time) {
      setErrorMessage(
        "Please select both an appointment date and time."
      );
      return;
    }

    setScheduling(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.rpc(
      "schedule_booking",
      {
        p_booking_id: bookingId,
        p_appointment_date: date,
        p_appointment_time: time,
      }
    );

    if (error) {
  console.error("Schedule booking error:", {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  setErrorMessage(
    error.message || "Unable to schedule the appointment."
  );

  setScheduling(false);
  return;
}

    setSuccessMessage(
      "Appointment scheduled successfully."
    );
    setScheduling(false);

    setTimeout(() => {
      router.push("/mechanic/dashboard/confirmed");
    }, 1200);
  };

  if (loading) {
    return (
      <main className="dashboard-loading">
        <p>Loading booking...</p>
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
            href="/mechanic/dashboard/confirmed"
            className="primary-btn"
          >
            <ArrowLeft size={18} />
            Back to My Appointments
          </Link>
        </section>
      </main>
    );
  }

  const today = new Date()
    .toISOString()
    .split("T")[0];

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link
          href="/mechanic/dashboard/confirmed"
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
            SCHEDULE APPOINTMENT
          </p>

          <h1>{booking.booking_code}</h1>

          <p>
            Choose a suitable date and time for the customer
            diagnosis.
          </p>
        </div>

        <div className="appointment-booking-summary">
          <div className="appointment-summary-header">
            <div>
              <span className="booking-code">
                CONFIRMED BOOKING
              </span>

              <h2>
                {booking.bike_brand} {booking.bike_model}
              </h2>
            </div>

            <span className="confirmed-badge">
              Confirmed
            </span>
          </div>

          <div className="appointment-summary-details">
            <span>
              <Bike size={17} />
              {booking.engine_cc}
            </span>

            <span>
              <MapPin size={17} />

              {booking.service_type === "doorstep"
                ? "Doorstep Service"
                : "Visit a Mechanic"}
            </span>

            <span>
              <Clock3 size={17} />
              {booking.urgency}
            </span>
          </div>

          <div className="appointment-problem">
            <span>Customer Problem</span>

            <p>{booking.problem_description}</p>
          </div>
        </div>

        <form
          className="appointment-form-card"
          onSubmit={handleSchedule}
        >
          <div className="appointment-form-heading">
            <CalendarDays size={24} />

            <div>
              <h2>Choose Appointment</h2>

              <p>
                Select the date and time when you can perform
                the diagnosis.
              </p>
            </div>
          </div>

          <div className="appointment-form-fields">
            <div className="form-group">
              <label htmlFor="appointment-date">
                Appointment Date
              </label>

              <input
                id="appointment-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="appointment-time">
                Appointment Time
              </label>

              <input
                id="appointment-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {errorMessage && (
            <div className="booking-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mechanic-success-message">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="schedule-btn"
            disabled={scheduling}
          >
            <CalendarDays size={19} />

            {scheduling
              ? "Scheduling..."
              : "Confirm Appointment"}
          </button>
        </form>
      </section>
    </main>
  );
}