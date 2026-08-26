"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  UserCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mechanic = {
  id: string;
  full_name: string | null;
  phone: string | null;
  workshop_name: string | null;
  workshop_address: string | null;
  experience_years: number | null;
  specialization: string | null;
  verification_status: string;
  service_radius_km: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: adminProfile, error: adminError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminError || adminProfile?.role !== "admin") {
      await supabase.auth.signOut();
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, workshop_name, workshop_address, experience_years, specialization, verification_status, service_radius_km"
      )
      .eq("role", "mechanic")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin mechanic fetch error:", error);
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMechanics(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateMechanicStatus = async (
    mechanicId: string,
    status: "approved" | "rejected"
  ) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        available: false,
      })
      .eq("id", mechanicId)
      .eq("role", "mechanic");

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await loadData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/" className="dashboard-logo">
          <ShieldCheck size={28} />
          Bike OK Admin
        </Link>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <section className="dashboard-container">
        <div className="dashboard-welcome">
          <p className="step-label">ADMIN DASHBOARD</p>

          <h1>Mechanic Verification</h1>

          <p>
            Review and verify mechanic registrations before they can receive
            customer booking requests.
          </p>
        </div>

        {loading && (
          <div className="bookings-message">
            Loading pending mechanics...
          </div>
        )}

        {!loading && errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && mechanics.length === 0 && (
          <div className="empty-bookings">
            <CheckCircle2 size={42} />

            <h2>No pending mechanics</h2>

            <p>
              There are currently no mechanic profiles waiting for review.
            </p>
          </div>
        )}

        {!loading && mechanics.length > 0 && (
          <div className="admin-mechanics-list">
            {mechanics.map((mechanic) => (
              <div className="admin-mechanic-card" key={mechanic.id}>
                <div className="admin-mechanic-header">
                  <div>
                    <span className="booking-code">
                      MECHANIC APPLICATION
                    </span>

                    <h2>{mechanic.full_name || "Unnamed Mechanic"}</h2>
                  </div>

                  <span className="booking-status status-pending">
                    Pending
                  </span>
                </div>

                <div className="admin-mechanic-details">
                  <div>
                    <strong>Workshop</strong>
                    <span>{mechanic.workshop_name || "Not provided"}</span>
                  </div>

                  <div>
                    <strong>Phone</strong>
                    <span>{mechanic.phone || "Not provided"}</span>
                  </div>

                  <div>
                    <strong>Experience</strong>
                    <span>
                      {mechanic.experience_years ?? 0} years
                    </span>
                  </div>

                  <div>
                    <strong>Specialization</strong>
                    <span>
                      {mechanic.specialization || "Not provided"}
                    </span>
                  </div>

                  <div>
                    <strong>Service Radius</strong>
                    <span>
                      {mechanic.service_radius_km} km
                    </span>
                  </div>

                  <div>
                    <strong>Workshop Address</strong>
                    <span>
                      {mechanic.workshop_address || "Not provided"}
                    </span>
                  </div>
                </div>

                <div className="admin-mechanic-actions">
                  <button
                    type="button"
                    className="admin-approve-btn"
                    onClick={() =>
                      updateMechanicStatus(mechanic.id, "approved")
                    }
                  >
                    <UserCheck size={18} />
                    Approve
                  </button>

                  <button
                    type="button"
                    className="admin-reject-btn"
                    onClick={() =>
                      updateMechanicStatus(mechanic.id, "rejected")
                    }
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}