"use client";

import { useState, useEffect, useCallback } from "react";
import { SignSelector } from "@/components/sign-selector";
import { QuoteCard } from "@/components/quote-card";
import { ZodiacSignName } from "@/data/signs";

interface QuoteData {
  quote: string;
  sign: string;
  date: string;
  moon_phase: string;
  moon_sign: string;
  retrograde: string | null;
}

export default function Home() {
  const [sign, setSign] = useState<ZodiacSignName>("Scorpio");
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const fetchQuote = useCallback(async (selectedSign: ZodiacSignName) => {
    setLoadingQuote(true);
    try {
      const res = await fetch(`/api/quote/today?sign=${selectedSign}`);
      const data = await res.json();
      setQuoteData(data);
    } catch {
      // silent fail — card stays in loading state
    } finally {
      setLoadingQuote(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote(sign);
  }, [sign, fetchQuote]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoadingAnswer(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, email: email || "anonymous" }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.error ?? "Something went wrong.");
    } catch {
      setAnswer("The stars are quiet right now. Try again in a moment.");
    } finally {
      setLoadingAnswer(false);
    }
  }

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, zodiac_sign: sign }),
      });
      setSubscribed(true);
    } catch {
      // silent fail for now
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto w-full">
        <span
          className="text-2xl tracking-widest text-gold uppercase"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
        >
          Lumora
        </span>
        <a
          href="#subscribe"
          className="text-xs font-sans font-medium tracking-widest uppercase text-text-secondary border border-gold-light rounded-full px-4 py-2 hover:border-gold hover:text-text-primary transition-colors"
        >
          Subscribe
        </a>
      </header>

      <main className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 pb-16">
        {/* Hero */}
        <section className="flex flex-col items-center gap-8 pt-10 pb-14">
          <div className="text-center space-y-2">
            <p className="text-xs font-sans tracking-widest uppercase text-text-muted">
              Your cosmic guide for
            </p>
            <h1
              className="text-5xl sm:text-6xl text-text-primary"
              style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
            >
              {sign}
            </h1>
          </div>

          <SignSelector selected={sign} onChange={setSign} />

          {quoteData || loadingQuote ? (
            <QuoteCard
              quote={quoteData?.quote ?? ""}
              sign={sign}
              moonPhase={quoteData?.moon_phase ?? ""}
              moonSign={quoteData?.moon_sign ?? ""}
              retrograde={quoteData?.retrograde ?? null}
              loading={loadingQuote}
            />
          ) : null}
        </section>

        {/* Divider */}
        <div className="w-full max-w-xs mx-auto border-t border-gold-light my-2" />

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

        {/* Divider */}
        <div className="w-full max-w-xs mx-auto border-t border-gold-light my-2" />

        {/* Subscribe */}
        <section
          id="subscribe"
          className="flex flex-col items-center gap-6 py-12"
        >
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
                  style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
                >
                  Your daily cosmic quote
                </h2>
                <p className="text-sm text-text-secondary mt-1 font-sans">
                  Delivered every morning for {sign}. Free, always.
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                className="w-full max-w-sm space-y-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
