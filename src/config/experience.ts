export type ExperienceLink = { label: string; href: string };
export type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  period: string;
  companyHref: string;
  highlights: string[];
  tech: string[];
  links?: ExperienceLink[];
};

export const experiences: ExperienceItem[] = [
  {
    company: "peaq",
    role: "Full Stack Developer",
    location: "Berlin, Germany (Remote)",
    period: "Sept 2022 - Present",
    companyHref: "https://www.peaq.xyz/",
    highlights: [
      "Built RN demo app for Machine Economy: social login (Privy), embedded wallets, PEAQ payments, RWA ownership tokens, real-time profit sharing.",
      "Scaled backend to 6k+ concurrent requests with event-driven architecture, caching, and smart queueing.",
      "Architected custom Uniswap V3-based DEX on peaq with advanced DeFi features.",
      "Led campaign/quest system issuing NFT rewards and peaq tokens with on-chain proofs.",
      "Engineered realtime vehicle sharing dApp with blockchain rewards over WebSockets.",
      "Implemented KYC flows and token-gated feature access.",
      "Integrated wallets via RainbowKit, Wagmi, Viem (MetaMask, WalletConnect, Safe, etc.).",
      "Developed peaq SDKs for Substrate/EVM pallets; authored docs and guides.",
      "Built realtime analytics dashboard for vehicle-sharing metrics.",
      "Delivered MVP dApps with E2E testing across Polkadot and EVM environments.",
    ],
    tech: ["React Native", "Privy", "RainbowKit", "Wagmi", "Viem", "Substrate", "EVM", "Uniswap V3", "Node.js", "WebSockets", "KYC"],
    links: [
      { label: "Company", href: "https://www.peaq.xyz/" },
    ],
  },
  {
    company: "BlockC",
    role: "Blockchain Developer",
    location: "Bangalore, India",
    period: "Jan 2022 - Aug 2022",
    companyHref: "https://blockc.school",
    highlights: [
      "Delivered smart contracts for DAOs, multisig wallets, escrows, crowdfunding.",
      "Built dApps like Safe House and NFT Visualizers using Hardhat/Truffle/Ganache.",
    ],
    tech: ["Solidity", "Hardhat", "Truffle", "Ganache", "Ethers"],
    links: [
      { label: "Company", href: "https://blockc.school" },
    ],
  },
  {
    company: "AJIO",
    role: "Software Development Engineer I",
    location: "Bangalore, India",
    period: "Jul 2021 - Aug 2022",
    companyHref: "https://www.ajio.com/",
    highlights: [
      "Developed React UIs for Sambandham and CMS-UI improving responsiveness and workflows.",
      "Shipped production features with solid unit tests and modular architecture; improved Powertool for sales/product teams.",
    ],
    tech: ["React", "TypeScript", "Jest", "Cypress", "Tailwind"],
    links: [
      { label: "Company", href: "https://www.ajio.com/" },
    ],
  },
  {
    company: "MASAI",
    role: "FullStack Developer",
    location: "Bangalore, India",
    period: "Mar 2020 - Jun 2021",
    companyHref: "https://www.masaischool.com/",
    highlights: [
      "Built eCommerce platform for shoe enthusiasts with cart and coupons.",
      "Created responsive React components with thorough unit tests.",
    ],
    tech: ["React", "Node.js", "MongoDB"],
    links: [
      { label: "Company", href: "https://www.masaischool.com/" },
    ],
  },
  {
    company: "Mphasis",
    role: "Associate Software Engineer",
    location: "Pune, India",
    period: "Jan 2019 - Mar 2020",
    companyHref: "https://www.mphasis.com/",
    highlights: [
      "Built and maintained mortgage loan system for an Australian bank.",
      "Implemented backend services and database operations for reliability/security.",
    ],
    tech: ["Java", "SQL", "REST"],
    links: [
      { label: "Company", href: "https://www.mphasis.com/" },
    ],
  },
];


