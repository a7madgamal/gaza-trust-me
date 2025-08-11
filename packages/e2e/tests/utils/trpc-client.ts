import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers';
import { env } from './env';

export const testTRPC = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({ url: `${env.BACKEND_URL}/api/trpc` })],
});
