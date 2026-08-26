"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BookingRequest = {
  id: string;
  booking_code: string;
  service_type: string;
  bike_brand: string;
  bike_model: string;
  engine_cc: string;
  problem_description: string;
  urgency: string;
  customer_latitude: number;
  customer_longitude: number;
  created_at: string;
  distance_km: number;
};

export default function MechanicRequestsPage() {
  const router = useRouter();

  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadRequests = async () => {
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
      .select("role, verification_status, available")
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

    if (!profile.available) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc(
      "get_available_booking_requests"
    );

    if (error) {
      console.error("Request loading error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();

    const interval = setInterval(() => {
      loadRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleConfirm = async (bookingId: string) => {
    setConfirmingId(bookingId);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase.rpc("confirm_booking", {
      p_booking_id: bookingId,
    });

    if (error) {
      if (
        error.message.includes("BOOKING_ALREADY_CLAIMED") ||
        error.message.includes("MECHANIC_NOT_ELIGIBLE")
      ) {
        setErrorMessage(
          "This booking has already been confirmed by another mechanic."
        );
      } else {
        setErrorMessage(error.message);
      }

      setConfirmingId(null);
      await loadRequests();
      return;
    }

    setSuccessMessage(
      `Booking ${data.booking_code} has been confirmed successfully.`
    );

    setRequests((current) =>
      current.filter((request) => request.id !== bookingId)
    );

    setConfirmingId(null);

    setTimeout(() => {
      router.push("/mechanic/dashboard");
    }, 1200);
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/mechanic/dashboard" className="back-link">
          <ArrowLeft size={20} />
          Mechanic Dashboard
        </Link>

        <div className="dashboard-logo">
          <Wrench size={28} />
          Bike OK Mechanic
        </div>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">AVAILABLE REQUESTS</p>

          <h1>Nearby diagnosis requests</h1>

          <p>
            Confirm a request to claim it. The first mechanic to successfully
            confirm the booking gets the assignment.
          </p>
        </div>

        <div className="requests-toolbar">
          <div>
            <strong>{requests.length}</strong>{" "}
            {requests.length === 1
              ? "request available"
              : "requests available"}
          </div>

          <button
            type="button"
            className="refresh-requests-btn"
            onClick={loadRequests}
            disabled={loading}
          >
            <RefreshCw size={18} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {successMessage && (
          <div className="mechanic-success-message">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        {loading && (
          <div className="bookings-message">
            Loading nearby requests...
          </div>
        )}

        {!loading && !errorMessage && requests.length === 0 && (
          <div className="empty-bookings">
            <MapPin size={42} />

            <h2>No requests right now</h2>

            <p>
              Stay online. New diagnosis requests within your service radius
              will appear here.
            </p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="requests-list">
            {requests.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-card-header">
                  <div>
                    <span className="booking-code">
                      {request.booking_code}
                    </span>

                    <h2>
                      {request.bike_brand} {request.bike_model}
                    </h2>
                  </div>

                  <span className="distance-badge">
                    <MapPin size={14} />
                    {Number(request.distance_km).toFixed(1)} km
                  </span>
                </div>

                <div className="request-details-grid">
                  <div>
                    <span>Service</span>
                    <strong>
                      {request.service_type === "doorstep"
                        ? "Doorstep Service"
                        : "Visit a Mechanic"}
                    </strong>
                  </div>

                  <div>
                    <span>Engine</span>
                    <strong>{request.engine_cc}</strong>
                  </div>

                  <div>
                    <span>Urgency</span>
                    <strong>{request.urgency}</strong>
                  </div>

                  <div>
                    <span>Requested</span>
                    <strong>
                      {new Date(
                        request.created_at
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                  </div>
                </div>

                <div className="request-problem">
                  <span>Problem</span>
                  <p>{request.problem_description}</p>
                </div>

                <button
                  type="button"
                  className="confirm-request-btn"
                  onClick={() => handleConfirm(request.id)}
                  disabled={confirmingId === request.id}
                >
                  <CheckCircle2 size={20} />
                  {confirmingId === request.id
                    ? "Confirming..."
                    : "Confirm Booking"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}