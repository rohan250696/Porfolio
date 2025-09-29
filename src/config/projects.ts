export type ProjectCard = {
  title: string;
  desc: string;
  link: string; // external URL
  tags?: string[];
};

export const projects3D: ProjectCard[] = [
  {
    title: "peaq-machine-economy-app",
    desc: "RN/Web demo for peaq: embedded wallets, payments, PFTs, live balances",
    link: "https://github.com/rohan250696/peaq-machine-economy-app",
    tags: ["Expo/RN", "Privy", "Wagmi", "Viem", "EVM"],
  },
  {
    title: "Robotic SDK",
    desc: "Tools/SDK for robotic integrations and machine economy",
    link: "https://github.com/rohan250696/Robotic-SDK",
    tags: ["SDK", "TypeScript", "Robotics", "Substrate/EVM"],
  },
  {
    title: "Web3 Debugging Dashboard",
    desc: "Realtime on-chain telemetry, tx tracing, developer insights",
    link: "https://github.com/rohan250696/Web3-Debugging-Dashboard",
    tags: ["Next.js", "GraphQL", "WebSockets", "Data Viz"],
  },
  {
    title: "DeFi Intent-Based Trade Executor",
    desc: "Intent-based order flow and execution strategies",
    link: "https://github.com/rohan250696/DeFi-Intent-Based-Trade-Executor",
    tags: ["DeFi", "Intents", "MEV-aware", "Bots"],
  },
];


