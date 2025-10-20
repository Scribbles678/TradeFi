/**
 * Get Sparky Bot Positions
 * Fetches current positions from the bot
 */

export default defineEventHandler(async () => {
  const botUrl = process.env.SPARKY_BOT_URL || 'http://localhost:3000';
  
  try {
    const response = await $fetch(`${botUrl}/positions`, {
      method: 'GET',
      timeout: 5000,
    });

    return {
      success: true,
      positions: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching bot positions:', error);
    
    return {
      success: false,
      error: 'Failed to fetch positions from bot',
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
});

