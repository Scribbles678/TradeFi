/**
 * Reload Sparky Bot Strategies
 * Triggers the bot to reload strategies from the database
 * This should be called when strategy status is changed in the dashboard
 */

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  
  // Bot URL - from environment or config
  const botUrl = config.sparkyBotUrl || process.env.SPARKY_BOT_URL || 'http://localhost:3000';
  
  try {
    const response = await $fetch(`${botUrl}/api/strategies/reload`, {
      method: 'POST',
      timeout: 5000, // 5 second timeout
    });

    return {
      success: true,
      message: 'Strategies reloaded successfully',
      bot: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error reloading bot strategies:', error);
    
    return {
      success: false,
      error: 'Bot is offline or unreachable',
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
});

