"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { SignSelector } from "@/components/sign-selector";
import { QuoteCard } from "@/components/quote-card";
import { StarField } from "@/components/star-field";
import { SignOnboarding } from "@/components/sign-onboarding";
import { TodaysLenses } from "@/components/todays-lenses";
import { ZodiacSignName } from "@/data/signs";

type LensKey = "work" | "love" | "family" | "money" | "self";

interface QuoteData {
  quote: string;
  briefing: string | null;
  sign: string;
  date: string;
  moon_phase: string;
  moon_sign: string;
  retrograde: string | null;
  featured_lens: LensKey | null;
  lenses: Record<LensKey, { teaser: string; detail: string }> | null;
}

function slowScrollTo(target: HTMLElement, duration = 1400, offset = 24) {
  const start = window.scrollY;
  const end = target.getBoundingClientRect().top + start - offset;
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
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const guideRef = useRef<HTMLElement>(null);
  const askRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const lensesRef = useRef<HTMLDivElement>(null);
  const [askVisible, setAskVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [hasSeenLenses, setHasSeenLenses] = useState(false);

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
  useEffect(() => {
    const el = askRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAskVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = lensesRef.current;
    if (!el || hasSeenLenses) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasSeenLenses(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasSeenLenses, quoteData?.lenses]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);

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
    setSelectorOpen(false);
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
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.message ?? data.error ?? "Something went wrong.");
      if (data.questions_remaining !== undefined) setQuestionsRemaining(data.questions_remaining);
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
            onClick={(e) => { e.preventDefault(); const el = document.getElementById("subscribe"); if (el) slowScrollTo(el); }}
            className="text-xs font-sans font-medium tracking-widest uppercase rounded-full px-4 py-2 transition-colors cursor-pointer"
            style={{
              color: "rgba(201,169,110,0.9)",
              border: "1px solid rgba(201,169,110,0.6)",
              boxShadow: "0 0 8px rgba(201,169,110,0.7), 0 0 20px rgba(201,169,110,0.45), 0 0 48px rgba(201,169,110,0.2)",
            }}
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
          {sign && !selectorOpen ? (
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <span>Your sign: {sign}</span>
              <span className="text-gold-light">· Change</span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6 w-full">
              <div className="text-center space-y-1">
                <p className="text-xs font-sans tracking-widest uppercase text-text-muted">
                  {sign ? "Change your sign" : "Pick your sign"}
                </p>
              </div>
              <SignSelector selected={sign ?? ""} onChange={handleSignChange} />
            </div>
          )}

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

          <div ref={lensesRef} className="w-full flex flex-col items-center gap-6">
            {sign && (
              <TodaysLenses
                lenses={quoteData?.lenses ?? null}
                featuredLens={quoteData?.featured_lens ?? null}
                loading={loadingQuote}
              />
            )}
          </div>
        </section>

        {/* Teaser to Ask section */}
        <div className="flex flex-col items-center gap-3 pt-4 pb-10">
          <div className="w-full max-w-xs mx-auto border-t border-gold-light" />
          <div className="flex flex-col items-center gap-2 pt-5">
            <span className="text-gold-light text-xl animate-pulse select-none">✦</span>
            <p
              className="text-base text-text-muted italic"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Have a question for the cosmos?
            </p>
            <span className="text-gold-light text-lg animate-bounce select-none leading-none">↓</span>
          </div>
        </div>

        {/* Q&A */}
        <section ref={askRef} id="ask" className="flex flex-col items-center gap-6 pt-0 pb-12">
          {answer ? (
            <>
              <div className="w-full text-center">
                <p className="text-xs font-sans tracking-widest uppercase text-text-muted mb-2">
                  You asked
                </p>
                <h2
                  className="text-3xl text-text-primary capitalize"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  {question}
                </h2>
              </div>

              <div
                className="w-full rounded-2xl border border-gold-light bg-surface p-6"
                style={{ boxShadow: "0 0 32px rgba(201,169,110,0.18), 0 0 80px rgba(201,169,110,0.08)" }}
              >
                <p
                  className="text-xl leading-relaxed text-text-primary italic"
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {answer}
                </p>
              </div>

              {questionsRemaining === 1 && (
                <p className="text-xs font-sans text-text-muted text-center">
                  ✦ 1 question left today
                </p>
              )}

              <button
                onClick={() => { setAnswer(""); setQuestion(""); setQuestionsRemaining(null); }}
                className="text-xs font-sans tracking-widest uppercase text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                Ask another
              </button>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2
                  className="text-3xl text-text-primary"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  Ask the stars
                </h2>
                <p className="text-sm text-text-secondary mt-1 font-sans">
                  Cosmic questions only. Two free questions per day.
                </p>
              </div>

              <form onSubmit={handleAsk} className="w-full space-y-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Is Mercury retrograde affecting me? Should I sign a contract today?"
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-xl bg-surface border border-gold-light px-4 py-3 text-sm text-text-primary placeholder:text-text-muted font-sans resize-none focus:outline-none focus:border-gold transition-colors"
                />
                <button
                  type="submit"
                  disabled={loadingAnswer || !question.trim()}
                  className="w-full rounded-full bg-gold text-background font-sans font-medium text-sm py-3 px-6 hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAnswer ? "Reading the stars…" : "Ask"}
                </button>

              </form>
            </>
          )}
        </section>

        <div className="w-full max-w-xs mx-auto border-t border-gold-light" />

        {/* Subscribe */}
        <section id="subscribe" className="relative w-full rounded-2xl overflow-hidden mt-4 scroll-mt-10"
          style={{ background: "radial-gradient(ellipse at 60% 40%, #2a1a0e 0%, #140c08 55%, #0a0604 100%)" }}
        >
          <StarField />

          <div className="relative z-10 flex flex-col items-center gap-7 px-8 py-16">
            {subscribed ? (
              <div className="text-center space-y-2">
                <p
                  className="text-4xl text-white"
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
                >
                  Check your inbox.
                </p>
                <p className="text-sm font-sans text-white/60">
                  A confirmation is on its way. Your daily guide starts tomorrow.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-3">
                  <p className="text-xs font-sans tracking-widest uppercase text-white/60">
                    Your daily cosmic guide
                  </p>
                  <h2
                    className="text-4xl sm:text-5xl text-white leading-tight"
                    style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
                  >
                    Wake up to the cosmos
                  </h2>
                  <p className="text-sm font-sans max-w-xs mx-auto leading-relaxed text-white/65">
                    Your daily reading for {sign ?? "your sign"} — moon phase, planetary weather, and a quote — delivered every morning. Free, always.
                  </p>
                </div>

                {!sign ? (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <p className="text-xs font-sans tracking-widest uppercase text-white/50">
                      First, pick your sign
                    </p>
                    <SignSelector selected="" onChange={handleSignChange} />
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="w-full flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <input
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 rounded-xl px-5 py-4 text-base font-sans focus:outline-none transition-colors text-white placeholder:text-white/40"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.3)",
                      }}
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center rounded-full border border-white/50 text-white/90 text-xs font-sans font-medium tracking-widest uppercase px-7 py-4 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {/* ── How it works ── */}
      <section className="w-full bg-surface py-16">
        <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-sans tracking-widest uppercase text-text-muted mb-2">
            About the cosmic context
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
        </div>
      </section>

      {/* Floating lenses CTA */}
      {sign && !!quoteData?.lenses && !hasSeenLenses && !footerVisible && (
        <button
          onClick={() => { const el = document.getElementById("lenses"); if (el) slowScrollTo(el); }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-sans font-medium tracking-widest uppercase transition-all duration-500 cursor-pointer"
          style={{
            background: "rgba(20,12,8,0.85)",
            border: "1px solid rgba(201,169,110,0.5)",
            color: "rgba(201,169,110,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 24px rgba(201,169,110,0.15)",
          }}
        >
          <span className="animate-pulse">✦</span>
          See your full guide
        </button>
      )}

      {/* Floating ask CTA */}
      {sign && (hasSeenLenses || !quoteData?.lenses) && !askVisible && !footerVisible && (
        <button
          onClick={() => { const el = document.getElementById("ask"); if (el) slowScrollTo(el); }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-sans font-medium tracking-widest uppercase transition-all duration-500 cursor-pointer"
          style={{
            background: "rgba(20,12,8,0.85)",
            border: "1px solid rgba(201,169,110,0.5)",
            color: "rgba(201,169,110,0.9)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 24px rgba(201,169,110,0.15)",
          }}
        >
          <span className="animate-pulse">✦</span>
          Ask the stars
        </button>
      )}

      {/* Footer */}
      <footer ref={footerRef} className="border-t border-gold-light py-6 px-6">
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
