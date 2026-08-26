"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Home,
  MapPin,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function BookPage() {
  const router = useRouter();

  const [serviceType, setServiceType] = useState("");
  const [radius, setRadius] = useState("5");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [mechanicCount, setMechanicCount] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/book");
      }
    };

    checkUser();

    const savedLocation = sessionStorage.getItem(
      "bike_ok_customer_location"
    );

    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);

        if (
          typeof parsedLocation.latitude === "number" &&
          typeof parsedLocation.longitude === "number"
        ) {
          setLocation({
            latitude: parsedLocation.latitude,
            longitude: parsedLocation.longitude,
          });
        }

        if (parsedLocation.radius) {
          setRadius(String(parsedLocation.radius));
        }
      } catch {
        sessionStorage.removeItem("bike_ok_customer_location");
      }
    }
  }, [router]);

  const detectLocation = () => {
    setErrorMessage("");
    setLocationMessage("");

    if (!navigator.geolocation) {
      setErrorMessage(
        "Your browser does not support location services."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(newLocation);

        sessionStorage.setItem(
          "bike_ok_customer_location",
          JSON.stringify({
            ...newLocation,
            radius: Number(radius),
          })
        );

        setLocationMessage("Your location has been detected.");
        setLocationLoading(false);
      },
      () => {
        setErrorMessage(
          "Location permission is required to find nearby mechanics."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const findNearbyMechanics = async () => {
    if (!location) {
      setErrorMessage("Please detect your location first.");
      return;
    }

    setErrorMessage("");
    setCountLoading(true);

    const { data, error } = await supabase.rpc(
      "count_nearby_online_mechanics",
      {
        p_latitude: location.latitude,
        p_longitude: location.longitude,
        p_radius_km: Number(radius),
      }
    );

    if (error) {
      console.error("Nearby mechanic count error:", error);

      setErrorMessage(
        "We could not check nearby mechanics. Please try again."
      );

      setMechanicCount(null);
      setCountLoading(false);
      return;
    }

    setMechanicCount(Number(data));

    sessionStorage.setItem(
      "bike_ok_customer_location",
      JSON.stringify({
        ...location,
        radius: Number(radius),
      })
    );

    setCountLoading(false);
  };

  const handleRadiusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newRadius = event.target.value;

    setRadius(newRadius);
    setMechanicCount(null);

    if (location) {
      sessionStorage.setItem(
        "bike_ok_customer_location",
        JSON.stringify({
          ...location,
          radius: Number(newRadius),
        })
      );
    }
  };

  const handleContinue = () => {
    if (!serviceType) return;

    if (!location) {
      setErrorMessage(
        "Please detect your location before continuing."
      );
      return;
    }

    sessionStorage.setItem(
      "bike_ok_customer_location",
      JSON.stringify({
        ...location,
        radius: Number(radius),
      })
    );

    window.location.href = `/book/bike-details?service=${serviceType}`;
  };

  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <div className="booking-logo">BIKE OK</div>
      </header>

      <section className="booking-container">
        <div className="booking-intro">
          <p className="step-label">STEP 1 OF 4</p>

          <h1>How would you like to get your bike diagnosed?</h1>

          <p>
            Choose the service that works best for you, then check nearby
            mechanic availability.
          </p>
        </div>

        <div className="service-options">
          <button
            type="button"
            className={`service-option ${
              serviceType === "doorstep" ? "selected" : ""
            }`}
            onClick={() => setServiceType("doorstep")}
          >
            <div className="service-icon">
              <Home size={32} />
            </div>

            <div className="service-text">
              <h2>Doorstep Service</h2>
              <p>
                A mechanic will visit your location to diagnose your bike.
              </p>
            </div>

            {serviceType === "doorstep" && (
              <CheckCircle2 className="selected-icon" size={28} />
            )}
          </button>

          <button
            type="button"
            className={`service-option ${
              serviceType === "store" ? "selected" : ""
            }`}
            onClick={() => setServiceType("store")}
          >
            <div className="service-icon">
              <MapPin size={32} />
            </div>

            <div className="service-text">
              <h2>Visit a Mechanic</h2>
              <p>
                Find an available mechanic near your location.
              </p>
            </div>

            {serviceType === "store" && (
              <CheckCircle2 className="selected-icon" size={28} />
            )}
          </button>
        </div>

        <div className="location-card">
          <div className="location-card-header">
            <div className="location-icon">
              <Navigation size={24} />
            </div>

            <div>
              <h2>Your Location</h2>
              <p>
                We use your location to find nearby online mechanics.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="location-btn"
            onClick={detectLocation}
            disabled={locationLoading}
          >
            <Navigation size={18} />

            {locationLoading
              ? "Detecting Location..."
              : location
                ? "Update My Location"
                : "Use My Current Location"}
          </button>

          {locationMessage && (
            <div className="location-success">
              {locationMessage}
            </div>
          )}
        </div>

        {location && (
          <div className="mechanic-availability-card">
            <div className="availability-header">
              <div>
                <span className="availability-label">
                  MECHANIC AVAILABILITY
                </span>

                <h2>
                  How many mechanics are nearby?
                </h2>
              </div>

              <RefreshCw
                size={20}
                className={countLoading ? "spinning" : ""}
              />
            </div>

            <div className="radius-selector">
              <label htmlFor="radius">
                Search radius
              </label>

              <select
                id="radius"
                value={radius}
                onChange={handleRadiusChange}
              >
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="15">15 km</option>
                <option value="20">20 km</option>
                <option value="25">25 km</option>
              </select>
            </div>

            <button
              type="button"
              className="check-availability-btn"
              onClick={findNearbyMechanics}
              disabled={countLoading}
            >
              {countLoading
                ? "Checking Availability..."
                : "Check Nearby Mechanics"}
            </button>

            {mechanicCount !== null && (
              <div className="mechanic-count-result">
                <div className="online-indicator">
                  <span />
                </div>

                <div>
                  <strong>
                    {mechanicCount}{" "}
                    {mechanicCount === 1
                      ? "mechanic is"
                      : "mechanics are"}{" "}
                    online
                  </strong>

                  <p>
                    within {radius} km of your location
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <div className="booking-error">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          className="continue-btn"
          disabled={!serviceType || !location}
          onClick={handleContinue}
        >
          Continue
        </button>
      </section>
    </main>
  );
}