import { NextResponse } from 'next/server';

// Store escalations in memory for now
let escalations = [];

export async function POST(request) {
  try {
    const { userId, symptoms, severity, riskLevel, timestamp } = await request.json();
    
    const escalationId = Date.now().toString();
    const escalation = {
      id: escalationId,
      userId: userId || 'anonymous',
      patientName: 'Crisis Patient',
      symptoms: symptoms || 'Crisis situation detected',
      severity: severity || 'critical',
      riskLevel: riskLevel || 'high',
      timestamp: timestamp || new Date().toISOString(),
      status: 'pending'
    };
    
    // Add to escalations list
    escalations.push(escalation);
    
    console.log('🚨 NEW ESCALATION ADDED:', escalation);
    
    // Notify doctor dashboard via Socket.IO
    try {
      if (global._io) {
        global._io.emit('emergency-request', {
          type: 'crisis',
          escalation,
          message: '🚨 EMERGENCY: New crisis patient needs immediate attention',
          timestamp: new Date().toISOString()
        });
        console.log('📡 Emergency notification sent to doctors');
      }
    } catch (socketError) {
      console.error('Socket notification failed:', socketError);
    }
    
    return NextResponse.json({
      success: true,
      escalationId,
      message: 'CRISIS REQUEST SENT TO DOCTOR DASHBOARD',
      redirectTo: '/doctor',
      status: 'pending'
    });
  } catch (error) {
    console.error('Escalation error:', error);
    return NextResponse.json({ error: 'Failed to escalate to doctor' }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      escalations,
      totalRequests: escalations.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch escalations' }, { status: 500 });
  }
}