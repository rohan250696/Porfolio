"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectBar() {
  return (
    <div className="sticky top-0 z-10 w-full flex items-center justify-end p-3 bg-gradient-to-b from-black/60 to-transparent">
      <ConnectButton chainStatus="icon" accountStatus={{ smallScreen: "avatar", largeScreen: "full" }} />
    </div>
  );
}


