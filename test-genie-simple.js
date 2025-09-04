// Simple Genie Test
console.log('🧞♂️ Testing Genie Feature Suggestions...');

window.testGenie = async (msg = "I'm feeling anxious") => {
  console.log(`Testing: "${msg}"`);
  
  try {
    const res = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('✅ Genie:', data.response);
      console.log('🎯 Feature:', data.suggestedFeature?.name);
      console.log('📍 Route:', data.suggestedFeature?.route);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
};

// Test different scenarios
const tests = [
  "I'm feeling depressed",
  "My periods are irregular", 
  "I got my blood test results",
  "I need to talk to a doctor"
];

window.runTests = async () => {
  for (let test of tests) {
    await testGenie(test);
    await new Promise(r => setTimeout(r, 1000));
  }
};

console.log('Commands: testGenie("your message") or runTests()');
setTimeout(() => testGenie(), 2000);