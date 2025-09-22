import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();
    
    // Get prescriptions with pharmacy requests
    const prescriptions = await mongoose.connection.db.collection('dr_prescriptions')
      .find({ pharmacyRequested: true })
      .sort({ requestedAt: -1 })
      .toArray();
    
    // If no prescriptions found, create a sample for testing
    if (prescriptions.length === 0) {
      const samplePrescription = {
        _id: new mongoose.Types.ObjectId(),
        patientName: 'John Doe',
        doctorName: 'Dr. Smith',
        pharmacyRequested: true,
        requestedAt: new Date(),
        createdAt: new Date(),
        medicines: [
          {
            name: 'Paracetamol 500mg',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: '5 days',
            quantity: '10 tablets'
          },
          {
            name: 'Amoxicillin 250mg',
            dosage: '250mg',
            frequency: 'Three times daily',
            duration: '7 days',
            quantity: '21 capsules'
          }
        ],
        instructions: 'Take after meals'
      };
      prescriptions.push(samplePrescription);
    }

    return NextResponse.json({
      success: true,
      prescriptions
    });

  } catch (error) {
    console.error("Error fetching requested medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch requested medicines" },
      { status: 500 }
    );
  }
}