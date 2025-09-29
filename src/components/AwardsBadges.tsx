"use client";

export function AwardsBadges() {
  const items = [
    { title: "Business Excellence — AJIO", desc: "Apr–Jun 2022" },
    { title: "Top GitHub Contributor", desc: "Eot Labs repos" },
  ];
  return (
    <section className="py-16 md:py-24">
      <h3 className="px-4 md:px-8 text-cyan-200 font-semibold mb-6">Awards & Achievements</h3>
      <div className="px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-cyan-500/30 bg-cyan-900/10 p-4 text-cyan-100 text-sm shadow-[0_0_20px_rgba(0,247,255,0.2)]">
            <div className="font-semibold text-cyan-200">{it.title}</div>
            <div className="text-cyan-300/80 text-xs">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


