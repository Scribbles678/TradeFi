/**
 * Check Sparky Bot Health
 * Fetches status from the bot's health endpoint
 */

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  
  // Bot URL - update this with your actual bot URL
  const botUrl = process.env.SPARKY_BOT_URL || 'http://localhost:3000';
  
  try {
    const response = await $fetch(`${botUrl}/health`, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
    });

    return {
      success: true,
      bot: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching bot health:', error);
    
    return {
      success: false,
      error: 'Bot is offline or unreachable',
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
});

