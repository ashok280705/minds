import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import EscalationRequest from "@/models/EscalationRequest";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const { requestId } = params;
    
    const escalationRequest = await EscalationRequest.findById(requestId)
      .populate('doctorId', 'name');
    
    if (!escalationRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      status: escalationRequest.status,
      doctorId: escalationRequest.doctorId?._id,
      doctorName: escalationRequest.doctorId?.name,
      respondedAt: escalationRequest.respondedAt
    });
    
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}