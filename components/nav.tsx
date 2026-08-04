import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", userId)
    .single();
  return data?.balance ?? 0;
}

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const balance = user ? await getCredits(user.id) : null;

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm font-bold tracking-tight text-ani-white hover:opacity-80 transition-opacity"
        >
          Ani On Call
        </Link>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <span
                className="text-sm font-mono text-ani-copper hidden sm:inline mr-2 cursor-default"
                title="Credits are how you pay for reports. Each analysis type costs a set amount — you can buy more any time."
              >
                {balance} {balance === 1 ? "credit" : "credits"}
              </span>
              <Link
                href="/outcomes"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden sm:inline-block"
              >
                What Ani Checks
              </Link>
              <Link
                href="/buy"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Buy credits
              </Link>
              <form action="/api/auth/sign-out" method="POST">
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/outcomes"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden sm:inline-block"
              >
                What Ani Checks
              </Link>
              <Link
                href="/buy"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/sign-in"
                className="text-sm px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
