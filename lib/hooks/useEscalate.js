"use client";

import { useState } from "react";

export function useEscalate() {
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState(null);

  const escalate = async (userEmail) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail }),
      });

      if (!res.ok) throw new Error("Failed to escalate");

      const data = await res.json();
      setDoctor(data.doctor);

      return { doctor: data.doctor, requestId: data.requestId };
    } catch (err) {
      console.error(err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { escalate, loading, doctor, error };
}