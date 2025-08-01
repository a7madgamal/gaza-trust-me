import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '@gazaconfirm/backend';
import { config } from './config';

export const trpc = createTRPCReact<AppRouter>();

// Type helpers
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Direct client for use in non-React contexts
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: config.trpcUrl,
      headers: () => {
        const session = localStorage.getItem('session');
        const sessionData = session ? JSON.parse(session) : null;

        if (sessionData?.access_token) {
          return {
            Authorization: `Bearer ${sessionData.access_token}`,
          };
        }
        return {};
      },
    }),
  ],
});
