import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import RoutineDoctorRequest from "@/models/RoutineDoctorRequest";

export async function GET() {
  try {
    await dbConnect();
    
    const requests = await RoutineDoctorRequest.find({ 
      status: "pending" 
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests
    });

  } catch (error) {
    console.error("Error fetching routine doctor requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}