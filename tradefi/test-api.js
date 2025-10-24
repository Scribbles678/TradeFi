// Test script to check API endpoints
const fetch = require('node-fetch');

async function testAPIs() {
  console.log('Testing TradeFI API endpoints...\n');
  
  try {
    // Test individual balance APIs
    console.log('1. Testing Aster DEX balance...');
    const aster = await fetch('http://localhost:3001/api/balance/aster');
    console.log('   Status:', aster.status);
    const asterData = await aster.text();
    console.log('   Response:', asterData.substring(0, 200) + '...\n');
    
    console.log('2. Testing OANDA balance...');
    const oanda = await fetch('http://localhost:3001/api/balance/oanda');
    console.log('   Status:', oanda.status);
    const oandaData = await oanda.text();
    console.log('   Response:', oandaData.substring(0, 200) + '...\n');
    
    console.log('3. Testing Tradier balance...');
    const tradier = await fetch('http://localhost:3001/api/balance/tradier');
    console.log('   Status:', tradier.status);
    const tradierData = await tradier.text();
    console.log('   Response:', tradierData.substring(0, 200) + '...\n');
    
    console.log('4. Testing aggregated balances...');
    const balances = await fetch('http://localhost:3001/api/balances');
    console.log('   Status:', balances.status);
    const balancesData = await balances.text();
    console.log('   Response:', balancesData);
    
  } catch (error) {
    console.error('Error testing APIs:', error.message);
  }
}

testAPIs();
