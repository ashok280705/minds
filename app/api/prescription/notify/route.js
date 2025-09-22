import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId, prescriptionId } = await request.json();
    
    // Trigger Genie notification
    const notification = {
      userId,
      prescriptionId,
      message: "Your prescription has been received from the doctor",
      timestamp: new Date().toISOString()
    };

    // Store notification for Genie to pick up
    global.prescriptionNotifications = global.prescriptionNotifications || [];
    global.prescriptionNotifications.push(notification);

    return NextResponse.json({
      success: true,
      message: "Notification sent to Genie"
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}