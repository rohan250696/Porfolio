"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export function ContactWeb3() {
  const { address, chainId } = useAccount();
  const [message, setMessage] = useState("");

  return (
    <section className="py-16 md:py-24">
      <h3 className="px-4 md:px-8 text-cyan-200 font-semibold mb-6">Contact</h3>
      <div className="px-4 md:px-8 grid md:grid-cols-2 gap-6 items-start">
        <form className="rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4 text-cyan-100">
          <div className="mb-2 text-sm">Email: ranjanrohan96@gmail.com</div>
          <div className="mb-4 text-sm">Phone: +91 748-863-5956</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-28 rounded-md bg-black/50 border border-cyan-500/30 p-3 outline-none focus:ring-2 focus:ring-cyan-400/50"
            placeholder="Write a message..."
          />
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-md bg-cyan-500/90 hover:bg-cyan-400 text-black font-semibold px-4 py-2">Send</button>
            <button type="button" className="rounded-md border border-cyan-500/30 px-4 py-2 text-cyan-200">Voice</button>
          </div>
        </form>
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4 text-cyan-100">
          <div className="text-sm">Wallet connected: {address ? `${address} (chain ${chainId})` : "Not connected"}</div>
          <div className="mt-2 text-xs text-cyan-300/70">Token-gated content demo placeholder</div>
        </div>
      </div>
    </section>
  );
}


