import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

interface LandingPageProps {
  onStartQuiz: () => void;
}

export function LandingPage({ onStartQuiz }: LandingPageProps) {
  // Scale the whole block to fit any viewport height without vertical scroll.
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [marginTop, setMarginTop] = useState(0);

  const fitToViewport = () => {
    const vh = window.innerHeight; // includes mobile UI with modern browsers
    const pad = 16; // minimal breathing
    const contentH = contentRef.current?.scrollHeight ?? 0;
    if (!contentH) return;
    const s = Math.min(1, (vh - pad) / contentH);
    setScale(s);

    // Center vertically when there is spare height after scaling
    const scaledH = contentH * s;
    setMarginTop(Math.max(0, (vh - scaledH) / 2));
  };

  useLayoutEffect(() => {
    fitToViewport();
  }, []);

  useEffect(() => {
    const onResize = () => fitToViewport();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative h-[100svh] w-full overflow-hidden bg-brand-gray-950 text-brand-gray-100 font-sans"
    >
      {/* Content wrapper gets scaled to fit exactly in the viewport */}
      <div
        ref={contentRef}
            style={{ 
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          marginTop,
        }}
        className="mx-auto max-w-6xl px-4"
      >
         {/* Header */}
         <header className="text-center">
           <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">
             The starting line
        </h1>
           <p className="mx-auto mt-2 max-w-xl text-[13px] md:text-sm leading-relaxed text-brand-gray-300/90">
             Ground Zero is where identity stops being vague. It's the zero point where patterns get measured, confronted, and re-engineered.
           </p>
           <p className="mx-auto mt-1 text-[11px] text-brand-gray-400/80 font-medium">
             Deterministic. Accurate. No pop-psych vibes.
           </p>
         </header>

        {/* Divider */}
        <div className="mx-auto my-4 h-px w-16 rounded bg-brand-gray-700/80" />

        {/* Grid: Three Things (top) + Leave With (bottom) + CTA */}
        <section
          aria-label="Summary"
          className="grid grid-cols-12 gap-3 text-center"
        >
          {/* --- THREE THINGS --- */}
          <h2 className="col-span-12 text-brand-amber-400 uppercase tracking-wide text-[12px] md:text-sm font-bold">
            At the end you know three things
          </h2>
          <div className="col-span-12 mx-auto mb-1 h-[2px] w-16 rounded bg-brand-amber-500/90" />

          {/* Cards: equal height; compact copy (max two lines under label) */}
          <article
            className="col-span-12 md:col-span-4 rounded-xl border border-brand-gray-700 bg-brand-gray-900/60 p-3 min-h-[112px]
                       flex flex-col items-center justify-start gap-1 hover:-translate-y-[2px] hover:border-brand-amber-400/60
                       hover:bg-brand-gray-900/80 hover:shadow-lg hover:shadow-brand-amber-400/20 transition-all"
            aria-labelledby="now-title"
          >
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber-500/20">
              <svg
                className="h-3.5 w-3.5 text-brand-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"
                />
              </svg>
            </div>
            <div>
              <div
                id="now-title"
                className="text-[11px] md:text-xs font-extrabold text-brand-amber-400"
              >
                Your NOW
              </div>
              <p className="text-[11px] md:text-xs text-brand-gray-300/90 leading-snug">
                Your current face / archetype.
              </p>
            </div>
          </article>

          <article
            className="col-span-12 md:col-span-4 rounded-xl border border-brand-gray-700 bg-brand-gray-900/60 p-3 min-h-[112px]
                       flex flex-col items-center justify-start gap-1 hover:-translate-y-[2px] hover:border-brand-amber-400/60
                       hover:bg-brand-gray-900/80 hover:shadow-lg hover:shadow-brand-amber-400/20 transition-all"
            aria-labelledby="operate-title"
          >
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber-500/20">
              <svg
                className="h-3.5 w-3.5 text-brand-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M12 3v18M3 7h18M7 7l3 6H4l3-6zm10 0l3 6h-6l3-6z"
                />
              </svg>
            </div>
            <div>
              <div
                id="operate-title"
                className="text-[11px] md:text-xs font-extrabold text-brand-amber-400"
              >
                Operate Under That Face
              </div>
              <p className="text-[11px] md:text-xs text-brand-gray-300/90 leading-snug">
                Where it gives you advantage and where it leaves you exposed.
              </p>
            </div>
          </article>

          <article
            className="col-span-12 md:col-span-4 rounded-xl border border-brand-gray-700 bg-brand-gray-900/60 p-3 min-h-[112px]
                       flex flex-col items-center justify-start gap-1 hover:-translate-y-[2px] hover:border-brand-amber-400/60
                       hover:bg-brand-gray-900/80 hover:shadow-lg hover:shadow-brand-amber-400/20 transition-all"
            aria-labelledby="pressure-title"
          >
            <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber-500/20">
              <svg
                className="h-3.5 w-3.5 text-brand-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M12 12l6-6M4.93 19.07A10 10 0 1121 12"
                />
              </svg>
            </div>
            <div>
              <div
                id="pressure-title"
                className="text-[11px] md:text-xs font-extrabold text-brand-amber-400"
              >
                Respond Under Pressure
              </div>
              <p className="text-[11px] md:text-xs text-brand-gray-300/90 leading-snug">
                How you act across the seven areas:{" "}
                <span className="text-brand-amber-400 font-semibold">
                  Control, Pace, Boundary, Truth, Recognition, Bonding, Stress.
                </span>
              </p>
            </div>
          </article>

          {/* Divider between blocks */}
          <div className="col-span-12 mx-auto my-2 h-px w-16 rounded bg-brand-gray-700/80" />

          {/* --- LEAVE WITH --- */}
          <h2 className="col-span-12 text-brand-teal-400 uppercase tracking-wide text-[12px] md:text-sm font-bold">
            And you leave with
          </h2>
          <div className="col-span-12 mx-auto mb-1 h-[2px] w-16 rounded bg-brand-teal-500" />

          {/* 4 compact cards */}
          {[
            {
              title: "Primary (Anchor)",
              desc: "How you actually move.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              ),
            },
            {
              title: "Prize (Mirror)",
              desc: "The counterpart you're missing.",
              icon: (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M4 16l6-6 4 4 6-6M4 20h16"
                />
              ),
            },
             {
               title: "Secondary",
               desc: "The role you're often pushed into.",
               icon: (
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   strokeWidth="1.75"
                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0"
                 />
               ),
             },
          ].map((card) => (
            <article
              key={card.title}
              className="col-span-6 lg:col-span-3 rounded-xl border border-brand-gray-700 bg-gradient-to-br from-brand-gray-800/80 to-brand-gray-900/80 p-3 min-h-[104px]
                         flex flex-col items-center justify-start gap-1 transition-all
                         hover:-translate-y-[2px] hover:border-brand-teal-400/60 hover:from-brand-gray-800 hover:to-brand-gray-900
                         hover:shadow-lg hover:shadow-brand-teal-400/20"
              aria-label={card.title}
            >
              <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-teal-500/20">
                <svg
                  className="h-3.5 w-3.5 text-brand-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {card.icon}
                </svg>
              </div>
              <div className="text-[11px] md:text-xs font-extrabold text-brand-teal-400">
                {card.title}
              </div>
              <p className="text-[11px] md:text-xs text-brand-gray-200/95 leading-snug">
                {card.desc}
              </p>
            </article>
          ))}

          {/* CTA */}
          <div className="col-span-12 mt-3">
        <button
          onClick={onStartQuiz}
              className="btn-primary w-full max-w-sm mx-auto px-6 py-3 text-sm font-semibold tracking-wider uppercase
                         transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-orange-400/20"
              aria-label="Start the diagnostic"
            >
              Start Diagnostic
        </button>
            <p className="mt-2 text-[11px] text-brand-gray-400">
              Completely free. No email required to view results.
        </p>
      </div>
        </section>
      </div>
    </div>
  );
}
