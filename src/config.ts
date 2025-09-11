import { mainnet, sepolia } from "viem/chains";
import { cookieStorage, createStorage } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
  appName: "BorrowFI",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [sepolia, mainnet],
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
});

export const client = config.getClient();

