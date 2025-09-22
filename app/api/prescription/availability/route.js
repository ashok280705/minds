import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectDB();
    
    const { prescriptionId, status, pharmacistId } = await request.json();
    
    if (!prescriptionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update prescription with availability status
    const result = await mongoose.connection.db.collection('dr_prescriptions').updateOne(
      { _id: new mongoose.Types.ObjectId(prescriptionId) },
      { 
        $set: {
          availability: status,
          pharmacistId,
          availabilityUpdatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Prescription marked as ${status}`
    });

  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}