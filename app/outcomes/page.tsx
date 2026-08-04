import Link from "next/link";
import { OUTCOMES } from "@/lib/outcomes";

export const metadata = {
  title: "All Outcomes — Ani On Call",
  description: "Every analysis Ani can run on your shipping data, in one place.",
};

export default function OutcomesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
        {OUTCOMES.length} things Ani checks for
      </p>
      <h1 className="font-mono text-3xl md:text-4xl font-bold text-ani-white mb-3">
        Already know what you&apos;re looking for?
      </h1>
      <p className="text-sm text-ani-muted leading-relaxed max-w-xl mb-12">
        Skip the guided questions. Pick an analysis below and jump straight to
        uploading your file — you can always add more once you&apos;re in.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {OUTCOMES.map((outcome) => (
          <Link
            key={outcome.id}
            href={`/upload?outcome=${outcome.id}`}
            className="group flex flex-col justify-between rounded-xl border border-ani-border bg-ani-surface p-5 hover:border-ani-copper transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-mono text-sm font-medium text-ani-white leading-snug">
                  {outcome.name}
                </p>
                <span className="shrink-0 font-mono text-[10px] text-ani-copper bg-ani-copper-dim border border-ani-border rounded-full px-2 py-1">
                  {outcome.credits} {outcome.credits === 1 ? "credit" : "credits"}
                </span>
              </div>
              <p className="text-sm text-ani-muted leading-relaxed">{outcome.description}</p>
            </div>
            <span className="text-xs font-mono text-ani-copper mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              Run this →
            </span>
          </Link>
        ))}
      </div>

      <div className="border-t border-ani-border pt-8">
        <p className="text-sm text-ani-muted">
          Not sure which one fits?{" "}
          <Link href="/upload" className="text-ani-copper hover:opacity-80 transition-opacity">
            Answer a couple of questions instead
          </Link>
          {" "}and Ani will point you to the right one.
        </p>
      </div>
    </div>
  );
}
