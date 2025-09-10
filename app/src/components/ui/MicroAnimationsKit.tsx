// Ground Zero – UI Micro-Animations Kit
// Stack: React + TailwindCSS + Framer Motion
// Drop this into your Next.js/React project. Components are self-contained and composable.
// npm i framer-motion

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

/*************************
 * 1) Primitives & Variants
 *************************/
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export const slideRight = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

/** Stagger container for lists/grids */
export const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

/***********************
 * 2) Loading Interstitials
 ***********************/
interface InterstitialProps {
  icon: React.ReactNode;
  title?: string;
  subtitle?: string;
  minHoldMs?: number;
  onBegin?: () => void;
  beginLabel?: string;
  pulseColor?: string;
  titleStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
}

export function Interstitial({
  icon, // JSX icon
  title = "Phase",
  subtitle = "",
  minHoldMs = 1600,
  onBegin,
  beginLabel = "BEGIN",
  pulseColor = "yellow", // Default to yellow
  titleStyle,
  subtitleStyle,
}: InterstitialProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), minHoldMs);
    return () => clearTimeout(t);
  }, [minHoldMs]);

  const getPulseColors = (color: string) => {
    switch (color) {
      case 'cyan':
        return {
          bg: 'bg-cyan-400/20',
          pulse: 'bg-cyan-400/40'
        };
      case 'red':
        return {
          bg: 'bg-red-400/20',
          pulse: 'bg-red-400/40'
        };
      case 'green':
        return {
          bg: 'bg-green-400/20',
          pulse: 'bg-green-400/40'
        };
      case 'orange':
        return {
          bg: 'bg-orange-400/20',
          pulse: 'bg-orange-400/40'
        };
      case 'orange-orange':
        return {
          bg: 'bg-orange-500/25',
          pulse: 'bg-orange-500/50'
        };
      case 'pink':
        return {
          bg: 'bg-pink-400/20',
          pulse: 'bg-pink-400/40'
        };
      case 'purple':
        return {
          bg: 'bg-purple-400/20',
          pulse: 'bg-purple-400/40'
        };
      default: // yellow
        return {
          bg: 'bg-yellow-400/20',
          pulse: 'bg-yellow-400/40'
        };
    }
  };

  const colors = getPulseColors(pulseColor);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black">
      <motion.div
        className="flex flex-col items-center gap-6 text-center scale-150"
        initial="hidden"
        animate="visible"
        variants={stagger}
        transition={{ staggerChildren: 0.06, delayChildren: 0.04 }}
      >
        <motion.div variants={scaleIn} transition={{ duration: 0.45, ease: "easeOut" }}>
          <div className={`relative mx-auto grid h-32 w-32 place-items-center rounded-full ${colors.bg}`}>
            <div className={`absolute inset-0 animate-ping rounded-full ${colors.pulse}`} />
            <div className="relative z-10">{icon}</div>
          </div>
        </motion.div>
        <motion.h2
          className="text-2xl font-semibold tracking-wide text-neutral-100 uppercase"
          variants={slideUp}
          custom={0.05}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          style={titleStyle}
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <motion.p
            className="max-w-md text-sm text-neutral-300 uppercase"
            variants={fadeIn}
            custom={0.1}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={subtitleStyle}
          >
            {subtitle}
          </motion.p>
        ) : null}

        <motion.button
          disabled={!ready}
          onClick={onBegin}
          className={`mt-2 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition [text-shadow:0_1px_0_rgba(0,0,0,0.25)] ${
            ready
              ? "bg-yellow-400 text-black hover:bg-yellow-300 active:scale-[0.99]"
              : "bg-neutral-700 text-neutral-400"
          }`}
          variants={scaleIn}
          custom={0.15}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
        >
          {ready ? beginLabel : "PREPARING..."}
        </motion.button>
      </motion.div>
    </div>
  );
}

/***************************
 * 3) Title + Subhead with Shimmer
 ***************************/
interface PhaseTitleProps {
  label: string;
  kicker: string;
}

