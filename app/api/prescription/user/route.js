import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DrPrescription from "@/models/DrPrescription";

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

    console.log('Fetching prescriptions for userId:', userId);
    
    const prescriptions = await DrPrescription.find({ 
      patientId: userId 
    }).sort({ createdAt: -1 });
    
    console.log('Found prescriptions:', prescriptions.length);
    console.log('Prescriptions data:', prescriptions);

    return NextResponse.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}