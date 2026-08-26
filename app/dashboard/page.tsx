"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bike,
  CalendarDays,
  LogOut,
  Plus,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [userName, setUserName] = useState("Customer");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const fullName = user.user_metadata?.full_name;

      setUserName(fullName || "Customer");
      setEmail(user.email || "");
      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <main className="dashboard-loading">
        <p>Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/" className="dashboard-logo">
          <Bike size={28} />
          Bike OK
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
          <p className="step-label">CUSTOMER DASHBOARD</p>

          <h1>Welcome, {userName}</h1>

          <p>
            Manage your bikes, diagnosis requests, and service bookings
            from one place.
          </p>

          <span className="dashboard-email">{email}</span>
        </div>

        <div className="dashboard-actions">
          <Link href="/book" className="dashboard-action-card">
            <div className="dashboard-action-icon">
              <Plus size={28} />
            </div>

            <div>
              <h2>Book a Diagnosis</h2>
              <p>Create a new bike diagnosis request.</p>
            </div>
          </Link>

          <Link
            href="/dashboard/bookings"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              <CalendarDays size={28} />
            </div>

            <div>
              <h2>My Bookings</h2>
              <p>View your diagnosis and service requests.</p>
            </div>
          </Link>

          <Link
            href="/dashboard/bikes"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              <Bike size={28} />
            </div>

            <div>
              <h2>My Bikes</h2>
              <p>Manage your saved bike details.</p>
            </div>
          </Link>

          <Link
            href="/dashboard/service-history"
            className="dashboard-action-card"
          >
            <div className="dashboard-action-icon">
              <Wrench size={28} />
            </div>

            <div>
              <h2>Service History</h2>
              <p>
                View completed diagnosis and service records.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}