export function PhaseTitle({ label, kicker }: PhaseTitleProps) {
  return (
    <div className="mb-8">
      <motion.p className="text-xs uppercase tracking-[0.3em] text-neutral-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {kicker}
      </motion.p>
      <motion.h1
        className="bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 bg-[length:200%_100%] bg-clip-text text-3xl font-bold text-transparent uppercase"
        initial={{ backgroundPositionX: "0%" }}
        animate={{ backgroundPositionX: "100%" }}
        transition={{ duration: 2.2, ease: "easeInOut", repeat: 0 }}
      >
        {label}
      </motion.h1>
    </div>
  );
}

/**********************
 * 4) Hover / Focus States
 **********************/
interface HoverLiftCardProps {
  children: React.ReactNode;
  className?: string;
}

export function HoverLiftCard({ children, className = "" }: HoverLiftCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.995 }}
      className={`group relative rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] transition ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-yellow-400/40" />
      {children}
    </motion.div>
  );
}

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function GlowButton({ children, onClick, disabled }: GlowButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      className={`relative inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold ${
        disabled ? "bg-neutral-800 text-neutral-500" : "bg-yellow-400 text-black hover:brightness-105"
      }`}
    >
      {!disabled && (
        <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-yellow-300/40" />
      )}
      {children}
    </motion.button>
  );
}

/***************************
 * 5) Slide Cards (for A/B choices or carousels)
 ***************************/
interface SlideCardItem {
  id: string;
  title: string;
  body: string;
}

interface SlideCardsProps {
  items?: SlideCardItem[];
  onPick?: (id: string) => void;
}

export function SlideCards({ items = [], onPick }: SlideCardsProps) {
  // items: [{id, title, body}]
  const [index, setIndex] = useState(0);
  const direction = useMotionValue(0);

  function go(next: number) {
    direction.set(next > index ? 1 : -1);
    setIndex(next);
  }

  function pick(id: string) {
    onPick?.(id);
  }

  return (
    <div className="relative overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <PhaseTitle label={items[index]?.title || ""} kicker={`Card ${index + 1} / ${items.length}`} />
        <div className="flex gap-2">
          <GlowButton disabled={index === 0} onClick={() => go(index - 1)}>PREV</GlowButton>
          <GlowButton disabled={index === items.length - 1} onClick={() => go(index + 1)}>NEXT</GlowButton>
        </div>
      </div>

      <div className="relative h-48">
        <AnimatePresence initial={false}>
          <motion.div
            key={items[index]?.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -40, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <HoverLiftCard className="h-full">
              <p className="text-sm text-neutral-300">{items[index]?.body}</p>
              <div className="mt-4 flex gap-3">
                <GlowButton onClick={() => pick(items[index]?.id + "_A")}>CHOOSE A</GlowButton>
                <GlowButton onClick={() => pick(items[index]?.id + "_B")}>CHOOSE B</GlowButton>
              </div>
            </HoverLiftCard>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 w-6 rounded-full ${i === index ? "bg-yellow-400" : "bg-neutral-700"}`}
          />
        ))}
      </div>
    </div>
  );
}

/***************************
 * 6) Smoother Page Transition Wrapper
 ***************************/
interface PageFadeProps {
  children: React.ReactNode;
}

export function PageFade({ children }: PageFadeProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}

/***************************
 * 7) Result Reveal Sequence
 ***************************/
interface ResultLine {
  label: string;
  verdict: string;
}

interface ResultRevealProps {
  title: string;
  lines?: ResultLine[];
  cta?: React.ReactNode;
}

export function ResultReveal({ title, lines = [], cta }: ResultRevealProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-neutral-100 uppercase">{title}</h2>
        <p className="mt-2 text-neutral-400 uppercase">SEVEN LINES RESOLVED. THIS IS YOUR CODE.</p>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3">
        {lines.map((l, i) => (
          <motion.div key={i} variants={slideRight} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
            <span className="text-sm text-neutral-300">{l.label}</span>
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
              l.verdict === "C" ? "bg-green-500/20 text-green-300" : l.verdict === "O" ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"
            }`}>{l.verdict}</span>
          </motion.div>
        ))}
      </motion.div>

      {cta}
    </div>
  );
}
