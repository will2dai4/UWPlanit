import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-white/10 border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link className="font-semibold tracking-tight text-white" href="/">
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-300">
          <Link href="/">Home</Link>
          <a href={siteConfig.links.repository} rel="noreferrer" target="_blank">
            Repository
          </a>
        </nav>
      </div>
    </header>
  );
}
