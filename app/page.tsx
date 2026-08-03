import Link from "next/link";
import RotatingQuote from "@/components/rotating-quote";

/* ── Small inline icon set (no external deps) ──────────────────────── */
function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  trendUp: "M3 17l6-6 4 4 8-8M15 7h6v6",
  compare: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  target: "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01",
  cart: "M3 3h2l.4 2M7 13h10l3-8H5.4M7 13L5.4 5M7 13l-1.7 5H17M10 21a1 1 0 100-2 1 1 0 000 2zM17 21a1 1 0 100-2 1 1 0 000 2z",
  factory: "M3 21V10l6 4v-4l6 4V7l6 4v10H3zM7 21v-4M13 21v-4M19 21v-4",
  truck: "M2 8h11v8H2zM13 11h4l3 3v2h-7zM6 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  box: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  warehouse: "M3 21V9l9-5 9 5v12H3zM9 21v-6h6v6",
  check: "M20 6L9 17l-5-5",
};

const BUILT_FOR = [
  { label: "eCommerce", icon: ICONS.cart },
  { label: "Manufacturing", icon: ICONS.factory },
  { label: "Distribution", icon: ICONS.truck },
  { label: "Wholesale", icon: ICONS.box },
  { label: "3PL / Fulfillment", icon: ICONS.warehouse },
];

const FEATURE_CARDS = [
  {
    icon: ICONS.trendUp,
    label: "Catch it before it's a pattern",
    body: "Duplicate charges, rate creep, weight brackets you keep tipping into — Ani flags the stuff that's easy to miss one invoice at a time.",
  },
  {
    icon: ICONS.compare,
    label: "See what things actually cost",
    body: "Compare carriers, service levels, and weight classes side by side. Find out where you're paying for speed or coverage you don't need.",
  },
  {
    icon: ICONS.target,
    label: "Get a straight answer",
    body: "No dashboard to learn, no spreadsheet to build. Tell Ani what feels off and get a plain-English report back.",
  },
];

const CHECKLIST = [
  "Answer a few plain-English questions",
  "Upload your export — any shipping platform",
  "Get a clear, jargon-free report",
  "Pay only for the reports you run",
];

