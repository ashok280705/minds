// Complete Minds Platform Genie Test
console.log('🧞♂️ Testing Minds Platform Genie...');

const testCases = [
  // Mental Health
  { input: "I'm feeling depressed", expected: "AI Counselor" },
  { input: "I have anxiety attacks", expected: "AI Counselor" },
  
  // Women's Health  
  { input: "My periods are irregular", expected: "Period Tracker" },
  { input: "I have severe PMS", expected: "Period Tracker" },
  
  // Medical Reports
  { input: "I got my blood test results", expected: "Reports Analyzer" },
  { input: "Can you analyze my medical report?", expected: "Reports Analyzer" },
  
  // Pharmacy
  { input: "I need to buy medicine", expected: "Online Pharmacy" },
  { input: "Where can I get my prescription?", expected: "Online Pharmacy" },
  
  // Doctor Services
  { input: "I need to consult a doctor", expected: "Telemedicine" },
  { input: "Book appointment with doctor", expected: "Routine Doctor" },
  
  // Emergency
  { input: "This is an emergency", expected: "Emergency SOS" },
  { input: "I need urgent help", expected: "Emergency SOS" },
  
  // Scans
  { input: "I have an MRI scan", expected: "Scans Analyzer" },
  { input: "Can you check my X-ray?", expected: "Scans Analyzer" },
  
  // Health Monitoring
  { input: "I want to track my symptoms", expected: "Health Monitor" },
  { input: "Monitor my vital signs", expected: "Health Monitor" }
];

window.testMindsGenie = async (index = 0) => {
  const test = testCases[index];
  console.log(`\n🧪 Test ${index + 1}: "${test.input}"`);
  console.log(`Expected: ${test.expected}`);
  
  try {
    const res = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: test.input })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('🤖 Genie Response:', data.response);
      
      if (data.suggestedFeature) {
        console.log('✅ Suggested Feature:', data.suggestedFeature.name);
        console.log('📍 Route:', data.suggestedFeature.route);
        
        // Check if suggestion matches expected
        const matches = data.suggestedFeature.name.includes(test.expected);
        console.log(matches ? '✅ CORRECT SUGGESTION' : '❌ WRONG SUGGESTION');
      } else {
        console.log('❌ No feature suggested');
      }
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (e) {
    console.log('❌ Request failed:', e.message);
  }
};

window.testAllMinds = async () => {
  console.log('🚀 Testing all Minds features...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    await testMindsGenie(i);
    await new Promise(r => setTimeout(r, 1500));
  }
  
  console.log('\n✅ All tests completed!');
};

// Quick test function
window.askGenie = async (question) => {
  console.log(`\n🧞♂️ You: "${question}"`);
  
  try {
    const res = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('🤖 Genie:', data.response);
      if (data.suggestedFeature) {
        console.log(`💡 Suggested: ${data.suggestedFeature.name} (${data.suggestedFeature.route})`);
      }
    }
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
};

console.log('\n🎯 Available Commands:');
console.log('• testMindsGenie(0-' + (testCases.length-1) + ') - Test specific case');
console.log('• testAllMinds() - Test all features');
console.log('• askGenie("your question") - Ask anything');

console.log('\n🚀 Starting demo...');
setTimeout(() => testMindsGenie(0), 2000);