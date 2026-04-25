// Test Arabic encoding
const axios = require('axios');

async function testArabic() {
  try {
    // Login first
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@enjaz.com',
      password: 'admin123'
    });

    const token = loginRes.data.accessToken;

    // Create lead with Arabic text
    const leadRes = await axios.post('http://localhost:5000/api/leads', {
      customer_name: 'محمد علي',
      phone: '07701234567',
      address: 'بغداد - الكرادة',
      source: 'walk-in',
      notes: 'عميل مهتم بالخدمات'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      }
    });

    console.log('Lead created:');
    console.log(JSON.stringify(leadRes.data, null, 2));

    // Get leads
    const getRes = await axios.get('http://localhost:5000/api/leads', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\nAll leads:');
    console.log(JSON.stringify(getRes.data, null, 2));

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testArabic();
