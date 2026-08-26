"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ConfirmedBooking = {
  id: string;
  booking_code: string;
  service_type: string;
  bike_brand: string;
  bike_model: string;
  engine_cc: string;
  problem_description: string;
  urgency: string;
  created_at: string;
  confirmed_at: string | null;
};

export default function ConfirmedBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadBookings = async () => {
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
        "id, booking_code, service_type, bike_brand, bike_model, engine_cc, problem_description, urgency, created_at, confirmed_at"
      )
      .eq("mechanic_id", user.id)
      .eq("status", "confirmed")
      .order("confirmed_at", { ascending: false });

    if (error) {
      console.error("Confirmed bookings error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/mechanic/dashboard" className="back-link">
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

          <h1>Confirmed bookings</h1>

          <p>
            These are the customer requests you have successfully claimed.
            Schedule an appointment for each one.
          </p>
        </div>

        {errorMessage && (
          <div className="booking-error">{errorMessage}</div>
        )}

        {loading && (
          <div className="bookings-message">
            Loading your confirmed bookings...
          </div>
        )}

        {!loading && !errorMessage && bookings.length === 0 && (
          <div className="empty-bookings">
            <CheckCircle2 size={42} />

            <h2>No confirmed bookings</h2>

            <p>
              When you confirm an available request, it will appear here.
            </p>

            <Link
              href="/mechanic/dashboard/requests"
              className="primary-btn"
            >
              View Available Requests
            </Link>
          </div>
        )}

        {!loading && !errorMessage && bookings.length > 0 && (
          <div className="confirmed-bookings-list">
            {bookings.map((booking) => (
              <div
                className="confirmed-booking-card"
                key={booking.id}
              >
                <div className="confirmed-booking-header">
                  <div>
                    <span className="booking-code">
                      {booking.booking_code}
                    </span>

                    <h2>
                      {booking.bike_brand} {booking.bike_model}
                    </h2>
                  </div>

                  <span className="confirmed-badge">
                    Confirmed
                  </span>
                </div>

                <div className="confirmed-booking-details">
                  <span>
                    <MapPin size={16} />

                    {booking.service_type === "doorstep"
                      ? "Doorstep Service"
                      : "Visit a Mechanic"}
                  </span>

                  <span>
                    <Bike size={16} />
                    {booking.engine_cc}
                  </span>

                  <span>
                    <Clock3 size={16} />
                    {booking.urgency}
                  </span>
                </div>

                <div className="confirmed-problem">
                  <span>Problem</span>

                  <p>{booking.problem_description}</p>
                </div>

                <div className="confirmed-time">
                  <CalendarDays size={18} />

                  <span>
                    Confirmed{" "}
                    {booking.confirmed_at
                      ? new Date(
                          booking.confirmed_at
                        ).toLocaleString()
                      : ""}
                  </span>
                </div>

                <Link
                  href={`/mechanic/dashboard/confirmed/${booking.id}`}
                  className="schedule-btn"
                >
                  <CalendarDays size={19} />
                  Schedule Appointment
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}