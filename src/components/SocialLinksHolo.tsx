"use client";

export function SocialLinksHolo() {
  const links = [
    { name: "LinkedIn", href: "https://www.linkedin.com/in/rohanranjan96/" },
    { name: "GitHub", href: "https://github.com/rohan250696" },
  ];

  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-[120] flex flex-col gap-3">
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noreferrer"
          className="relative group rounded-xl border border-cyan-500/30 bg-black/50 backdrop-blur-md px-4 py-2 text-cyan-100 text-sm shadow-[0_0_24px_rgba(0,247,255,0.15)] hover:border-cyan-400/60 transition"
        >
          <span className="font-semibold text-cyan-200">{l.name}</span>
          <span className="ml-2 text-cyan-300/80 text-xs">↗</span>
          <span className="pointer-events-none absolute -inset-px rounded-xl opacity-40 group-hover:opacity-60" style={{
            background:
              "radial-gradient(160px 60px at 20% 0%, rgba(0,247,255,0.25), transparent), radial-gradient(120px 40px at 80% 100%, rgba(0,247,255,0.18), transparent)",
          }} />
        </a>
      ))}
    </div>
  );
}


