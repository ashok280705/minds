// Test script for Genie Automated Doctor Connection
// Run with: node test-genie-doctor-connection.js

const testGenieAutomation = async () => {
  console.log('🧞 Testing Genie Automated Doctor Connection...\n');

  const testMessages = [
    'connect me with the doc',
    'I need to talk to a doctor',
    'connect to doctor please',
    'routine checkup needed',
    'medical help required'
  ];

  for (const message of testMessages) {
    console.log(`📝 Testing: "${message}"`);
    
    try {
      const response = await fetch('http://localhost:3000/api/genie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Genie Response: ${data.response}`);
        if (data.action === 'CONNECT_TO_DOCTOR') {
          console.log('🤖 AUTOMATION TRIGGERED!');
          console.log('   Genie will now:');
          console.log('   1. Create routine doctor request automatically');
          console.log('   2. Poll for doctor acceptance');
          console.log('   3. Auto-redirect user to chat room');
          console.log('   4. Handle entire process without user manual work');
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---');
  }
};

const testRoutineDoctorAPI = async () => {
  console.log('\n🏥 Testing Routine Doctor API (What Genie automates)...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/routine-doctor/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'genie-automated-user',
        userName: 'Genie User',
        userEmail: 'genie@minds.com',
        connectionType: 'chat',
        note: 'Genie automated request - replacing manual user process',
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Automated doctor request created!');
      console.log(`   Request ID: ${data.requestId}`);
      console.log('   This is what Genie does automatically for users');
    } else {
      console.log(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
};

// Run tests
(async () => {
  await testGenieAutomation();
  await testRoutineDoctorAPI();
})();