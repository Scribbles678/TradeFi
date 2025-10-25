// Test script to manually add trades to the database
// Run this with: node test-trade-logging.js

const testTrades = [
  {
    symbol: 'BTCUSDT',
    side: 'BUY',
    asset_class: 'crypto',
    exchange: 'aster',
    entry_price: 95000,
    entry_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    exit_price: 96000,
    exit_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    quantity: 0.001,
    position_size_usd: 95,
    pnl_usd: 1.0,
    pnl_percent: 1.05,
    is_winner: true,
    exit_reason: 'Take profit hit',
    order_id: 'test_order_1',
    notes: 'Test trade from manual script'
  },
  {
    symbol: 'ETHUSDT',
    side: 'SELL',
    asset_class: 'crypto',
    exchange: 'aster',
    entry_price: 3500,
    entry_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    exit_price: 3450,
    exit_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    quantity: 0.0286,
    position_size_usd: 100,
    pnl_usd: 1.43,
    pnl_percent: 1.43,
    is_winner: true,
    exit_reason: 'Stop loss hit',
    order_id: 'test_order_2',
    notes: 'Test trade from manual script'
  },
  {
    symbol: 'SOLUSDT',
    side: 'BUY',
    asset_class: 'crypto',
    exchange: 'aster',
    entry_price: 140,
    entry_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    exit_price: 138,
    exit_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    quantity: 0.714,
    position_size_usd: 100,
    pnl_usd: -1.43,
    pnl_percent: -1.43,
    is_winner: false,
    exit_reason: 'Stop loss hit',
    order_id: 'test_order_3',
    notes: 'Test trade from manual script'
  }
];

async function testTradeLogging() {
  console.log('🧪 Testing trade logging to database...');
  
  try {
    // Test single trade
    console.log('\n📝 Testing single trade save...');
    const response = await fetch('http://localhost:3000/api/trades/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTrades[0])
    });
    
    const result = await response.json();
    console.log('Single trade result:', result);
    
    if (result.success) {
      console.log('✅ Single trade saved successfully!');
    } else {
      console.log('❌ Single trade save failed:', result.error);
    }
    
    // Test multiple trades
    console.log('\n📝 Testing multiple trades save...');
    const response2 = await fetch('http://localhost:3000/api/trades/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTrades.slice(1)) // Send remaining 2 trades
    });
    
    const result2 = await response2.json();
    console.log('Multiple trades result:', result2);
    
    if (result2.success) {
      console.log(`✅ ${result2.count} trades saved successfully!`);
    } else {
      console.log('❌ Multiple trades save failed:', result2.error);
    }
    
    console.log('\n🎉 Trade logging test completed!');
    console.log('Check your dashboard to see if the trades appear.');
    
  } catch (error) {
    console.error('❌ Error testing trade logging:', error);
    console.log('\n💡 Make sure your Nuxt dev server is running on localhost:3000');
  }
}

// Run the test
testTradeLogging();
