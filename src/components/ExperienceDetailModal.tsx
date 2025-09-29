"use client";

import { useEffect } from "react";
import { ExperienceItem } from "@/config/experience";

type Props = {
  open: boolean;
  onClose: () => void;
  item?: ExperienceItem;
};

export function ExperienceDetailModal({ open, onClose, item }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-black/70 p-4 sm:p-5 text-cyan-100 shadow-[0_0_40px_rgba(0,247,255,0.2)]">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
          <div>
            <div className="text-cyan-200 text-lg sm:text-xl font-semibold">{item.role} @ {item.company}</div>
            <div className="text-cyan-300/80 text-xs sm:text-sm">{item.location} • {item.period}</div>
          </div>
          <button onClick={onClose} className="rounded-md border border-cyan-500/30 px-3 py-1 text-cyan-200 self-end sm:self-auto">Close</button>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-4 sm:gap-5">
          <div className="md:col-span-2 space-y-2">
            {item.highlights.map((h, i) => (
              <div key={i} className="text-xs sm:text-sm leading-relaxed">• {h}</div>
            ))}
          </div>
          <div>
            <div className="text-cyan-200 font-medium mb-2">Tech</div>
            <div className="flex flex-wrap gap-2">
              {item.tech.map((t) => (
                <span key={t} className="text-[10px] sm:text-xs px-2 py-1 rounded-full border border-cyan-500/30">{t}</span>
              ))}
            </div>
            {item.links && item.links.length > 0 && (
              <div className="mt-4">
                <div className="text-cyan-200 font-medium mb-2">Links</div>
                <div className="flex flex-col gap-1">
                  {item.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-xs sm:text-sm text-cyan-300 underline underline-offset-2">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-40" style={{
          background: "radial-gradient(240px 80px at 20% 0%, rgba(0,247,255,0.25), transparent), radial-gradient(240px 80px at 80% 100%, rgba(0,247,255,0.15), transparent)",
        }} />
      </div>
    </div>
  );
}


