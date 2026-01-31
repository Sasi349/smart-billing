// Test script to verify authentication API endpoints
// This can be run in the browser console or with a tool like Postman

// Test Registration
async function testRegistration() {
  console.log('Testing Registration...')
  
  const registerData = {
    email: 'test@example.com',
    password: 'password123',
    businessName: 'Test Business'
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })

    const result = await response.json()
    console.log('Registration Response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Registration successful!')
      return true
    } else {
      console.log('❌ Registration failed:', result.error)
      return false
    }
  } catch (error) {
    console.log('❌ Registration error:', error)
    return false
  }
}

// Test Login
async function testLogin() {
  console.log('Testing Login...')
  
  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })

    const result = await response.json()
    console.log('Login Response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Login successful!')
      return true
    } else {
      console.log('❌ Login failed:', result.error)
      return false
    }
  } catch (error) {
    console.log('❌ Login error:', error)
    return false
  }
}

// Test Customer API
async function testCustomerAPI() {
  console.log('Testing Customer API...')
  
  const customerData = {
    customerName: 'Test Customer',
    businessName: 'Customer Business',
    address: '123 Test Street, Test City',
    gstin: 'TESTGST123',
    phone: '1234567890',
    email: 'customer@example.com'
  }

  try {
    // Create customer
    const createResponse = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    })

    const createResult = await createResponse.json()
    console.log('Create Customer Response:', createResponse.status, createResult)
    
    if (createResponse.ok) {
      console.log('✅ Customer created successfully!')
      
      // Get customers
      const getResponse = await fetch('/api/customers')
      const getResult = await getResponse.json()
      console.log('Get Customers Response:', getResponse.status, getResult)
      
      if (getResponse.ok && Array.isArray(getResult) && getResult.length > 0) {
        console.log('✅ Retrieved customers successfully!')
        return true
      }
    }
    
    console.log('❌ Customer API failed')
    return false
  } catch (error) {
    console.log('❌ Customer API error:', error)
    return false
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting Authentication Tests...\n')
  
  const regSuccess = await testRegistration()
  console.log('')
  
  const loginSuccess = await testLogin()
  console.log('')
  
  const apiSuccess = await testCustomerAPI()
  console.log('')
  
  console.log('📊 Test Results:')
  console.log('Registration:', regSuccess ? '✅ PASS' : '❌ FAIL')
  console.log('Login:', loginSuccess ? '✅ PASS' : '❌ FAIL')
  console.log('Customer API:', apiSuccess ? '✅ PASS' : '❌ FAIL')
  
  if (regSuccess && loginSuccess && apiSuccess) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.')
  }
}

// Export for use in browser console
window.testAuth = {
  runTests,
  testRegistration,
  testLogin,
  testCustomerAPI
}

console.log('🧪 Test functions loaded. Run window.testAuth.runTests() to start testing.')
