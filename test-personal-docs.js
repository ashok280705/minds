// Test script for personal documents functionality
const testPersonalDocs = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Personal Documents API...\n');
  
  // Test 1: Register user
  console.log('1. Testing Registration...');
  try {
    const registerResponse = await fetch(`${baseUrl}/api/documents/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpass123',
        phone: '9876543210'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration:', registerData);
  } catch (error) {
    console.log('❌ Registration failed:', error.message);
  }
  
  // Test 2: Login user
  console.log('\n2. Testing Login...');
  let token = null;
  try {
    const loginResponse = await fetch(`${baseUrl}/api/documents/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testuser@example.com',
        password: 'testpass123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData);
    token = loginData.token;
  } catch (error) {
    console.log('❌ Login failed:', error.message);
  }
  
  // Test 3: Upload document
  if (token) {
    console.log('\n3. Testing Document Upload...');
    try {
      const uploadResponse = await fetch(`${baseUrl}/api/documents/files`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileName: 'test-report.pdf',
          fileType: 'application/pdf',
          fileSize: 1024000
        })
      });
      
      const uploadData = await uploadResponse.json();
      console.log('✅ Upload:', uploadData);
    } catch (error) {
      console.log('❌ Upload failed:', error.message);
    }
    
    // Test 4: Get documents
    console.log('\n4. Testing Get Documents...');
    try {
      const getResponse = await fetch(`${baseUrl}/api/documents/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const getData = await getResponse.json();
      console.log('✅ Get Documents:', getData);
    } catch (error) {
      console.log('❌ Get documents failed:', error.message);
    }
  }
  
  console.log('\n🎉 Test completed!');
};

// Run if this is a Node.js environment
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testPersonalDocs();
} else {
  // Browser environment
  window.testPersonalDocs = testPersonalDocs;
  console.log('Run testPersonalDocs() in browser console');
}