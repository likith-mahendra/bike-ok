"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bike,
  CalendarDays,
  LogOut,
  MapPin,
  Power,
  Settings,
  Wrench,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MechanicProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  workshop_name: string | null;
  workshop_address: string | null;
  experience_years: number | null;
  specialization: string | null;
  verification_status: string;
  available: boolean;
  latitude: number | null;
  longitude: number | null;
  last_seen: string | null;
  service_radius_km: number;
};

export default function MechanicDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MechanicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadMechanic();

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  const loadMechanic = async () => {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/mechanic/login");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, full_name, phone, workshop_name, workshop_address, experience_years, specialization, verification_status, available, latitude, longitude, last_seen, service_radius_km"
      )
      .eq("id", user.id)
      .eq("role", "mechanic")
      .single();

    if (error || !data) {
      await supabase.auth.signOut();
      router.push("/auth/mechanic/login");
      return;
    }

    if (data.verification_status !== "approved") {
      router.push("/auth/mechanic/pending");
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const startHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { data, error } = await supabase.rpc(
            "set_mechanic_availability",
            {
              p_available: true,
              p_latitude: position.coords.latitude,
              p_longitude: position.coords.longitude,
            }
          );

          if (!error && data) {
            setProfile(data);
          }
        },
        () => {
          console.log("Unable to refresh mechanic location.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    }, 30000);
  };

  const updateAvailability = async () => {
    if (!profile) return;

    setIsUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (!profile.available) {
      if (!navigator.geolocation) {
        setErrorMessage(
          "Your browser does not support location services."
        );
        setIsUpdating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { data, error } = await supabase.rpc(
            "set_mechanic_availability",
            {
              p_available: true,
              p_latitude: position.coords.latitude,
              p_longitude: position.coords.longitude,
            }
          );

          if (error) {
            setErrorMessage(error.message);
            setIsUpdating(false);
            return;
          }

          setProfile(data);
          setSuccessMessage(
            "You are now online and visible to nearby customers."
          );
          setIsUpdating(false);

          startHeartbeat();
        },
        () => {
          setErrorMessage(
            "Location permission is required to go online."
          );
          setIsUpdating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    } else {
      const { data, error } = await supabase.rpc(
        "set_mechanic_availability",
        {
          p_available: false,
          p_latitude: null,
          p_longitude: null,
        }
      );

      if (error) {
        setErrorMessage(error.message);
        setIsUpdating(false);
        return;
      }

      setProfile(data);
      setSuccessMessage("You are now offline.");
      setIsUpdating(false);

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }
  };

  const handleLogout = async () => {
    if (profile?.available) {
      await supabase.rpc("set_mechanic_availability", {
        p_available: false,
        p_latitude: null,
        p_longitude: null,
      });
    }

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <main className="dashboard-loading">
        <p>Loading mechanic dashboard...</p>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <Link href="/" className="dashboard-logo">
          <Wrench size={28} />
          Bike OK Mechanic
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
        <div className="mechanic-dashboard-welcome">
          <div>
            <p className="step-label">MECHANIC DASHBOARD</p>

            <h1>
              Welcome, {profile.full_name || "Mechanic"}
            </h1>

            <p>
              Manage your availability and respond to nearby Bike OK
              diagnosis requests.
            </p>
          </div>

          <div
            className={`availability-card ${
              profile.available ? "online" : "offline"
            }`}
          >
            <div className="availability-status">
              <span className="availability-dot" />

              <div>
                <strong>
                  {profile.available ? "ONLINE" : "OFFLINE"}
                </strong>

                <span>
                  {profile.available
                    ? "Visible to nearby customers"
                    : "You are not receiving requests"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="availability-btn"
              onClick={updateAvailability}
              disabled={isUpdating}
            >
              <Power size={18} />

              {isUpdating
                ? "Updating..."
                : profile.available
                  ? "Go Offline"
                  : "Go Online"}
            </button>
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

        <div className="mechanic-info-grid">
          <div className="mechanic-info-card">
            <MapPin size={25} />

            <div>
              <span>Service Radius</span>
              <strong>{profile.service_radius_km} km</strong>
            </div>
          </div>

          <div className="mechanic-info-card">
            <Bike size={25} />

            <div>
              <span>Specialization</span>
              <strong>
                {profile.specialization || "General Service"}
              </strong>
            </div>
          </div>

          <div className="mechanic-info-card">
            <CalendarDays size={25} />

            <div>
              <span>Experience</span>
              <strong>{profile.experience_years ?? 0} years</strong>
            </div>
          </div>

          <div className="mechanic-info-card">
            <Wrench size={25} />

            <div>
              <span>Workshop</span>
              <strong>
                {profile.workshop_name || "Not provided"}
              </strong>
            </div>
          </div>
        </div>

        <div className="mechanic-actions-grid">
          <Link
            href="/mechanic/dashboard/requests"
            className="mechanic-section-card mechanic-section-link"
          >
            <div className="mechanic-section-icon">
              <Wrench size={28} />
            </div>

            <h2>Available Requests</h2>

            <p>
              View nearby customer diagnosis requests and compete to
              confirm them.
            </p>
          </Link>

          
         

         <Link
  href="/mechanic/dashboard/appointments"
  className="mechanic-section-card mechanic-section-link"
>
  <div className="mechanic-section-icon">
    <CalendarDays size={28} />
  </div>

  <h2>My Appointments</h2>

  <p>
    View your scheduled customer appointments and active diagnosis jobs.
  </p>
</Link>

          <div className="mechanic-section-card">
            <div className="mechanic-section-icon">
              <Bike size={28} />
            </div>

            <h2>Active Diagnoses</h2>

            <p>
              Manage diagnosis requests that are currently in progress.
            </p>
          </div>

          <div className="mechanic-section-card">
            <div className="mechanic-section-icon">
              <Settings size={28} />
            </div>

            <h2>Profile & Settings</h2>

            <p>
              Update workshop details, specialization and service radius.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}