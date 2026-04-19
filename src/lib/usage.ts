const LIMIT = 1500; // Gemini 2.5 Flash Lite RPD

// Global usage tracking (resets on server restart, fine for dev/hackathon)
let usageCount = 0;
let lastReset = new Date();

function checkAndReset() {
  const now = new Date();
  // Reset if it's a new day (UTC or local, using local for simplicity)
  if (now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    usageCount = 0;
    lastReset = now;
  }
}

export function incrementUsage() {
  checkAndReset();
  usageCount++;
  return usageCount;
}

export function getUsage() {
  checkAndReset();
  
  // Calculate reset time (midnight of the next day)
  const resetTime = new Date();
  resetTime.setHours(24, 0, 0, 0); // Midnight tonight
  
  return {
    remaining: Math.max(0, LIMIT - usageCount),
    limit: LIMIT,
    resetTime: resetTime.getTime()
  };
}
