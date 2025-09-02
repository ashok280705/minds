// lib/escalationService.js
import EscalationRequest from '../models/EscalationRequest.js';
import dbConnect from './dbConnect.js';

class EscalationService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async triggerEscalation(userId, riskAnalysis, userMessage) {
    try {
      // Ensure database connection
      await dbConnect();
      
      console.log('🚨 Creating escalation record for userId:', userId);
      
      // Create escalation record
      const escalation = new EscalationRequest({
        userId,
        riskLevel: riskAnalysis.risk_level,
        confidence: riskAnalysis.confidence,
        triggerMessage: userMessage,
        status: 'pending',
        timestamp: new Date()
      });
      
      await escalation.save();
      console.log('✅ Escalation record created:', escalation._id);

      // Notify via Socket.IO
      if (this.io) {
        console.log('📡 Emitting escalation_triggered event');
        this.io.emit('escalation_triggered', {
          userId,
          escalationId: escalation._id,
          riskLevel: riskAnalysis.risk_level,
          confidence: riskAnalysis.confidence
        });
      } else {
        console.error('⚠️ Socket.IO not available in escalation service');
      }

      // Notify emergency contact
      await this._notifyEmergencyContact(userId, escalation);
      
      // Connect available doctor
      await this._connectDoctor(userId, escalation);
      
      console.log('✅ Escalation process completed for userId:', userId);

      return escalation;
    } catch (error) {
      console.error('Escalation failed:', error);
      throw error;
    }
  }

  async _notifyEmergencyContact(userId, escalation) {
    try {
      // WhatsApp notification via Twilio
      if (process.env.TWILIO_SID && process.env.TWILIO_AUTH && process.env.TWILIO_WHATSAPP_NUMBER) {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
        
        // Get user details for emergency contact
        const { default: User } = await import('../models/User.js');
        const user = await User.findById(userId);
        
        if (user?.emergencyNumber) {
          await client.messages.create({
            from: process.env.TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:+91${user.emergencyNumber}`,
            body: `🚨 URGENT: ${user.name} may need immediate mental health support. Please check on them now. Risk Level: ${escalation.riskLevel}`
          });
          console.log(`Emergency contact notified for user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Emergency contact notification failed:', error);
    }
  }

  async _connectDoctor(userId, escalation) {
    try {
      // Direct doctor connection without API call to avoid circular dependency
      const { default: Doctor } = await import('../models/Doctor.js');
      const { default: User } = await import('../models/User.js');
      
      const user = await User.findById(userId);
      if (!user) {
        console.error('User not found for doctor connection');
        return;
      }

      // Find available doctor
      let doctor = await Doctor.findOne({ isOnline: true, specialty: "psyco" });
      if (!doctor) doctor = await Doctor.findOne({ isOnline: true });
      
      if (!doctor) {
        console.log('No online doctors available for escalation');
        // Notify via Socket.IO that no doctors are available
        if (this.io) {
          this.io.to(userId.toString()).emit("no-doctors-available", {
            message: "No doctors are currently available. Please try again later or contact emergency services if this is urgent."
          });
        }
        return;
      }

      // Update escalation with doctor info
      escalation.doctorId = doctor._id;
      escalation.status = 'pending';
      await escalation.save();

      // Notify doctor via Socket.IO
      if (this.io) {
        const doctorRoom = `doctor_${doctor._id.toString()}`;
        console.log(`📡 Sending escalation request to doctor room ${doctorRoom}`);
        this.io.to(doctorRoom).emit("escalation-request", {
          requestId: escalation._id,
          doctorId: doctor._id,
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          riskLevel: escalation.riskLevel
        });
        
        console.log(`Doctor connection initiated for user ${userId} with doctor ${doctor.name}`);
      } else {
        console.error('Socket.IO not available for doctor notification');
      }
    } catch (error) {
      console.error('Doctor connection error:', error);
    }
  }
}

export default new EscalationService();