const ROLES = [
  {
    icon: ICONS.target,
    label: "Operations Managers",
    body: "Track where shipping cost is actually going, week to week.",
  },
  {
    icon: ICONS.trendUp,
    label: "Finance Teams",
    body: "Understand what's driving margin, without chasing carrier invoices.",
  },
  {
    icon: ICONS.cart,
    label: "eCommerce & Fulfillment Teams",
    body: "Spot billing errors and rate creep before they eat into a launch.",
  },
  {
    icon: ICONS.warehouse,
    label: "Small Business Owners",
    body: "See the big picture on shipping without hiring someone to watch it.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-8">
            Not Ani&apos;s first rodeo.
          </p>
          <div className="mb-8">
            <RotatingQuote />
          </div>
          <p className="text-lg text-ani-muted leading-relaxed max-w-xl mb-10">
            Shipping charges. They&apos;re small enough to ignore and big enough to matter.
            Ani looks at your data and shows you exactly where the money went.
          </p>
          <div className="flex flex-wrap gap-4 mb-4">
            <Link
              href="/sign-up"
              className="bg-ani-copper text-ani-bg px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get answers
            </Link>
            <Link
              href="/buy"
              className="text-ani-white px-6 py-3 rounded-lg text-sm font-medium border border-ani-border hover:border-ani-copper transition-colors"
            >
              See pricing
            </Link>
          </div>
          <p className="text-xs text-ani-muted flex items-center gap-1.5">
            <Icon path={ICONS.check} className="w-3.5 h-3.5 text-ani-copper shrink-0" />
            No subscription — buy credits, use them whenever.
          </p>
        </div>

        {/* Sample finding mockup */}
        <div className="hidden lg:block">
          <div className="relative mb-5">
            {/* Peeking card behind — hints there's more than one report type */}
            <div className="absolute -top-4 -right-3 w-[88%] rounded-xl border border-ani-border bg-ani-surface2/60 p-6 rotate-2 -z-10">
              <span className="font-mono text-[10px] text-ani-muted uppercase tracking-widest">
                duplicate-charges
              </span>
            </div>

            <div className="rounded-xl border border-ani-border bg-ani-surface p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[10px] text-ani-muted uppercase tracking-widest">
                  Example finding
                </span>
                <span className="font-mono text-[10px] text-ani-copper">cost-creep-over-time</span>
              </div>
              <p className="text-ani-white text-base leading-relaxed mb-5">
                Average cost per shipment is up{" "}
                <span className="text-ani-copper font-bold">14.3%</span> since March.
              </p>
              <div className="rounded-lg bg-ani-surface2 border border-ani-border p-4 font-mono text-xs space-y-2.5">
                <div className="flex justify-between text-ani-muted">
                  <span>March</span>
                  <span className="text-ani-white">$6.12 / shipment</span>
                </div>
                <div className="flex justify-between text-ani-muted">
                  <span>June</span>
                  <span className="text-ani-white">$7.00 / shipment</span>
                </div>
                <div className="flex justify-between border-t border-ani-border pt-2.5">
                  <span className="text-ani-muted">Biggest driver</span>
                  <span className="text-ani-rust">Ground rate increase</span>
                </div>
              </div>
            </div>
          </div>

          {/* A couple more example findings, so it reads as "one of many" not one lucky catch */}
          <div className="space-y-3">
            {[
              {
                tag: "weight-bracket-creep",
                body: "14 packages tipped into a pricier bracket by under 2 oz",
                amount: "$310",
              },
              {
                tag: "duplicate-charges",
                body: "3 orders billed twice by the same carrier",
                amount: "$187",
              },
            ].map((row) => (
              <div
                key={row.tag}
                className="flex items-center justify-between gap-4 rounded-lg border border-ani-border bg-ani-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[10px] text-ani-muted uppercase tracking-widest mb-1">
                    {row.tag}
                  </p>
                  <p className="text-sm text-ani-white truncate">{row.body}</p>
                </div>
                <span className="font-mono text-sm text-ani-copper shrink-0">{row.amount}</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-ani-muted italic mt-4">
            Illustrative examples — your report runs on your actual data.
          </p>
        </div>
      </section>

      {/* ── Built for ─────────────────────────────────────────────────── */}
      <section className="border-t border-ani-border">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-xs font-mono text-ani-muted uppercase tracking-widest text-center mb-8">
            Built for operations teams in
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
            {BUILT_FOR.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 text-ani-muted">
                <Icon path={item.icon} className="w-4 h-4 text-ani-copper shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature cards ─────────────────────────────────────────────── */}
      <section className="border-t border-ani-border bg-ani-surface">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURE_CARDS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-ani-border bg-ani-bg p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-ani-copper-dim border border-ani-border flex items-center justify-center mb-5">
                  <Icon path={item.icon} className="w-5 h-5 text-ani-copper" />
                </div>
                <p className="font-mono text-sm font-medium text-ani-white mb-2">{item.label}</p>
                <p className="text-sm text-ani-muted leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ask Ani mockup + checklist ───────────────────────────────── */}
      <section className="border-t border-ani-border">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="rounded-xl border border-ani-border bg-ani-surface p-6">
            <p className="font-mono text-[10px] text-ani-muted uppercase tracking-widest mb-4">
              Example question
            </p>
            <div className="rounded-lg bg-ani-surface2 border border-ani-border px-4 py-3 mb-4">
              <p className="text-sm text-ani-white">Why did my shipping costs jump in June?</p>
            </div>
            <p className="text-sm text-ani-muted leading-relaxed mb-4">
              Costs are up 14% since March. Top drivers:
            </p>
            <div className="space-y-2 font-mono text-xs">
              {[
                ["Ground rate increase", "$1,240"],
                ["More Zone 8 shipments", "$860"],
                ["Weight bracket creep", "$410"],
              ].map(([label, amount]) => (
                <div
                  key={label}
                  className="flex justify-between rounded-md bg-ani-bg border border-ani-border px-3 py-2"
                >
                  <span className="text-ani-muted">{label}</span>
                  <span className="text-ani-copper">{amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
              Get answers that matter
            </p>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-ani-white leading-tight mb-8">
              The answers are in your data. Ani helps you find them.
            </h2>
            <ul className="space-y-3 mb-8">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ani-white">
                  <Icon path={ICONS.check} className="w-4 h-4 text-ani-copper shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/sign-up"
              className="inline-block bg-ani-copper text-ani-bg px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get answers
            </Link>
          </div>
        </div>
      </section>

      {/* ── Roles + bottom CTA ───────────────────────────────────────── */}
      <section className="border-t border-ani-border bg-ani-surface">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <p className="text-xs font-mono text-ani-muted uppercase tracking-widest mb-8">
              Built for teams who move products
            </p>
            <div className="space-y-6">
              {ROLES.map((role) => (
                <div key={role.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-ani-copper-dim border border-ani-border flex items-center justify-center shrink-0">
                    <Icon path={role.icon} className="w-4 h-4 text-ani-copper" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ani-white mb-0.5">{role.label}</p>
                    <p className="text-xs text-ani-muted leading-relaxed">{role.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-ani-border bg-ani-bg p-10 md:p-14 flex flex-col justify-center">
            <p className="text-xs font-mono text-ani-copper uppercase tracking-widest mb-4">
              Ready to take control?
            </p>
            <h2 className="font-mono text-3xl md:text-5xl font-bold text-ani-white leading-tight mb-5">
              Find where the money went.
            </h2>
            <p className="text-sm text-ani-muted mb-8 max-w-md">
              Upload your data. Get clarity. Make better decisions — without
              hiring someone to watch your shipping spend for you.
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              <Link
                href="/sign-up"
                className="bg-ani-copper text-ani-bg px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get answers
              </Link>
              <Link
                href="/buy"
                className="text-ani-white px-6 py-3 rounded-lg text-sm font-medium border border-ani-border hover:border-ani-copper transition-colors"
              >
                View pricing
              </Link>
            </div>
            <p className="text-xs text-ani-muted flex items-center gap-1.5">
              <Icon path={ICONS.check} className="w-3.5 h-3.5 text-ani-copper shrink-0" />
              No subscription — buy credits, use them whenever.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
