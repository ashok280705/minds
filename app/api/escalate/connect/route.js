import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import Room from "@/models/Room";
import EscalationRequest from "@/models/EscalationRequest";

export async function POST(req) {
  try {
    await dbConnect();

    const { requestId, connectionType } = await req.json();

    if (!["chat", "video"].includes(connectionType)) {
      return NextResponse.json({ error: "Invalid connection type" }, { status: 400 });
    }

    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('userId')
      .populate('doctorId');

    if (!escalationRequest || escalationRequest.status !== "accepted") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const roomId = `room-${Date.now()}-${escalationRequest.userId._id}`;

    // Create room
    const room = await Room.create({
      roomId,
      userId: escalationRequest.userId._id,
      doctorId: escalationRequest.doctorId._id,
      type: connectionType,
    });

    // Notify both doctor and user to join the room
    if (global._io) {
      global._io.to(escalationRequest.doctorId._id.toString()).emit("start-session", {
        roomId,
        connectionType,
        patientName: escalationRequest.userId.name,
        patientId: escalationRequest.userId._id,
      });

      global._io.to(escalationRequest.userId._id.toString()).emit("start-session", {
        roomId,
        connectionType,
        doctorName: escalationRequest.doctorId.name,
        doctorId: escalationRequest.doctorId._id,
      });
    }

    return NextResponse.json({ 
      success: true, 
      roomId,
      connectionType,
      redirectUrl: `/${connectionType}-room/${roomId}`
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}