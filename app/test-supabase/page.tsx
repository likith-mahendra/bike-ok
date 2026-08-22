"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [result, setResult] = useState("Testing...");

  useEffect(() => {
    const test = async () => {
      const bookingCode = `BOK-TEST-${Date.now()}`;

      const { error } = await supabase
        .from("bookings")
        .insert({
          booking_code: bookingCode,
          service_type: "doorstep",
          bike_brand: "Honda",
          bike_model: "Test Bike",
          engine_cc: "125 CC",
          problem_description: "Browser insert test",
          urgency: "low",
          status: "pending",
        });

      if (error) {
        console.error("Browser insert error:", error);

        setResult(
          `FAILED

message: ${error.message}
code: ${error.code}
details: ${error.details}
hint: ${error.hint}`
        );

        return;
      }

      setResult(
        `SUCCESS

The browser successfully inserted a booking into Supabase.

Booking code: ${bookingCode}`
      );
    };

    test();
  }, []);

  return (
    <main
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        whiteSpace: "pre-wrap",
      }}
    >
      <h1>Bike OK — Supabase Browser Insert Test</h1>
      <p>{result}</p>
    </main>
  );
}
