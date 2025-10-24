// Debug script to test API configurations
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debugging TradeFI API Configuration\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Read .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('\n📋 Environment Variables:');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        // Hide sensitive values
        const hiddenValue = value.length > 8 ? value.substring(0, 4) + '...' + value.substring(value.length - 4) : '***';
        console.log(`   ${key}: ${hiddenValue}`);
      }
    }
  });
} else {
  console.log('❌ .env file not found');
  console.log('   Please create .env file with your API credentials');
}

console.log('\n🔧 API Endpoints to test:');
console.log('   http://localhost:3001/api/balance/aster');
console.log('   http://localhost:3001/api/balance/oanda');
console.log('   http://localhost:3001/api/balance/tradier');
console.log('   http://localhost:3001/api/balances');

console.log('\n💡 Common Issues:');
console.log('   1. Missing API credentials in .env file');
console.log('   2. Incorrect API keys/secrets');
console.log('   3. Wrong account IDs');
console.log('   4. API endpoints not accessible');
console.log('   5. Rate limiting or authentication errors');

console.log('\n🚀 Next Steps:');
console.log('   1. Check your .env file has all required credentials');
console.log('   2. Verify credentials match your Sparky bot');
console.log('   3. Test individual API endpoints');
console.log('   4. Check browser console for errors');
