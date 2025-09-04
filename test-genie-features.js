// Test Genie with Feature Suggestions
console.log('🧞‍♂️ Testing Genie Feature Suggestions...');

const testMessages = [
  "I'm feeling anxious and stressed",
  "My periods are irregular", 
  "I got my blood test results",
  "I need to talk to a doctor",
  "I'm having panic attacks",
  "मुझे डिप्रेशन हो रहा है", // Hindi
  "मला चिंता वाटते" // Marathi
];

window.testGenieFeatures = async (messageIndex = 0) => {
  const message = testMessages[messageIndex] || testMessages[0];
  console.log(`\n🧞‍♂️ Testing: "${message}"`);
  
  try {
    const response = await fetch('/api/genie-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('🤖 Genie Response:', data.response);
      console.log('🌐 Language:', data.language);
      
      if (data.suggestedFeature) {
        console.log('💡 Suggested Feature:', data.suggestedFeature.name);
        console.log('📍 Route:', data.suggestedFeature.route);
        console.log('💭 Reason:', data.suggestedFeature.reason);
      }
    } else {
      console.error('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
};

window.testAllGenieMessages = async () => {
  for (let i = 0; i < testMessages.length; i++) {
    await testGenieFeatures(i);
    await new Promise(r => setTimeout(r, 1000));
  }
};

console.log('🎯 Commands:');
console.log('  testGenieFeatures(0-6) - Test specific message');
console.log('  testAllGenieMessages() - Test all messages');

// Auto-test
setTimeout(() => testGenieFeatures(0), 2000);