import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Doctor from "@/models/Doctor";

export async function POST(req) {
  try {
    await dbConnect();
    const { doctorId, isOnline } = await req.json();

    await Doctor.updateOne(
      { _id: doctorId },
      { $set: { isOnline } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Doctor online status error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}