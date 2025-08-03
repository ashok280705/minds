import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { io } from "@/lib/socket"; // 👈 your Socket.IO server instance
import twilio from "twilio";

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req) {
  try {
    await dbConnect();

    const { userEmail } = await req.json();

    // 1️⃣ Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2️⃣ Find doctor: specialist first, fallback to any
    let doctor = await Doctor.findOne({ isOnline: true, specialty: "mental-health" });
    if (!doctor) {
      doctor = await Doctor.findOne({ isOnline: true });
    }

    if (!doctor) {
      return NextResponse.json({ error: "No doctor available" }, { status: 503 });
    }

    // 3️⃣ Mark doctor busy
    doctor.isOnline = false;
    await doctor.save();

    // 4️⃣ Notify doctor via Socket.IO — emit event so doctor portal shows: Accept / Reject
    io.to(doctor.socketId).emit("escalation-request", {
      doctorId: doctor._id,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
    });

    // 5️⃣ Send WhatsApp to emergency contact
    if (user.emergencyNumber) {
      const msg = `🚨 EMERGENCY: ${user.name} may be experiencing a mental health crisis. Please check on them immediately.`;
      await twilioClient.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:+91${user.emergencyNumber}`,
        body: msg,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Doctor notified. Awaiting acceptance.",
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}