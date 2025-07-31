import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {httpBatchLink} from "@trpc/client";
import {useState} from "react";
import {trpc} from "./trpc";
import {config} from "./config";

export function TRPCProvider({children}: {children: React.ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: config.trpcUrl,
          headers: () => {
            const session = localStorage.getItem("session");
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
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
