"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
};

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      setErrorMessage("");

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
          "id, booking_code, service_type, bike_brand, bike_model, engine_cc, problem_description, urgency, status, created_at"
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Bookings fetch error:", error);
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setBookings(data || []);
      setLoading(false);
    };

    loadBookings();
  }, [router]);

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/dashboard" className="back-link">
          <ArrowLeft size={20} />
          Dashboard
        </Link>

        <Link href="/" className="dashboard-logo">
          <Bike size={28} />
          Bike OK
        </Link>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">MY BOOKINGS</p>

          <h1>Your bookings</h1>

          <p>
            View your diagnosis requests and track their current status.
          </p>
        </div>

        {loading && (
          <div className="bookings-message">
            Loading your bookings...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && bookings.length === 0 && (
          <div className="empty-bookings">
            <CalendarDays size={42} />

            <h2>No bookings yet</h2>

            <p>
              You have not created a bike diagnosis request yet.
            </p>

            <Link href="/book" className="primary-btn">
              Book a Diagnosis
            </Link>
          </div>
        )}

        {!loading && !errorMessage && bookings.length > 0 && (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <Link
                href={`/dashboard/bookings/${booking.id}`}
                className="booking-item booking-item-link"
                key={booking.id}
              >
                <div className="booking-item-top">
                  <div>
                    <span className="booking-code">
                      {booking.booking_code}
                    </span>

                    <h2>
                      {booking.bike_brand} {booking.bike_model}
                    </h2>
                  </div>

                  <span
                    className={`booking-status status-${booking.status}`}
                  >
                    {booking.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="booking-item-details">
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
                    <CalendarDays size={16} />

                    {new Date(
                      booking.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p className="booking-problem">
                  {booking.problem_description}
                </p>

                <div className="booking-view-details">
                  View Booking Details →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}