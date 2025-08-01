// Import environment validation first - this will load and validate all env vars
import './utils/env';
import { app, PORT } from './server';
import logger from './utils/logger';

// Export tRPC router and types for frontend consumption
export { appRouter, type AppRouter } from './routers';

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`🔗 tRPC endpoint: http://localhost:${PORT}/trpc`);
});
