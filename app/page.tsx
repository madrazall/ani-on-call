import Link from "next/link";
import RotatingQuote from "@/components/rotating-quote";

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="min-h-[calc(100vh-3.5rem)] flex flex-col justify-center max-w-4xl mx-auto px-6 py-24">
        <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-8">
          Not Ani&apos;s first rodeo.
        </p>
        <div className="mb-8">
          <RotatingQuote />
        </div>
        <p className="text-lg text-ani-muted leading-relaxed max-w-xl mb-12">
          Shipping charges. They&apos;re small enough to ignore and big enough to matter.
          Ani looks at your data and shows you exactly where the money went.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/sign-up"
            className="bg-ani-copper text-ani-white px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get answers
          </Link>
          <Link
            href="/buy"
            className="text-ani-white px-6 py-3 rounded-lg text-sm font-medium border border-ani-border hover:border-ani-muted transition-colors"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* ── The problem ───────────────────────────────────────────────── */}
      <section className="border-t border-ani-border bg-ani-surface">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-xs font-mono text-ani-muted uppercase tracking-widest mb-12">
            You&apos;re probably not checking these
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                label: 'Duplicate charges',
                body: "Carriers and platforms bill in ways that overlap. The same order shows up twice. Nobody catches it. You absorb it.",
              },
              {
                label: 'Rate inconsistency',
                body: "You think you know what a shipment costs. You don't — not really. The spread between your cheapest and most expensive similar shipment would surprise you.",
              },
              {
                label: 'Weight bracket creep',
                body: "A package that rounds up one weight tier costs significantly more. It adds up. Across hundreds of shipments, it adds up a lot.",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-3">
                <p className="font-mono text-sm font-medium text-ani-white">{item.label}</p>
                <p className="text-sm text-ani-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="border-t border-ani-border">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-xs font-mono text-ani-muted uppercase tracking-widest mb-12">
            How Ani works
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                label: 'Tell her what&apos;s wrong',
                body: "Answer a few questions about what feels off. Ani figures out what to look for — you don't have to know the right words for it.",
              },
              {
                step: '02',
                label: 'Upload your export',
                body: "CSV or Excel from any shipping platform. ShipStation, Pirateship, EasyPost — whatever you use. Ani handles the rest.",
              },
              {
                step: '03',
                label: 'Get a plain-English report',
                body: "No jargon. No dashboard to learn. Just a clear breakdown of what Ani found and what it means for your margins.",
              },
            ].map((item) => (
              <div key={item.step} className="space-y-3">
                <p className="font-mono text-xs text-ani-copper">{item.step}</p>
                <p className="font-mono text-sm font-medium text-ani-white" dangerouslySetInnerHTML={{ __html: item.label }} />
                <p className="text-sm text-ani-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: item.body }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="border-t border-ani-border bg-ani-surface">
        <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-mono text-xl font-bold text-ani-white mb-2">
              Ani&apos;s seen this before.
            </p>
            <p className="text-sm text-ani-muted max-w-md">
              She&apos;s looked at a lot of shipping data. She knows what to look for,
              and she&apos;ll tell you straight.
            </p>
          </div>
          <Link
            href="/sign-up"
            className="shrink-0 bg-ani-copper text-ani-white px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get answers
          </Link>
        </div>
      </section>

    </div>
  );
}
