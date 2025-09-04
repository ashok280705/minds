// Test "Our Platform" Suggestions
console.log('🧞♂️ Testing "Our Platform" Suggestions...');

const tests = [
  "My periods are irregular",
  "I'm feeling anxious", 
  "I got my blood test results",
  "I need medicine for headache",
  "I want to consult a doctor"
];

window.testOurPlatform = async (index = 0) => {
  const message = tests[index];
  console.log(`\n🧪 Testing: "${message}"`);
  
  try {
    const res = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('🤖 Genie Response:', data.response);
      
      // Check if response mentions "our website" or "our platform"
      const mentionsOurPlatform = data.response.toLowerCase().includes('our website') || 
                                 data.response.toLowerCase().includes('our platform');
      
      console.log(mentionsOurPlatform ? '✅ Mentions "our platform/website"' : '❌ Missing "our platform/website"');
      
      if (data.suggestedFeature) {
        console.log('💡 Feature:', data.suggestedFeature.name);
      }
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (e) {
    console.log('❌ Failed:', e.message);
  }
};

window.testAll = async () => {
  for (let i = 0; i < tests.length; i++) {
    await testOurPlatform(i);
    await new Promise(r => setTimeout(r, 1000));
  }
};

console.log('Commands: testOurPlatform(0-4) or testAll()');
setTimeout(() => testOurPlatform(0), 2000);