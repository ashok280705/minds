"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DoctorConnectionModal from "./DoctorConnectionModal";
import io from "socket.io-client";

export default function EscalationButton() {
  const { data: session } = useSession();
  const [isEscalating, setIsEscalating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const socketInstance = io();
    setSocket(socketInstance);

    // Register user
    socketInstance.emit("register-user", { userId: session.user.id });

    // Listen for doctor acceptance
    socketInstance.on("doctor-accepted", (data) => {
      setDoctorInfo({ name: data.doctorName });
      setRequestId(data.requestId);
      setShowModal(true);
      setIsEscalating(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  const handleEscalate = async () => {
    if (!session?.user?.email) return;

    setIsEscalating(true);
    try {
      const response = await fetch("/api/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: session.user.email,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Wait for doctor response
        console.log("Escalation request sent, waiting for doctor...");
      } else {
        console.error("Escalation failed:", data.error);
        setIsEscalating(false);
      }
    } catch (error) {
      console.error("Escalation error:", error);
      setIsEscalating(false);
    }
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={handleEscalate}
        disabled={isEscalating}
        className={`px-6 py-3 rounded-lg font-semibold text-white transition duration-200 ${
          isEscalating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-red-500 hover:bg-red-600"
        }`}
      >
        {isEscalating ? "🔄 Finding Doctor..." : "🚨 Escalate to Doctor"}
      </button>

      <DoctorConnectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        doctorName={doctorInfo?.name}
        requestId={requestId}
      />
    </>
  );
}