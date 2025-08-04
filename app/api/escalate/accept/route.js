import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId } = await req.json();

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Update request status
    escalationRequest.status = "accepted";
    escalationRequest.respondedAt = new Date();
    await escalationRequest.save();

    // Notify user: show modal with [Chat] [Video]
    if (global._io) {
      global._io.to(escalationRequest.userId._id.toString()).emit("doctor-accepted", {
        requestId: escalationRequest._id,
        doctorId: escalationRequest.doctorId._id,
        doctorName: escalationRequest.doctorId.name,
        options: ["chat", "video"],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}