"use client";

import Link from "next/link";
import { ArrowLeft, Bike, CalendarDays, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceRecord = {
  id: string;
  booking_code: string;
  bike_brand: string;
  bike_model: string;
  engine_cc: string;
  service_type: string;
  problem_description: string;
  created_at: string;
};

export default function ServiceHistoryPage() {
  const router = useRouter();

  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
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
          "id, booking_code, bike_brand, bike_model, engine_cc, service_type, problem_description, created_at"
        )
        .eq("customer_id", user.id)
        .eq("status", "service_completed")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setRecords(data || []);
      setLoading(false);
    };

    loadHistory();
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
          <p className="step-label">SERVICE HISTORY</p>

          <h1>Completed services</h1>

          <p>
            Your completed Bike OK diagnosis and service records will appear
            here.
          </p>
        </div>

        {loading && (
          <div className="bookings-message">
            Loading service history...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && records.length === 0 && (
          <div className="empty-bookings">
            <Wrench size={42} />

            <h2>No completed services yet</h2>

            <p>
              Completed services will automatically appear here.
            </p>

            <Link href="/book" className="primary-btn">
              Book a Diagnosis
            </Link>
          </div>
        )}

        {!loading && records.length > 0 && (
          <div className="service-history-list">
            {records.map((record) => (
              <div className="service-history-card" key={record.id}>
                <div className="service-history-header">
                  <div>
                    <span className="booking-code">
                      {record.booking_code}
                    </span>

                    <h2>
                      {record.bike_brand} {record.bike_model}
                    </h2>
                  </div>

                  <span className="completed-badge">
                    Completed
                  </span>
                </div>

                <div className="service-history-details">
                  <span>
                    <Bike size={16} />
                    {record.engine_cc}
                  </span>

                  <span>
                    <Wrench size={16} />
                    {record.service_type === "doorstep"
                      ? "Doorstep Service"
                      : "Visit a Mechanic"}
                  </span>

                  <span>
                    <CalendarDays size={16} />
                    {new Date(
                      record.created_at
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p>{record.problem_description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}