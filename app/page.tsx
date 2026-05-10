import Link from "next/link";
import { OUTCOMES } from "@/lib/outcomes";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">

        {/* Left: headline + CTAs */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-ani-white leading-tight tracking-tight">
              Something feel off with your shipping costs?
            </h1>
            <p className="text-lg text-ani-muted leading-relaxed">
              Upload your export, pick what you want to know, and Ani runs the numbers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="bg-ani-copper text-ani-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started
            </Link>
            <Link
              href="/buy"
              className="text-ani-white px-5 py-2.5 rounded-lg text-sm font-medium border border-ani-border hover:border-ani-muted transition-colors"
            >
              See pricing
            </Link>
          </div>

          <p className="text-sm text-ani-muted">
            Could be a real problem. Could be nothing.{" "}
            <span className="text-ani-white">Either way, now you know.</span>
          </p>
        </div>

        {/* Right: outcome cards */}
        <div className="space-y-3">
          <p className="text-xs font-mono text-ani-muted mb-4 tracking-wide uppercase">
            What Ani can find
          </p>
          {OUTCOMES.map((outcome) => (
            <div
              key={outcome.id}
              className="border border-ani-border bg-ani-surface rounded-xl p-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="text-sm font-medium text-ani-white">{outcome.name}</p>
                  <p className="text-xs text-ani-muted mt-0.5">{outcome.description}</p>
                </div>
                <span className="text-xs font-mono text-ani-muted whitespace-nowrap shrink-0">
                  {outcome.credits} {outcome.credits === 1 ? "credit" : "credits"}
                </span>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Link
              href="/sign-up"
              className="text-sm text-ani-copper hover:opacity-80 transition-opacity"
            >
              Start with 0 credits required →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
