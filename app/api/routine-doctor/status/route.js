import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const latestRequest = await RoutineDoctorRequest.findOne({ 
      userId,
      status: { $in: ["pending", "accepted"] }
    }).sort({ createdAt: -1 });

    if (!latestRequest) {
      return NextResponse.json({
        status: "no_request",
        message: "No active request found"
      });
    }

    return NextResponse.json({
      status: latestRequest.status,
      connectionType: latestRequest.connectionType,
      roomId: latestRequest.roomId,
      doctorId: latestRequest.doctorId,
      requestId: latestRequest._id
    });

  } catch (error) {
    console.error("Error checking routine doctor status:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}