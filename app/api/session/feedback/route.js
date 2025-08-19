import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import DoctorSession from "@/models/DoctorSession";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import EscalationRequest from "@/models/EscalationRequest";
import { ObjectId } from 'mongodb';
import Feedback from "@/models/Feedback";

export async function POST(req) {
  try {
    await dbConnect();

    const { sessionId, satisfied, rating, comment, userEmail } = await req.json();
    
    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating is required and must be between 1-5" }, { status: 400 });
    }
    
    console.log('Feedback request:', { sessionId, satisfied, rating, userEmail });

    // Get session info
    const sessionData = await DoctorSession.findById(sessionId).populate('doctorId');
    if (!sessionData) {
      console.log('Session not found:', sessionId);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    
    console.log('Found session:', { id: sessionData._id, doctorId: sessionData.doctorId._id, userId: sessionData.userId });

    // Create feedback record
    const feedback = await Feedback.create({
      userId: sessionData.userId,
      doctorId: sessionData.doctorId._id,
      sessionId,
      satisfied,
      rating,
      comment,
      sessionType: sessionData.sessionType
    });

    // Update session status
    await DoctorSession.findByIdAndUpdate(sessionId, {
      status: 'completed'
    });
    
    console.log('Created feedback:', feedback._id, 'satisfied:', satisfied);

    if (!satisfied) {
      // User not satisfied, try to escalate to another doctor
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Debug: Check all doctors
      const allDoctors = await Doctor.find({});
      const onlineDoctors = await Doctor.find({ isOnline: true });
      console.log('All doctors:', allDoctors.map(d => ({ id: d._id, name: d.name, isOnline: d.isOnline })));
      console.log('Online doctors:', onlineDoctors.map(d => ({ id: d._id, name: d.name, specialty: d.specialty })));
      console.log('Current session doctor:', sessionData.doctorId._id);
      
      // First, try to find a different doctor with psychology specialty
      let doctor = await Doctor.findOne({ 
        isOnline: true, 
        specialty: "psyco",
        _id: { $ne: sessionData.doctorId._id }
      });
      console.log('Found different psyco doctor:', doctor?._id);
      
      // If no psychology specialist available, try any other doctor
      if (!doctor) {
        doctor = await Doctor.findOne({ 
          isOnline: true,
          _id: { $ne: sessionData.doctorId._id }
        });
        console.log('Found different doctor (any specialty):', doctor?._id);
      }
      
      // If still no different doctor available, check if original doctor is back online
      if (!doctor) {
        doctor = await Doctor.findOne({ 
          _id: sessionData.doctorId._id,
          isOnline: true
        });
        console.log('Original doctor online status:', doctor?._id, doctor?.isOnline);
      }

      if (!doctor) {
        // No doctors available at all
        if (global._io) {
          global._io.to(user._id.toString()).emit("no-doctors-available", {
            message: "We apologize for the experience. No doctors are currently available for re-connection. Please try again later or contact emergency services if this is urgent."
          });
        }
        return NextResponse.json({ 
          success: true, 
          message: "Feedback recorded. No doctors available for re-escalation at this time.",
          reEscalated: false
        });
      }

      // Create new escalation request
      const escalationRequest = await EscalationRequest.create({
        userId: user._id,
        doctorId: doctor._id,
        isReEscalation: true,
        previousSessionId: sessionId
      });

      // Don't mark doctor as offline for re-escalation - they should remain available
      console.log('Not marking doctor offline for re-escalation to allow other requests');

      // Check if it's the same doctor
      const isSameDoctor = doctor._id.toString() === sessionData.doctorId._id.toString();
      
      // Notify doctor
      if (global._io) {
        const doctorRoom = `doctor_${doctor._id.toString()}`;
        global._io.to(doctorRoom).emit("escalation-request", {
          requestId: escalationRequest._id,
          doctorId: doctor._id,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          isReEscalation: true,
          isRetry: isSameDoctor,
          previousSessionId: sessionId
        });
        
        // Also notify user about the re-escalation
        const userRoom = `user_${user._id.toString()}`;
        global._io.to(userRoom).emit("re-escalation-started", {
          message: isSameDoctor ? 
            "We understand your concerns. We're giving you another chance with the same doctor..." : 
            "We're connecting you with a different doctor who may better assist you...",
          doctorName: doctor.name,
          isDifferentDoctor: !isSameDoctor
        });
      }

      console.log('Re-escalated to doctor:', doctor._id, doctor.name, isSameDoctor ? '(same doctor - retry)' : '(different doctor)');

      return NextResponse.json({ 
        success: true, 
        message: isSameDoctor ? 
          "We understand your concerns. Connecting you with the same doctor for another session..." : 
          "We're connecting you with a different doctor who may better assist you...",
        reEscalated: true,
        newDoctorName: doctor.name,
        isSameDoctor,
        isDifferentDoctor: !isSameDoctor
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Thank you for your feedback!" 
    });

  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to process feedback" }, { status: 500 });
  }
}