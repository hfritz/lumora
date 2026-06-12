"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { SignSelector } from "@/components/sign-selector";
import { QuoteCard } from "@/components/quote-card";
import { StarField } from "@/components/star-field";
import { SignOnboarding } from "@/components/sign-onboarding";
import { ZodiacSignName } from "@/data/signs";

interface QuoteData {
  quote: string;
  briefing: string | null;
  sign: string;
  date: string;
  moon_phase: string;
  moon_sign: string;
  retrograde: string | null;
}

function slowScrollTo(target: HTMLElement, duration = 1400) {
  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + start;
  const startTime = performance.now();
  function ease(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  function step(now: number) {
    const progress = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start + (end - start) * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export default function Home() {
  const [sign, setSign] = useState<ZodiacSignName | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const guideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lumora_sign") as ZodiacSignName | null;
    if (saved) {
      setSign(saved);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    const el = guideRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-revealed"); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [askEmail, setAskEmail] = useState("");
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const fetchQuote = useCallback(async (selectedSign: ZodiacSignName) => {
    setLoadingQuote(true);
    try {
      const res = await fetch(`/api/quote/today?sign=${selectedSign}`);
      const data = await res.json();
      setQuoteData(data);
    } catch {
      // silent
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  useEffect(() => {
    if (sign) fetchQuote(sign);
  }, [sign, fetchQuote]);

  function handleSignChange(newSign: ZodiacSignName) {
    setSign(newSign);
    localStorage.setItem("lumora_sign", newSign);
  }

  function handleOnboardingComplete(newSign: ZodiacSignName) {
    setSign(newSign);
    localStorage.setItem("lumora_sign", newSign);
    setShowOnboarding(false);
    setTimeout(() => {
      const el = document.getElementById("guide");
      if (el) slowScrollTo(el, 1000);
    }, 100);
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoadingAnswer(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          email: askEmail || "anonymous@lumora.app",
        }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.message ?? data.error ?? "Something went wrong.");
    } catch {
      setAnswer("The stars are quiet right now. Try again in a moment.");
    } finally {
      setLoadingAnswer(false);
    }
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail, zodiac_sign: sign }),
      });
      setSubscribed(true);
    } catch {
      // silent
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showOnboarding && (
        <SignOnboarding onComplete={handleOnboardingComplete} />
      )}

      {/* ── Hero ── */}
      <section className="relative flex flex-col min-h-screen">
        {/* Background image */}
        <Image
          src="/hero.jpg"
          alt="Woman on a balcony at dusk, constellation lines visible in the sky"
          fill
          priority
          className="object-cover object-center"
        />

        <StarField />

        {/* Overlay: subtle dark veil at top, fades to cream at bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,12,8,0.45) 0%, rgba(20,12,8,0.25) 45%, rgba(250,247,242,0.0) 65%, rgba(250,247,242,0.85) 85%, rgba(250,247,242,1) 100%)",
          }}
        />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
          <span
            className="text-2xl tracking-widest text-white uppercase"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
          >
            Lumora
          </span>
          <a
            href="#subscribe"
            className="text-xs font-sans font-medium tracking-widest uppercase text-white/80 border border-white/40 rounded-full px-4 py-2 hover:border-white hover:text-white transition-colors"
          >
            Subscribe
          </a>
        </header>

        {/* Hero text */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-6 pb-32 pt-4">
          <p className="text-xs font-sans tracking-widest uppercase text-white/60 mb-5">
            Your daily cosmic guide
          </p>
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl text-white leading-none tracking-wider"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
          >
            Lumora
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/75 font-sans max-w-sm leading-relaxed">
            Astrology, moon phases, and AI-powered guidance — delivered every
            morning.
          </p>
          <button
            onClick={() => { const el = document.getElementById("guide"); if (el) slowScrollTo(el); }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/50 text-white/90 text-xs font-sans font-medium tracking-widest uppercase px-7 py-3 hover:bg-white/10 transition-colors cursor-pointer"
          >
            Read your guide
          </button>
        </div>
      </section>

      {/* ── Guide ── */}
      <main ref={guideRef} id="guide" className="guide-section flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 pb-16 -mt-4">
        {/* Sign selector */}
        <section className="flex flex-col items-center gap-6 pt-6 pb-10">
          <div className="text-center space-y-1">
            <p className="text-xs font-sans tracking-widest uppercase text-text-muted">
              Your sign
            </p>
            <h2
              className="text-4xl sm:text-5xl text-text-primary"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              {sign ?? "Pick your sign"}
            </h2>
          </div>

          <SignSelector selected={sign ?? ""} onChange={handleSignChange} />

          {sign && (
            <QuoteCard
              quote={quoteData?.quote ?? ""}
              briefing={quoteData?.briefing ?? null}
              sign={sign}
              moonPhase={quoteData?.moon_phase ?? ""}
              moonSign={quoteData?.moon_sign ?? ""}
              retrograde={quoteData?.retrograde ?? null}
              loading={loadingQuote}
            />
          )}
        </section>

        <div className="w-full max-w-xs mx-auto border-t border-gold-light" />

        {/* Q&A */}
        <section className="flex flex-col items-center gap-6 py-12">
          <div className="text-center">
            <h2
              className="text-3xl text-text-primary"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Ask the stars
            </h2>
            <p className="text-sm text-text-secondary mt-1 font-sans">
              Cosmic questions only. One free question per day.
            </p>
          </div>

          <form onSubmit={handleAsk} className="w-full max-w-lg space-y-3">
            <input
              type="email"
              value={askEmail}
              onChange={(e) => setAskEmail(e.target.value)}
              placeholder="your@email.com (to track your daily limit)"
              className="w-full rounded-xl bg-surface border border-gold-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-sans focus:outline-none focus:border-gold transition-colors"
            />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Is Mercury retrograde affecting me? Should I cut my hair today?"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl bg-surface border border-gold-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-sans resize-none focus:outline-none focus:border-gold transition-colors"
            />
            <button
              type="submit"
              disabled={loadingAnswer || !question.trim()}
              className="w-full rounded-full bg-gold text-background font-sans font-medium text-sm py-3 px-6 hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingAnswer ? "Reading the stars…" : "Ask"}
            </button>
          </form>

          {answer && (
            <div className="w-full max-w-lg rounded-2xl border border-gold-light bg-surface p-6">
              <p
                className="text-xl leading-relaxed text-text-primary italic"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {answer}
              </p>
            </div>
          )}
        </section>

        <div className="w-full max-w-xs mx-auto border-t border-gold-light" />

        {/* Subscribe */}
        <section id="subscribe" className="flex flex-col items-center gap-6 py-12">
          {subscribed ? (
            <div className="text-center space-y-2">
              <p
                className="text-3xl text-text-primary"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Check your inbox.
              </p>
              <p className="text-sm text-text-secondary font-sans">
                A confirmation is on its way. Your daily guide starts tomorrow.
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2
                  className="text-3xl text-text-primary"
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontWeight: 400,
                  }}
                >
                  Your daily cosmic quote
                </h2>
                <p className="text-sm text-text-secondary mt-1 font-sans">
                  Delivered every morning for {sign ?? "your sign"}. Free, always.
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                className="w-full max-w-sm space-y-3"
              >
                <input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-xl bg-surface border border-gold-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-sans focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-gold text-background font-sans font-medium text-sm py-3 px-6 hover:bg-gold-dark transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </>
          )}
        </section>
      </main>

      {/* ── How it works ── */}
      <section className="w-full max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-sans tracking-widest uppercase text-text-muted mb-2">
            The cosmic context
          </p>
          <h2
            className="text-3xl sm:text-4xl text-text-primary"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
          >
            Why these three things matter
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center px-4">
            <span className="text-3xl mb-3">✨</span>
            <h3
              className="text-xl text-text-primary mb-2"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Your Sign
            </h3>
            <p className="text-sm font-sans text-text-secondary leading-relaxed">
              Your sun sign is determined by where the sun was when you were born. It shapes your core personality, natural strengths, and the energy you move through life with. Your daily quote is written specifically for your sign.
            </p>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <span className="text-3xl mb-3">🌙</span>
            <h3
              className="text-xl text-text-primary mb-2"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              The Moon
            </h3>
            <p className="text-sm font-sans text-text-secondary leading-relaxed">
              The moon completes a full cycle every 29 days, moving through eight phases. Each phase carries a different energy — new moons are for starting, full moons for releasing, waxing phases for building, waning phases for letting go. Knowing where the moon is helps you work with the day instead of against it.
            </p>
          </div>

          <div className="flex flex-col items-center text-center px-4">
            <span className="text-3xl mb-3">☿</span>
            <h3
              className="text-xl text-text-primary mb-2"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
            >
              Retrograde
            </h3>
            <p className="text-sm font-sans text-text-secondary leading-relaxed">
              A planet goes retrograde when it appears to move backward in the sky — an optical effect that astrologers associate with a slowing or reversal of that planet's influence. Mercury retrograde (3–4 times a year) affects communication and thinking. When one is active, it's a nudge to review rather than rush.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold-light py-6 px-6">
        <p className="text-center text-xs font-sans text-text-muted tracking-wide">
          Built by{" "}
          <a
            href="https://helmutfritz.fyi/"
            className="text-text-secondary hover:text-gold transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Helmut Fritz
          </a>{" "}
          using AI tools · 2026
        </p>
      </footer>
    </div>
  );
}
