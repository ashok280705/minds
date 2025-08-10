import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";
import Room from "@/models/Room";

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

    console.log(`✅ Doctor accepted escalation request: ${escalationRequest._id}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}