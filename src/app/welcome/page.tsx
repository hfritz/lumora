import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-6">
        <p
          className="text-3xl font-light tracking-widest text-gold uppercase"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Lumora
        </p>
        <h1
          className="text-4xl text-text-primary"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300 }}
        >
          You&rsquo;re all set.
        </h1>
        <p className="text-base text-text-secondary font-sans leading-relaxed">
          Your daily cosmic quote will arrive every morning. The stars are
          already watching.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-gold text-background font-sans font-medium text-sm py-3 px-8 hover:bg-gold-dark transition-colors"
        >
          Ask the stars something
        </Link>
      </div>
    </div>
  );
}
