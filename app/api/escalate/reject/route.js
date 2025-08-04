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
    escalationRequest.status = "rejected";
    escalationRequest.respondedAt = new Date();
    await escalationRequest.save();

    // Make doctor available again
    await Doctor.updateOne(
      { _id: escalationRequest.doctorId._id }, 
      { $set: { isOnline: true } }
    );

    // Find another doctor: specialist first, fallback to any
    let nextDoctor = await Doctor.findOne({ 
      isOnline: true, 
      specialty: "psyco",
      _id: { $ne: escalationRequest.doctorId._id }
    });
    
    if (!nextDoctor) {
      nextDoctor = await Doctor.findOne({ 
        isOnline: true,
        _id: { $ne: escalationRequest.doctorId._id }
      });
    }

    if (nextDoctor) {
      // Create new escalation request
      const newRequest = await EscalationRequest.create({
        userId: escalationRequest.userId._id,
        doctorId: nextDoctor._id,
      });

      // Mark next doctor busy and notify them
      await Doctor.updateOne(
        { _id: nextDoctor._id }, 
        { $set: { isOnline: false } }
      );

      if (global._io) {
        global._io.to(nextDoctor._id.toString()).emit("escalation-request", {
          requestId: newRequest._id,
          doctorId: nextDoctor._id,
          userId: escalationRequest.userId._id,
          userName: escalationRequest.userId.name,
          userEmail: escalationRequest.userId.email,
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "Request sent to another doctor" 
      });
    } else {
      // No doctors available, notify user
      if (global._io) {
        global._io.to(escalationRequest.userId._id.toString()).emit("no-doctors-available", {
          message: "No doctors are currently available. Please try again later or contact emergency services if this is urgent."
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: "No other doctors available" 
      });
    }

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}