import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import { io } from "@/lib/socket";

export async function POST(req) {
  try {
    await dbConnect();

    const { doctorId, userId } = await req.json();

    const doctor = await Doctor.findById(doctorId);
    const user = await User.findById(userId);

    if (!doctor || !user) {
      return NextResponse.json({ error: "Doctor or User not found" }, { status: 404 });
    }

    // Notify user: show modal with [Chat] [Video]
    io.to(user.socketId).emit("doctor-accepted", {
      doctorName: doctor.name,
      options: ["chat", "video"],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}