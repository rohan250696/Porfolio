"use client";

import { useEffect, useRef, useState } from "react";
import { experiences } from "@/config/experience";
import { ExperienceDetailModal } from "@/components/ExperienceDetailModal";

export function ExperienceTimeline() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const nodes = el.querySelectorAll(".timeline-node");
      nodes.forEach((n) => {
        const rect = (n as HTMLElement).getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        (n as HTMLElement).style.setProperty("--scale", inView ? "1" : "0.85");
        (n as HTMLElement).style.setProperty("--opacity", inView ? "1" : "0.4");
      });
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const items = experiences.map((e) => ({
    title: `${e.company} — ${e.role}`,
    company: e.company,
    href: e.companyHref,
    time: e.period,
    desc: e.highlights[0] ?? "",
  }));

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section ref={containerRef} className="py-16 md:py-24">
      <h3 className="px-4 md:px-8 text-cyan-200 font-semibold mb-6">Experience</h3>
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-cyan-500/20" />
        <div className="space-y-10">
          {items.map((it, i) => (
            <div key={i} className="timeline-node relative grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
              style={{ transition: "transform 600ms ease, opacity 600ms ease", transform: "scale(var(--scale, 1))", opacity: "var(--opacity, 1)" }}
            >
              <div className={`order-2 md:order-${i % 2 === 0 ? 1 : 2} p-4 md:p-6 rounded-xl border border-cyan-500/20 bg-cyan-900/10 backdrop-blur`}
                   onClick={() => setOpenIdx(i)}
                   role="button"
                   tabIndex={0}
              > 
                <div className="text-cyan-100 font-medium">
                  {it.title}
                  {" "}
                  <a className="text-cyan-300 underline underline-offset-2 ml-1" href={it.href} target="_blank" rel="noreferrer">
                    ({it.company}) ↗
                  </a>
                </div>
                <div className="text-cyan-300/70 text-sm">{it.time}</div>
                <div className="mt-2 text-cyan-100/80 text-sm">{it.desc}</div>
                <div className="mt-2 text-[10px] text-cyan-300/70">Click for details</div>
              </div>
              <div className="order-1 md:order-none flex md:justify-center">
                <div className="h-3 w-3 rounded-full" style={{ background: "var(--accent)", boxShadow: `0 0 24px 4px var(--accent-weak)` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <ExperienceDetailModal open={openIdx !== null} onClose={() => setOpenIdx(null)} item={openIdx !== null ? experiences[openIdx] : undefined} />
    </section>
  );
}


