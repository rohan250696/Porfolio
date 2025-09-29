"use client";

import { useState, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

type QA = { q: string; a: string; keywords?: string[] };

const knowledgeBase: QA[] = [
  {
    q: "Who are you?",
    a: "I’m Rohan, a Full Stack + Web3 developer. I build dApps on Ethereum, Polkadot/Substrate and EVM chains, with strong frontend and backend foundations.",
    keywords: ["who", "rohan", "about", "intro"],
  },
  {
    q: "What do you work on at peaq?",
    a: "I built a React Native demo app with embedded wallets (Privy), peaq token payments, RWA ownership tokens, and live profit-sharing. I also architected a custom Uniswap V3-based DEX on peaq, campaign/quest NFT rewards, realtime vehicle-sharing dApps, KYC/token-gated access, SDKs, analytics dashboards, and E2E testing across Substrate & EVM.",
    keywords: ["peaq", "dex", "sdk", "react native", "vehicle", "kyc", "quest"],
  },
  {
    q: "What chains and tools do you use?",
    a: "Ethereum, Polkadot/Substrate, Polygon; Solidity, Rust; Wagmi, Viem, RainbowKit; Hardhat, Truffle; React/Next.js; Node/Fastify/Express; GraphQL, WebSockets.",
    keywords: ["chains", "tools", "stack", "skills"],
  },
  {
    q: "Show your top skills",
    a: "Web3 dApps, smart contracts, SDK design, realtime systems, scalable backends, interactive frontends with Three.js, data viz, and developer tooling.",
    keywords: ["skills", "top", "best"],
  },
  {
    q: "How can I contact you?",
    a: "Email: ranjanrohan96@gmail.com · Phone: +91 748-863-5956 · Location: Bengaluru, India · LinkedIn/GitHub available on request.",
    keywords: ["contact", "email", "phone"],
  },
  {
    q: "Awards or achievements?",
    a: "AJIO Business Excellence Award. Top GitHub contributor at Eot Labs repositories.",
    keywords: ["awards", "achievements", "github"],
  },
];

function matchAnswer(query: string): string {
  const q = query.toLowerCase();
  for (const item of knowledgeBase) {
    if (item.keywords?.some((k) => q.includes(k))) return item.a;
  }
  // fallback: simple best-match by substring in Q
  const byQ = knowledgeBase.find((item) => item.q.toLowerCase().includes(q));
  return byQ?.a ?? "I’m tuned for Rohan’s portfolio. Ask about skills, peaq work, chains, awards, or contact.";
}

export function AIAssistant() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; id: string }[]>([
    {
      role: "assistant",
      text: "I’m Rohan. I build dApps across Ethereum and Polkadot/Substrate. Ask me about projects, skills, or contact.",
      id: "m0",
    },
  ]);
  const [input, setInput] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const answer = matchAnswer(trimmed);
    const uid = `${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed, id: `${uid}-u` },
      { role: "assistant", text: answer, id: `${uid}-a` },
    ]);
    setInput("");
  }

  const suggestions = useMemo(
    () => ["peaq work", "top skills", "chains & tools", "contact"],
    []
  );

  return (
    <div className="w-full max-w-3xl mx-auto rounded-xl border border-cyan-500/30 bg-black/40 backdrop-blur-md p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-cyan-200 font-semibold">AI Assistant</h2>
        <div className="text-[11px] text-cyan-300/70">Local knowledge base</div>
      </div>
      <div className="space-y-2 max-h-[40vh] overflow-auto pr-1">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={m.role === "assistant" ? "text-cyan-200" : "text-cyan-100/80"}
            >
              <span className="text-xs uppercase tracking-wide mr-2 opacity-60">{m.role}</span>
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-md bg-cyan-900/30 border border-cyan-500/30 px-3 py-2 text-cyan-100 placeholder:text-cyan-300/50 outline-none focus:ring-2 focus:ring-cyan-400/50"
          placeholder="Ask about projects, skills, or contact"
        />
        <button type="submit" className="rounded-md bg-cyan-500/90 hover:bg-cyan-400 text-black font-semibold px-4 py-2">
          Send
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => setInput(s)}
            className="text-xs rounded-full border border-cyan-500/30 px-3 py-1 text-cyan-200 hover:bg-cyan-900/30"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}


