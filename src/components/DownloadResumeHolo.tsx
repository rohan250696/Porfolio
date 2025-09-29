"use client";

const RESUME_PATH = "/assets/Rohan-Ranjan-FullStack-Engineer.pdf";

export function DownloadResumeHolo() {
  return (
    <a
      href={RESUME_PATH}
      download
      className="pointer-events-auto fixed bottom-4 left-4 z-[120] rounded-xl border border-cyan-500/30 bg-black/60 backdrop-blur-md px-4 py-2 text-cyan-100 text-sm shadow-[0_0_24px_rgba(0,247,255,0.15)] hover:border-cyan-400/60 transition"
    >
      <span className="font-semibold text-cyan-200">Download Resume</span>
      <span className="ml-2 text-cyan-300/80 text-xs">↓</span>
      <span
        className="pointer-events-none absolute -inset-px rounded-xl opacity-40"
        style={{
          background:
            "radial-gradient(160px 60px at 20% 0%, rgba(0,247,255,0.25), transparent), radial-gradient(120px 40px at 80% 100%, rgba(0,247,255,0.18), transparent)",
        }}
      />
    </a>
  );
}


