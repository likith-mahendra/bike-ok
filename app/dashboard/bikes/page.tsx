"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bike,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type BikeRecord = {
  id: string;
  brand: string;
  model: string;
  engine_cc: string | null;
  registration_number: string | null;
  manufacture_year: number | null;
};

export default function MyBikesPage() {
  const router = useRouter();

  const [bikes, setBikes] = useState<BikeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [engineCC, setEngineCC] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [year, setYear] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadBikes = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("bikes")
      .select(
        "id, brand, model, engine_cc, registration_number, manufacture_year"
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setBikes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBikes();
  }, []);

  const handleAddBike = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { error } = await supabase.from("bikes").insert({
      customer_id: user.id,
      brand,
      model,
      engine_cc: engineCC || null,
      registration_number: registrationNumber || null,
      manufacture_year: year ? Number(year) : null,
    });

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setBrand("");
    setModel("");
    setEngineCC("");
    setRegistrationNumber("");
    setYear("");
    setShowForm(false);
    setSaving(false);

    await loadBikes();
  };

  const handleDelete = async (bikeId: string) => {
    const { error } = await supabase
      .from("bikes")
      .delete()
      .eq("id", bikeId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBikes((current) =>
      current.filter((bike) => bike.id !== bikeId)
    );
  };

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
          <p className="step-label">MY BIKES</p>

          <h1>Your bikes</h1>

          <p>
            Save your bike details so future diagnosis bookings are faster.
          </p>
        </div>

        {errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          className="add-bike-btn"
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus size={18} />
          {showForm ? "Close Form" : "Add Bike"}
        </button>

        {showForm && (
          <form className="bike-form-card" onSubmit={handleAddBike}>
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                id="brand"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Honda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input
                id="model"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Apache RTR 160"
              />
            </div>

            <div className="form-group">
              <label htmlFor="engineCC">Engine CC</label>
              <input
                id="engineCC"
                value={engineCC}
                onChange={(e) => setEngineCC(e.target.value)}
                placeholder="160 CC"
              />
            </div>

            <div className="form-group">
              <label htmlFor="registrationNumber">
                Registration Number
              </label>
              <input
                id="registrationNumber"
                value={registrationNumber}
                onChange={(e) =>
                  setRegistrationNumber(e.target.value)
                }
                placeholder="TS09AB1234"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Manufacture Year</label>
              <input
                id="year"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
              />
            </div>

            <button
              type="submit"
              className="confirm-booking-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Bike"}
            </button>
          </form>
        )}

        {loading && (
          <div className="bookings-message">
            Loading your bikes...
          </div>
        )}

        {!loading && bikes.length === 0 && (
          <div className="empty-bookings">
            <Bike size={42} />

            <h2>No bikes added yet</h2>

            <p>
              Add your bike once and use it for future bookings.
            </p>
          </div>
        )}

        {!loading && bikes.length > 0 && (
          <div className="my-bikes-grid">
            {bikes.map((bike) => (
              <div className="my-bike-card" key={bike.id}>
                <div className="my-bike-icon">
                  <Bike size={30} />
                </div>

                <h2>
                  {bike.brand} {bike.model}
                </h2>

                <div className="my-bike-details">
                  <span>
                    Engine: {bike.engine_cc || "Not specified"}
                  </span>

                  <span>
                    Registration:{" "}
                    {bike.registration_number || "Not specified"}
                  </span>

                  <span>
                    Year:{" "}
                    {bike.manufacture_year || "Not specified"}
                  </span>
                </div>

                <div className="my-bike-actions">
                  <button
                    type="button"
                    className="bike-delete-btn"
                    onClick={() => handleDelete(bike.id)}
                  >
                    <Trash2 size={17} />
                    Delete
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