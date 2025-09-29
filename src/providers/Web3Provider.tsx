"use client";

import { ReactNode, useMemo } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, arbitrum, base, optimism } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig, lightTheme, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

type Props = {
  children: ReactNode;
};

export function Web3Provider({ children }: Props) {
  const queryClient = useMemo(() => new QueryClient(), []);

  const config = useMemo(() => {
    return getDefaultConfig({
      appName: "Rohan Portfolio",
      projectId: "demo", // replace with WalletConnect projectId for production
      chains: [mainnet, polygon, base, arbitrum, optimism],
      transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
      },
      ssr: true,
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            lightMode: lightTheme({ accentColor: "#00f7ff" }),
            darkMode: darkTheme({ accentColor: "#00f7ff" }),
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


