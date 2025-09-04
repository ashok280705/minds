// Test Feature Suggestion System
console.log('🧠 Testing Feature Suggestion System...');

// Test scenarios for different mental health contexts
const testScenarios = [
  {
    name: "Mental Health Crisis",
    message: "I'm feeling really depressed and having thoughts of self-harm. I don't know what to do anymore.",
    expectedFeatures: ["crisisSupport", "mentalCounselor", "routineDoctor"]
  },
  {
    name: "Anxiety and Stress",
    message: "I've been having panic attacks and feeling overwhelmed with work stress lately.",
    expectedFeatures: ["mentalCounselor", "routineDoctor"]
  },
  {
    name: "Women's Health",
    message: "My periods have been irregular and I'm experiencing severe PMS symptoms.",
    expectedFeatures: ["periodTracker", "healthAdvisor", "routineDoctor"]
  },
  {
    name: "Medical Report",
    message: "I got my blood test results back and I'm confused about what they mean.",
    expectedFeatures: ["healthAdvisor", "routineDoctor"]
  },
  {
    name: "General Health Inquiry",
    message: "I want to track my overall health and get some medical advice.",
    expectedFeatures: ["healthAdvisor", "routineDoctor", "mentalCounselor"]
  },
  {
    name: "Progress Tracking",
    message: "I want to see how my mental health has improved over the past few weeks.",
    expectedFeatures: ["chatHistory", "mentalCounselor"]
  }
];

// Test function
window.testFeatureSuggestions = async (scenario = 0) => {
  const testCase = testScenarios[scenario];
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 Message: "${testCase.message}"`);
  
  try {
    const response = await fetch('/api/feature-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message: testCase.message,
        includeProfile: true 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Feature Suggestions Generated:');
      console.log('💬 AI Message:', data.data.message);
      console.log('🎯 Suggested Features:');
      
      data.data.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.name}`);
        console.log(`     📍 Route: ${suggestion.route}`);
        console.log(`     💡 Reason: ${suggestion.relevanceReason}`);
        console.log('');
      });
      
      console.log('🧠 Context Analysis:', data.data.context);
      
      // Check if expected features are suggested
      const suggestedIds = data.data.suggestions.map(s => s.route.split('/').pop());
      const expectedFound = testCase.expectedFeatures.filter(expected => 
        suggestedIds.some(suggested => suggested.includes(expected.replace(/([A-Z])/g, '-$1').toLowerCase()))
      );
      
      console.log(`✅ Expected features found: ${expectedFound.length}/${testCase.expectedFeatures.length}`);
      
    } else {
      console.error('❌ API Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Request Error:', error);
  }
};

// Test all scenarios
window.testAllScenarios = async () => {
  console.log('🚀 Running all test scenarios...\n');
  
  for (let i = 0; i < testScenarios.length; i++) {
    await testFeatureSuggestions(i);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✅ All tests completed!');
};

// Test Gemini integration with feature suggestions
window.testGeminiWithSuggestions = async (message = "I'm feeling anxious and need help") => {
  console.log('\n🧞‍♂️ Testing Gemini Chat with Feature Suggestions...');
  console.log(`📝 Message: "${message}"`);
  
  try {
    const response = await fetch('/api/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages: [{ role: 'user', content: message }],
        userId: 'test-user'
      })
    });
    
    const data = await response.json();
    
    console.log('🤖 Gemini Reply:', data.reply);
    console.log('⚠️ Risk Level:', data.riskAnalysis?.level);
    console.log('🎵 Music Suggested:', data.moodMusic?.name || 'None');
    
    if (data.featureSuggestions) {
      console.log('\n💡 Feature Suggestions:');
      console.log('📢 AI Message:', data.featureSuggestions.message);
      console.log('🎯 Suggested Features:');
      
      data.featureSuggestions.suggestions?.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion.name} - ${suggestion.route}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Auto-load message
console.log('🎯 Feature Suggestion Test Functions Loaded!');
console.log('📋 Available commands:');
console.log('  • testFeatureSuggestions(0-5) - Test specific scenario');
console.log('  • testAllScenarios() - Test all scenarios');
console.log('  • testGeminiWithSuggestions("your message") - Test full integration');
console.log('\n🚀 Starting demo in 3 seconds...');

// Auto-demo
setTimeout(() => {
  console.log('\n🎬 Running demo scenario...');
  testGeminiWithSuggestions("I've been feeling really depressed lately and having trouble sleeping");
}, 3000);